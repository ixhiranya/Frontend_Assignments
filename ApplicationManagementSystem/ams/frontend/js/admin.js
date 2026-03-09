// admin.js
const user = requireAuth('Admin');
if (user) {
  document.getElementById('sidebarName').textContent = user.full_name || user.username;
  document.getElementById('headerName').textContent  = user.full_name || user.username;
  document.getElementById('avatarInitials').textContent = (user.full_name || user.username)[0].toUpperCase();
  initAdmin();
}

async function initAdmin() {
  await loadStats();
  await loadRecentApplications();
}

// ── Tab Switching ────────────────────────────────────────────
function showTab(tab) {
  ['overview','forms','applications'].forEach(t => {
    document.getElementById(`section-${t}`).classList.toggle('hidden', t !== tab);
    const link = document.getElementById(`tab-${t}`);
    if (link) link.classList.toggle('active', t === tab);
  });

  const titles = { overview:'Dashboard Overview', forms:'Application Forms', applications:'All Applications' };
  document.getElementById('pageTitle').textContent = titles[tab] || tab;

  if (tab === 'forms')        loadForms();
  if (tab === 'applications') loadApplications();
}

// ── Stats ────────────────────────────────────────────────────
async function loadStats() {
  const res = await api.get('/admin/stats');
  if (!res?.ok) return;
  const s = res.data.data;

  const cards = [
    { label:'Active Forms',      value: s.total_forms,    icon:'📋', color:'from-indigo-500 to-indigo-600' },
    { label:'Total Clients',     value: s.total_clients,  icon:'👥', color:'from-violet-500 to-violet-600' },
    { label:'Total Applications',value: s.total_apps,     icon:'📄', color:'from-blue-500 to-blue-600' },
    { label:'Submitted',         value: s.submitted_apps, icon:'✅', color:'from-emerald-500 to-emerald-600' },
  ];

  document.getElementById('statsGrid').innerHTML = cards.map(c => `
    <div class="stat-card flex items-center gap-4 border-indigo-200 border border-solid hover:bg-indigo-100 transition ">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl shadow-xs">${c.icon}</div>
      <div>
        <div class="text-2xl font-extrabold text-slate-800">${c.value}</div>
        <div class="text-xs text-slate-500 font-medium mt-0.5">${c.label}</div>
      </div>
    </div>
  `).join('');
}

