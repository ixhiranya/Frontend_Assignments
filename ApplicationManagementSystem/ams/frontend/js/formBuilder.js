// formBuilder.js
const user = requireAuth('Admin');
const formId = new URLSearchParams(window.location.search).get('formId');
let formData = null;
let masterDocuments = [];

if (user) {
  if (!formId) {
    initFormSelector();
  } else {
    initBuilder();
  }
}

// ── Form Selector (when no formId) ────────────────────────
async function initFormSelector() {
  document.getElementById('builderTitle').textContent = 'Form Builder';
  document.getElementById('formIdLabel').textContent = 'Select or create a form';
  document.getElementById('formStatus').innerHTML = '<a href="/admin.html" class="text-indigo-500 hover:text-indigo-700">Back to Admin</a>';
  
  const mainContent = document.querySelector('.max-w-4xl');
  mainContent.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Create New Form -->
      <div class="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:shadow-md transition" onclick="openCreateNewFormModal()">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl mb-3 shadow-lg">+</div>
        <h3 class="font-bold text-slate-800 text-lg mb-1">Create New Form</h3>
        <p class="text-slate-600 text-sm">Build a new application form from scratch</p>
      </div>

      <!-- Select Existing Form -->
      <div id="existingFormsContainer"></div>
    </div>

    <div id="createFormModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Create New Form</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Form Name *</label>
            <input type="text" id="newFormName" placeholder="Enter form name" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"/>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea id="newFormDesc" placeholder="Form description (optional)" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"></textarea>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button onclick="closeCreateFormModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancel</button>
          <button onclick="createAndEditForm()" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-md hover:shadow-lg">Create</button>
        </div>
      </div>
    </div>
  `;

  loadExistingForms();
}

function openCreateNewFormModal() {
  document.getElementById('createFormModal').classList.remove('hidden');
}

function closeCreateFormModal() {
  document.getElementById('createFormModal').classList.add('hidden');
}

async function createAndEditForm() {
  const name = document.getElementById('newFormName').value.trim();
  const desc = document.getElementById('newFormDesc').value.trim();
  if (!name) { showToast('Form name is required.','error'); return; }

  const res = await api.post('/forms', { form_name: name, description: desc });
  if (res?.ok) {
    window.location.href = `/formBuilder.html?formId=${res.data.form_id}`;
  } else {
    showToast(res?.data?.message || 'Failed to create form.','error');
  }
}

async function loadExistingForms() {
  const res = await api.get('/forms');
  const forms = res?.data?.data || [];
  const container = document.getElementById('existingFormsContainer');
  
  if (forms.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 class="font-bold text-slate-800 mb-4">Select Existing Form</h3>
      <div class="space-y-2">
        ${forms.map(f => `
          <a href="/formBuilder.html?formId=${f.form_id}" class="block p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div class="font-semibold text-slate-800">${f.form_name}</div>
            <div class="text-xs text-slate-500 mt-1">FORM-${f.form_id} · ${f.applicant_count} applicant${f.applicant_count!==1?'s':''}</div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}



async function initBuilder() {
  const [formRes, docsRes] = await Promise.all([
    api.get(`/forms/${formId}/detail`),
    api.get('/upload/master-documents'),
  ]);

  if (!formRes?.ok) { showToast('Form not found.','error'); window.location.href='/admin.html'; return; }

  formData = formRes.data.data;
  masterDocuments = docsRes?.data?.data || [];

  document.getElementById('builderTitle').textContent = formData.form_name;
  document.getElementById('formIdLabel').textContent  = `FORM-${formData.form_id}`;
  document.getElementById('formStatus').textContent   = formData.is_active ? 'Active' : 'Inactive';
  document.getElementById('editFormName').value       = formData.form_name;
  document.getElementById('editFormDesc').value       = formData.description || '';
  document.getElementById('editFormActive').value     = formData.is_active ? '1' : '0';

  // Populate document select
  const sel = document.getElementById('docSelectId');
  masterDocuments.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.document_id;
    opt.textContent = d.document_name;
    sel.appendChild(opt);
  });

  renderSections(formData.sections || []);
}

