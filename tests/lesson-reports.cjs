const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');

// Execute actual route handlers with isolated auth, DB and Telegram boundaries.
function fixture() {
  const state = { mentor: { id: randomUUID(), name: 'QA 강사' }, admin: false, rows: [], sends: 0, telegramOk: true };
  const db = {
    rpc: async () => ({ data: true }),
    from() {
      let fields = '*', filters = [], inserted, patch, single = false;
      const query = {
        select(value) { fields = value; return query; },
        eq(key, value) { filters.push(row => row[key] === value); return query; },
        order() { return query; }, range() { return query; },
        insert(value) { inserted = value; return query; },
        update(value) { patch = value; return query; },
        single() { single = true; return query; }, maybeSingle() { single = true; return query; },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            if (inserted) {
              if (state.rows.some(r => r.mentor_id === inserted.mentor_id && r.submission_id === inserted.submission_id)) return { error: { code: '23505' } };
              state.rows.push({ ...inserted, id: randomUUID(), status: 'new', admin_memo: '', notification_status: 'pending' });
            }
            let rows = state.rows.filter(row => filters.every(f => f(row)));
            if (inserted) rows = rows.slice(-1);
            if (patch) rows.forEach(row => Object.assign(row, patch));
            const output = rows.map(row => fields.startsWith('*') ? { ...row } : Object.fromEntries(fields.split(',').map(k => [k, row[k]])));
            return { data: single ? output[0] ?? null : output, count: output.length };
          }).then(resolve, reject);
        },
      };
      return query;
    },
  };
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const localRequire = name => {
      if (name === 'server-only') return {};
      if (name.endsWith('/mentorAuth')) return { getAuthedMentor: async () => state.mentor };
      if (name.endsWith('/adminAuth')) return { isAdminAuthed: async () => state.admin };
      if (name.endsWith('/supabase')) return { getSupabaseAdmin: () => db };
      if (name.startsWith('@/')) return load(path.join('src', name.slice(2) + '.ts'));
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      return require(name);
    };
    vm.runInNewContext(`(function(require,module,exports){${source}\n})`, {
      Request, Response, URL, TextEncoder, AbortSignal, console, Buffer,
      process: { env: { TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_CHAT_ID: 'test' } },
      fetch: async () => { state.sends++; return { ok: state.telegramOk, json: async () => ({ ok: state.telegramOk }) }; },
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  const teacher = load('src/app/api/teacher/lesson-reports/route.ts');
  const admin = load('src/app/api/admin/lesson-reports/[id]/route.ts');
  const payload = { submission_id: randomUUID(), lesson_date: '2026-09-01', student_name: '검증 학생', subject: '수학', summary: '분수 복습', progress: 'p.10', comment: '과제 3문제' };
  const req = (body = payload, origin = 'https://test.local') => new Request('https://test.local/api/teacher/lesson-reports', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(body) });
  return { state, teacher, admin, payload, req };
}

test('requires teacher auth and rejects cross-origin writes', async () => {
  const f = fixture();
  assert.equal((await f.teacher.POST(f.req(f.payload, 'https://other.test'))).status, 403);
  f.state.mentor = null;
  assert.equal((await f.teacher.POST(f.req())).status, 401);
  assert.equal((await f.teacher.GET(new Request('https://test.local'))).status, 401);
  assert.equal(f.state.rows.length, 0);
});
test('validates required fields, size and real completed dates', async () => {
  for (const patch of [{ summary: ' ' }, { summary: 'x'.repeat(1501) }, { lesson_date: '2026-02-30' }, { lesson_date: '2099-01-01' }, { submission_id: 'bad' }]) {
    const f = fixture(); assert.equal((await f.teacher.POST(f.req({ ...f.payload, ...patch }))).status, 400); assert.equal(f.state.rows.length, 0);
  }
});
test('saves once, deduplicates retries, rejects changed retry content', async () => {
  const f = fixture();
  assert.equal((await f.teacher.POST(f.req())).status, 201);
  assert.equal((await f.teacher.POST(f.req())).status, 200);
  assert.equal(f.state.rows.length, 1); assert.equal(f.state.sends, 1);
  assert.equal((await f.teacher.POST(f.req({ ...f.payload, summary: 'changed' }))).status, 409);
});
test('teacher cannot choose author or expose admin-only fields; only own records returned', async () => {
  const f = fixture();
  const response = await f.teacher.POST(f.req({ ...f.payload, mentor_id: 'other', admin_memo: 'injected', status: 'reviewed' }));
  const result = await response.json();
  assert.equal(result.report.mentor_id, f.state.mentor.id); assert.equal(result.report.status, 'new');
  assert.equal('admin_memo' in result.report, false); assert.equal('notification_status' in result.report, false);
  f.state.rows.push({ mentor_id: 'other', id: randomUUID(), summary: 'private' });
  const listed = await (await f.teacher.GET(new Request('https://test.local'))).json();
  assert.equal(listed.reports.length, 1); assert.equal('admin_memo' in listed.reports[0], false);
});
test('Telegram failure leaves saved record and retryable failure state', async () => {
  const f = fixture(); f.state.telegramOk = false;
  assert.equal((await f.teacher.POST(f.req())).status, 201);
  assert.equal(f.state.rows[0].notification_status, 'failed');
});
test('admin edit requires auth, validates status, preserves teacher content', async () => {
  const f = fixture(); await f.teacher.POST(f.req()); const id = f.state.rows[0].id;
  const context = { params: Promise.resolve({ id }) };
  assert.equal((await f.admin.PATCH(f.req({ status: 'reviewed' }), context)).status, 401);
  f.state.admin = true;
  assert.equal((await f.admin.PATCH(f.req({ status: 'invalid' }), context)).status, 400);
  assert.equal((await f.admin.PATCH(f.req({ status: 'follow_up', admin_memo: '전화 상담', summary: 'overwrite' }), context)).status, 200);
  assert.equal(f.state.rows[0].admin_memo, '전화 상담'); assert.equal(f.state.rows[0].summary, f.payload.summary);
});
