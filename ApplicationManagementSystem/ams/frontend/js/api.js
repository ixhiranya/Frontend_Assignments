// api.js — Central HTTP client with JWT injection
const API_BASE = window.location.origin + '/api';

function getToken()    { return localStorage.getItem('ams_token'); }
function getUser()     { try { return JSON.parse(localStorage.getItem('ams_user')); } catch { return null; } }
function clearAuth()   { localStorage.removeItem('ams_token'); localStorage.removeItem('ams_user'); }

async function request(method, endpoint, data = null, isFormData = false) {
  const token   = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (data && method !== 'GET') opts.body = isFormData ? data : JSON.stringify(data);

  try {
    const res  = await fetch(`${API_BASE}${endpoint}`, opts);
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); window.location.href = '/login.html'; return null; }
    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    showToast('Network error. Cannot reach server.', 'error');
    return { ok: false, data: { message: 'Network error' } };
  }
}

const api = {
  get:    (url)             => request('GET',    url),
  post:   (url, data)       => request('POST',   url, data),
  put:    (url, data)       => request('PUT',    url, data),
  delete: (url)             => request('DELETE', url),
  upload: (url, formData)   => request('POST',   url, formData, true),
};

// ── Toast Notification ───────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-amber-500' };
  const icons  = {
    success: '✓', error: '✕', info: 'ℹ', warning: '⚠'
  };

  const toast = document.createElement('div');
  toast.className = `${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto text-sm font-medium transition-all duration-300 translate-x-10 opacity-0`;
  toast.innerHTML = `<span class="text-lg font-bold">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-10', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-10');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal helpers ────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function confirmDialog(message) { return window.confirm(message); }

// ── Format helpers ────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(2) + ' MB';
}

function requireAuth(requiredRole = null) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) { window.location.href = '/login.html'; return null; }
  if (requiredRole && user.role !== requiredRole) { window.location.href = '/login.html'; return null; }
  return user;
}

function logout() { clearAuth(); window.location.href = '/login.html'; }

// Status badge
function statusBadge(status) {
  if (status === 'Submitted') return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">✓ Submitted</span>`;
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Not Applied</span>`;
}
