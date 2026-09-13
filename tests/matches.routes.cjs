const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');

function fixture() {
  const state = { admin: false, result: { data: null }, filters: [], written: null };
  const query = {
    select() { return query; }, order() { return query; }, range() { return query; }, ilike() { return query; },
    eq(key, value) { state.filters.push([key,value]); return query; },
    insert(value) { state.written = value; return query; }, update(value) { state.written = value; return query; },
    single() { return query; }, maybeSingle() { return query; },
    then(resolve, reject) { return Promise.resolve(state.result).then(resolve, reject); },
  };
  const cache = new Map();
  function load(file) {
    file = path.resolve(file); if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const localRequire = name => {
      if (name === 'server-only') return {};
      if (name.endsWith('/adminAuth')) return { isAdminAuthed: async () => state.admin };
      if (name.endsWith('/supabase')) return { getSupabaseAdmin: () => ({ from: () => query }) };
      if (name.startsWith('@/')) return load(path.join('src', name.slice(2) + '.ts'));
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      return require(name);
    };
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { Request, Response, URL, TextEncoder, AbortSignal, console, Buffer, process })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  const routes = load('src/app/api/admin/matches/route.ts');
  const edit = load('src/app/api/admin/matches/[id]/route.ts');
  const payload = { id: randomUUID(), mentor_id: randomUUID(), application_id: randomUUID(), student_name: '', status: 'active', started_on: '', ended_on: '', admin_memo: '', version: 1 };
  const request = (body = payload, origin = 'https://local.test') => new Request('https://local.test/api/admin/matches', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(body) });
  return { state, routes, edit, payload, request };
}
test('matching routes require administrator and reject cross-origin mutations', async () => {
  const f = fixture();
  assert.equal((await f.routes.GET(new Request('https://local.test'))).status,401);
  assert.equal((await f.routes.POST(f.request())).status,401);
  assert.equal((await f.edit.PATCH(f.request(), { params: Promise.resolve({ id: f.payload.id }) })).status,401);
  f.state.admin = true;
  assert.equal((await f.routes.POST(f.request(f.payload,'https://other.test'))).status,403);
  assert.equal(f.state.written,null);
});
test('dates and relationship IDs validated; unknown student and dates remain blank', async () => {
  for (const patch of [{mentor_id:'bad'}, {status:'invalid'}, {started_on:'2026-02-30'}, {ended_on:'2026-09-01'}, {status:'ended',started_on:'2026-09-02',ended_on:'2026-09-01'}]) {
    const f=fixture(); f.state.admin=true;
    assert.equal((await f.routes.POST(f.request({...f.payload,...patch}))).status,400); assert.equal(f.state.written,null);
  }
  const f=fixture();f.state.admin=true;f.state.result={data:{id:f.payload.id}};
  assert.equal((await f.routes.POST(f.request())).status,201);
  assert.equal(f.state.written.student_name,'');assert.equal(f.state.written.started_on,null);assert.equal(f.state.written.ended_on,null);
});
test('edit uses version guard and rejects stale writes', async () => {
  const f=fixture();f.state.admin=true; const context={params:Promise.resolve({id:f.payload.id})};
  assert.equal((await f.edit.PATCH(f.request(),context)).status,409);
  assert.ok(f.state.filters.some(([key,value])=>key==='version' && value===1));
  assert.equal(f.state.written.version,2);
  f.state.result={data:{...f.payload,status:'ended',version:2}};
  assert.equal((await f.edit.PATCH(f.request({...f.payload,status:'ended'}),context)).status,200);
});
test('duplicate open matches and broken references return useful errors', async () => {
  const f=fixture();f.state.admin=true;const context={params:Promise.resolve({id:f.payload.id})};
  f.state.result={error:{code:'23505'}};
  assert.equal((await f.edit.PATCH(f.request(),context)).status,409);
  f.state.result={error:{code:'23503'}};
  assert.equal((await f.routes.POST(f.request())).status,400);
});
test('list rejects malformed pagination and filters before querying', async () => {
  const f=fixture();f.state.admin=true;
  for(const query of ['page=-1','page=1.2','status=bad','mentor_id=bad']) assert.equal((await f.routes.GET(new Request('https://local.test?'+query))).status,400);
});