function renderSections(sections) {
  const container = document.getElementById('sectionsContainer');
  if (sections.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-slate-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
      <p class="text-sm font-medium">No sections yet.</p>
    </div>`;
    return;
  }

  container.innerHTML = sections.map((s, idx) => `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center">${idx+1}</span>
          <h3 class="font-bold text-slate-800">${s.section_name}</h3>
          <span class="px-2 py-0.5 bg-white rounded-full text-xs font-semibold text-slate-500 border border-slate-200">${s.documents?.length || 0} doc${s.documents?.length!==1?'s':''}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openAddDocModal(${s.section_id})" class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition">
            + Add Document
          </button>
          <button onclick="deleteSection(${s.section_id})" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">Remove</button>
        </div>
      </div>

      <div class="p-4">
        ${s.documents?.length > 0 ? `
          <div class="space-y-2">
            ${s.documents.map(d => `
              <div class="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg ${d.is_mandatory ? 'bg-red-50' : 'bg-slate-100'} flex items-center justify-center text-sm">
                    ${d.is_mandatory ? '📌' : '📎'}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-800 text-sm">${d.document_name}</div>
                    <div class="text-xs text-slate-400 mt-0.5">
                      ${d.allowed_file_format} · max ${(d.max_file_size/1024/1024).toFixed(0)}MB
                      ${d.is_mandatory ? '· <span class="text-red-500 font-semibold">Required</span>' : '· Optional'}
                    </div>
                  </div>
                </div>
                <button onclick="removeDocConfig(${d.config_id})" class="text-slate-300 hover:text-red-500 transition text-lg">✕</button>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="text-slate-400 text-sm text-center py-4">No documents configured. Click "+ Add Document" to add requirements.</p>
        `}
      </div>
    </div>
  `).join('');
}

async function saveFormDetails() {
  const res = await api.put(`/forms/${formId}`, {
    form_name:   document.getElementById('editFormName').value.trim(),
    description: document.getElementById('editFormDesc').value.trim(),
    is_active:   parseInt(document.getElementById('editFormActive').value),
  });
  if (res?.ok) { showToast('Form details saved.','success'); initBuilder(); }
  else showToast(res?.data?.message || 'Save failed.','error');
}

async function addSection() {
  const name = document.getElementById('newSectionName').value.trim();
  if (!name) { showToast('Section name is required.','error'); return; }

  const order = (formData?.sections?.length || 0) + 1;
  const res   = await api.post(`/forms/${formId}/sections`, { section_name: name, display_order: order });
  if (res?.ok) {
    showToast('Section added.','success');
    document.getElementById('newSectionName').value = '';
    initBuilder();
  } else showToast(res?.data?.message || 'Failed.','error');
}

async function deleteSection(sectionId) {
  if (!confirmDialog('Remove this section and all its document configurations?')) return;
  const res = await api.delete(`/forms/${formId}/sections/${sectionId}`);
  if (res?.ok) { showToast('Section removed.','success'); initBuilder(); }
  else showToast('Failed to remove section.','error');
}

function openAddDocModal(sectionId) {
  document.getElementById('docSectionId').value = sectionId;
  document.getElementById('docSelectId').value   = '';
  document.getElementById('docFormats').value    = 'pdf,jpg,jpeg,png';
  document.getElementById('docMaxSize').value    = '5242880';
  document.getElementById('docMandatory').checked = true;
  openModal('addDocModal');
}

async function addDocConfig() {
  const sectionId   = document.getElementById('docSectionId').value;
  const documentId  = document.getElementById('docSelectId').value;
  const formats     = document.getElementById('docFormats').value.trim();
  const maxSize     = document.getElementById('docMaxSize').value;
  const isMandatory = document.getElementById('docMandatory').checked ? 1 : 0;

  if (!documentId) { showToast('Please select a document.','error'); return; }

  const res = await api.post(`/forms/${formId}/documents`, {
    section_id: parseInt(sectionId),
    document_id: parseInt(documentId),
    allowed_file_format: formats,
    max_file_size: parseInt(maxSize),
    is_mandatory: isMandatory,
  });

  if (res?.ok) {
    showToast('Document added.','success');
    closeModal('addDocModal');
    initBuilder();
  } else showToast(res?.data?.message || 'Failed.','error');
}

async function removeDocConfig(configId) {
  if (!confirmDialog('Remove this document requirement?')) return;
  const res = await api.delete(`/forms/documents/config/${configId}`);
  if (res?.ok) { showToast('Removed.','success'); initBuilder(); }
  else showToast('Failed to remove.','error');
}