// ── Recent Applications ──────────────────────────────────────
async function loadRecentApplications() {
  const res = await api.get('/admin/applications');
  if (!res?.ok) return;
  const apps = (res.data.data || []).slice(0, 8);
  const tbody = document.getElementById('recentAppsTable');
  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">No applications yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = apps.map((a, i) => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4 text-slate-400 font-medium">${i+1}</td>
      <td class="px-6 py-4 font-semibold text-slate-800">${a.applicant_name || a.username}</td>
      <td class="px-6 py-4 text-slate-600">${a.form_name}</td>
      <td class="px-6 py-4">${statusBadge(a.status)}</td>
      <td class="px-6 py-4 text-slate-500">${formatDate(a.submitted_at)}</td>
      <td class="px-6 py-4"><button onclick="viewApplication(${a.application_id})" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs">View →</button></td>
    </tr>
  `).join('');
}

// ── Forms ────────────────────────────────────────────────────
async function loadForms() {
  const res = await api.get('/forms');
  if (!res?.ok) { showToast('Failed to load forms.','error'); return; }
  const forms = res.data.data || [];
  const tbody = document.getElementById('formsTable');
  if (forms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No forms created yet. Click "+ Create Form" to get started.</td></tr>`;
    return;
  }
  tbody.innerHTML = forms.map((f, i) => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4 text-slate-400 font-medium">${i+1}</td>
      <td class="px-6 py-4 font-semibold text-slate-800">${f.form_name}</td>
      <td class="px-6 py-4"><code class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">FORM-${f.form_id}</code></td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">${f.applicant_count} applicant${f.applicant_count!==1?'s':''}</span>
      </td>
      <td class="px-6 py-4">${f.is_active ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Active</span>' : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Inactive</span>'}</td>
      <td class="px-6 py-4 text-slate-500 text-xs">${formatDate(f.created_at)}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <a href="/formBuilder.html?formId=${f.form_id}" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Edit</a>
          <button onclick="deleteForm(${f.form_id})" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Applications ─────────────────────────────────────────────
async function loadApplications() {
  const res = await api.get('/admin/applications');
  if (!res?.ok) return;
  const apps = res.data.data || [];
  const tbody = document.getElementById('applicationsTable');
  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No applications submitted yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = apps.map(a => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4"><code class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">APP-${a.application_id}</code></td>
      <td class="px-6 py-4 font-semibold text-slate-800">${a.applicant_name || a.username}</td>
      <td class="px-6 py-4 text-slate-600">${a.form_name}</td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">📎 ${a.doc_count} file${a.doc_count!==1?'s':''}</span>
      </td>
      <td class="px-6 py-4">${statusBadge(a.status)}</td>
      <td class="px-6 py-4 text-slate-500 text-xs">${formatDate(a.submitted_at)}</td>
      <td class="px-6 py-4"><button onclick="viewApplication(${a.application_id})" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Review</button></td>
    </tr>
  `).join('');
}

// ── View Application Detail ───────────────────────────────────
async function viewApplication(id) {
  const res = await api.get(`/admin/applications/${id}`);
  if (!res?.ok) { showToast('Failed to load application.','error'); return; }
  const a   = res.data.data;

  document.getElementById('appDetailContent').innerHTML = `
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-50 rounded-2xl p-4">
        <div class="text-xs text-slate-400 font-medium mb-1">Application ID</div>
        <div class="font-bold text-slate-800">APP-${a.application_id}</div>
      </div>
      <div class="bg-slate-50 rounded-2xl p-4">
        <div class="text-xs text-slate-400 font-medium mb-1">Status</div>
        <div>${statusBadge(a.status)}</div>
      </div>
      <div class="bg-slate-50 rounded-2xl p-4">
        <div class="text-xs text-slate-400 font-medium mb-1">Applicant</div>
        <div class="font-semibold text-slate-800">${a.applicant_name || a.username}</div>
      </div>
      <div class="bg-slate-50 rounded-2xl p-4">
        <div class="text-xs text-slate-400 font-medium mb-1">Form</div>
        <div class="font-semibold text-slate-800">${a.form_name}</div>
      </div>
      <div class="bg-slate-50 rounded-2xl p-4 col-span-2">
        <div class="text-xs text-slate-400 font-medium mb-1">Submitted At</div>
        <div class="font-semibold text-slate-800">${a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</div>
      </div>
    </div>

    <h4 class="font-bold text-slate-800 mb-3">Uploaded Documents (${a.uploaded_documents?.length || 0})</h4>
    ${a.uploaded_documents?.length > 0 ? `
      <div class="space-y-2">
        ${a.uploaded_documents.map(d => `
          <div class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div>
              <div class="font-semibold text-slate-800 text-sm">${d.document_name}</div>
              <div class="text-xs text-slate-400 mt-0.5">${d.file_name} · ${formatFileSize(d.file_size)}</div>
            </div>
            <a href="/api/upload/download/${d.upload_id}" 
               target="_blank"
               onclick="return downloadWithAuth(${d.upload_id})"
               class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition">
              ⬇ Download
            </a>
          </div>
        `).join('')}
      </div>
    ` : `<p class="text-slate-400 text-sm text-center py-6">No documents uploaded.</p>`}
  `;
  openModal('appDetailModal');
}

async function downloadWithAuth(uploadId) {
  const token = getToken();
  const res   = await fetch(`/api/upload/download/${uploadId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) { showToast('Download failed.','error'); return false; }
  const blob  = await res.blob();
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  const cd    = res.headers.get('content-disposition') || '';
  const match = cd.match(/filename="?(.+?)"?$/);
  a.href      = url;
  a.download  = match ? match[1] : 'download';
  a.click();
  URL.revokeObjectURL(url);
  return false;
}

// ── Create Form ───────────────────────────────────────────────
function openCreateFormModal() { openModal('createFormModal'); }

async function createForm() {
  const name = document.getElementById('newFormName').value.trim();
  const desc = document.getElementById('newFormDesc').value.trim();
  if (!name) { showToast('Form name is required.','error'); return; }

  const res = await api.post('/forms', { form_name: name, description: desc });
  if (res?.ok) {
    showToast('Form created!','success');
    closeModal('createFormModal');
    document.getElementById('newFormName').value = '';
    document.getElementById('newFormDesc').value = '';
    // Navigate to form builder
    window.location.href = `/formBuilder.html?formId=${res.data.form_id}`;
  } else {
    showToast(res?.data?.message || 'Failed to create form.','error');
  }
}

async function deleteForm(id) {
  if (!confirmDialog('Delete this form? This will also delete all related applications.')) return;
  const res = await api.delete(`/forms/${id}`);
  if (res?.ok) { showToast('Form deleted.','success'); loadForms(); }
  else showToast(res?.data?.message || 'Delete failed.','error');
}
