const API_BASE = 'https://bbs.tangxinvip.ccwu.cc';
function getToken() { return localStorage.getItem('forum_token') || ''; }
function setToken(t) { localStorage.setItem('forum_token', t); }
function clearToken() { localStorage.removeItem('forum_token'); }
async function request(path, options) {
  options = options || {};
  const headers = Object.assign({ 'Content-Type': 'application/json', 'X-Client': 'web' }, options.headers || {});
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  try {
    const r = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    return await r.json();
  } catch (e) { return { ok: false, error: '网络错误: ' + e.message }; }
}
const API = {
  register: (u, p) => request('/api/register', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }),
  login: (u, p) => request('/api/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }),
  logout: () => request('/api/logout', { method: 'POST' }),
  me: () => request('/api/me'),
  posts: (page) => request('/api/posts?page=' + (page || 1)),
  post: (id) => request('/api/posts/' + id),
  createPost: (title, content) => request('/api/posts', { method: 'POST', body: JSON.stringify({ title, content }) }),
  replies: (pid) => request('/api/replies?post_id=' + pid),
  createReply: (pid, content) => request('/api/replies', { method: 'POST', body: JSON.stringify({ post_id: pid, content }) }),
  pending: () => request('/api/admin/pending'),
  approve: (type, id, action) => request('/api/admin/approve', { method: 'POST', body: JSON.stringify({ type, id, action }) }),
  ban: (id, reason) => request('/api/admin/ban', { method: 'POST', body: JSON.stringify({ id, reason }) }),
  adminUsers: () => request('/api/admin/users')
};
function toast(msg, isError) {
  let el = document.getElementById('__toast');
  if (!el) { el = document.createElement('div'); el.id = '__toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(el.__timer);
  el.__timer = setTimeout(() => el.className = 'toast', 2500);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatTime(s) { if (!s) return ''; return s.replace('T', ' ').slice(0, 19); }
async function buildNav() {
  const nav = document.createElement('div');
  nav.className = 'nav';
  const me = getToken() ? await API.me() : { ok: false };
  const isAdmin = me.ok && me.user && me.user.role === 'admin';
  const logged = me.ok && me.user;
  nav.innerHTML = '<a href="/index.html" class="logo">BCSIMP 论坛</a><div class="links">' +
    '<a href="/index.html">首页</a>' +
    (logged ? '<a href="/new.html">发帖</a>' : '') +
    (isAdmin ? '<a href="/admin.html">管理</a>' : '') +
    (logged ? '<span style="color:#00ffc8">' + escapeHtml(me.user.username) + '</span><a href="#" id="__logout">登出</a>' : '<a href="/login.html">登录</a>') +
    '</div>';
  document.body.insertBefore(nav, document.body.firstChild);
  const logout = document.getElementById('__logout');
  if (logout) logout.onclick = async (e) => { e.preventDefault(); await API.logout(); clearToken(); location.href = '/index.html'; };
}
