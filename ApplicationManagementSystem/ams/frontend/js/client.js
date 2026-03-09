// client.js
const user = requireAuth('Client');
let myApplications = [];

if (user) {
  document.getElementById('welcomeName').textContent = user.full_name || user.username;
  document.getElementById('navName').textContent     = user.full_name || user.username;
  document.getElementById('navInitial').textContent  = (user.full_name || user.username)[0].toUpperCase();
  initClient();
}

async function initClient() {
  const [formsRes, appsRes] = await Promise.all([
    api.get('/forms'),
    api.get('/applications'),
  ]);

  const forms = formsRes?.data?.data || [];
  myApplications = appsRes?.data?.data || [];

  // Stats
  document.getElementById('statTotal').textContent     = forms.length;
  document.getElementById('statApplied').textContent   = myApplications.length;
  document.getElementById('statSubmitted').textContent = myApplications.filter(a => a.status === 'Submitted').length;

  renderMyApplications();
  renderForms(forms);
}

function renderMyApplications() {
  if (myApplications.length === 0) return;
  document.getElementById('myAppsSection').classList.remove('hidden');
  const tbody = document.getElementById('myAppsTable');
  tbody.innerHTML = myApplications.map((a, i) => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4 text-slate-400 font-medium">${i+1}</td>
      <td class="px-6 py-4 font-semibold text-slate-800">${a.form_name}</td>
      <td class="px-6 py-4"><code class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">FORM-${a.form_id}</code></td>
      <td class="px-6 py-4">${statusBadge(a.status)}</td>
      <td class="px-6 py-4 text-slate-400 text-xs">${formatDate(a.submitted_at)}</td>
      <td class="px-6 py-4">
        ${a.status !== 'Submitted'
          ? `<a href="/apply-form.html?applicationId=${a.application_id}" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Continue →</a>`
          : `<span class="text-xs text-slate-400 font-medium">Completed</span>`
        }
      </td>
    </tr>
  `).join('');
}

function renderForms(forms) {
  const tbody = document.getElementById('formsTable');
  if (forms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-12 text-slate-400">No forms available at this time.</td></tr>`;
    return;
  }

  tbody.innerHTML = forms.map((f, i) => {
    const myApp = myApplications.find(a => a.form_id === f.form_id);
    const appStatus = myApp ? myApp.status : 'Not Applied';
    const isSubmitted = appStatus === 'Submitted';

    return `<tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4 text-slate-400 font-medium">${i+1}</td>
      <td class="px-6 py-4">
        <div class="font-semibold text-slate-800">${f.form_name}</div>
        ${f.description ? `<div class="text-xs text-slate-400 mt-0.5">${f.description}</div>` : ''}
      </td>
      <td class="px-6 py-4"><code class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">FORM-${f.form_id}</code></td>
      <td class="px-6 py-4">${statusBadge(appStatus)}</td>
      <td class="px-6 py-4">
        ${isSubmitted
          ? `<span class="px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-xs font-semibold border border-slate-200">Submitted ✓</span>`
          : myApp
            ? `<a href="/apply-form.html?applicationId=${myApp.application_id}" class="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition">Continue</a>`
            : `<button onclick="applyForForm(${f.form_id})" class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-md shadow-indigo-200">Apply Now</button>`
        }
      </td>
    </tr>`;
  }).join('');
}

async function applyForForm(formId) {
  const res = await api.post('/applications', { form_id: formId });
  if (res?.ok) {
    const appId = res.data.data?.application_id;
    window.location.href = `/apply-form.html?applicationId=${appId}`;
  } else {
    showToast(res?.data?.message || 'Failed to start application.', 'error');
  }
}
