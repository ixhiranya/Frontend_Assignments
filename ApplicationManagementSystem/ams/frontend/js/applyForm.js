// applyForm.js
const user          = requireAuth('Client');
const params        = new URLSearchParams(window.location.search);
const applicationId = params.get('applicationId');

let applicationData = null;
let formStructure   = null;
let uploadedDocs    = {};  // { document_id: { upload_id, file_name, file_size } }

if (!applicationId) { window.location.href = '/client.html'; }
if (user) initApplyForm();

async function initApplyForm() {
  const res = await api.get(`/applications/${applicationId}`);
  if (!res?.ok) { showToast('Application not found.','error'); window.location.href='/client.html'; return; }

  applicationData = res.data.data;

  // Index already uploaded docs
  (applicationData.uploaded_documents || []).forEach(d => {
    uploadedDocs[d.document_id] = d;
  });

  // Load form structure
  const formRes = await api.get(`/forms/${applicationData.form_id}/detail`);
  if (!formRes?.ok) { showToast('Failed to load form.','error'); return; }
  formStructure = formRes.data.data;

  document.getElementById('pageTitle').textContent    = formStructure.form_name;
  document.getElementById('pageSubtitle').textContent = `Application ID: APP-${applicationId} · ${applicationData.applicant_name || user.full_name}`;
  document.getElementById('progressBar').style.display = 'block';

  if (applicationData.status === 'Submitted') {
    document.getElementById('submittedBanner').classList.remove('hidden');
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').textContent = '✓ Already Submitted';
  }

  renderForm();
  updateProgress();
}

function renderForm() {
  const sections = formStructure.sections || [];
  const isSubmitted = applicationData.status === 'Submitted';

  if (sections.length === 0) {
    document.getElementById('formContent').innerHTML = `
      <div class="text-center py-20 text-slate-400">
        <p class="text-sm">This form has no sections configured yet.</p>
      </div>`;
    return;
  }

  document.getElementById('formContent').innerHTML = sections.map((section, idx) => `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
      <div class="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-100 flex items-center gap-3">
        <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center">${idx+1}</div>
        <div>
          <h3 class="font-bold text-slate-800">${section.section_name}</h3>
          <p class="text-xs text-slate-400">${section.documents?.length || 0} document${section.documents?.length!==1?'s':''} required</p>
        </div>
      </div>

      <div class="p-6 space-y-5">
        ${section.documents?.length > 0
          ? section.documents.map(doc => renderDocumentUpload(doc, isSubmitted)).join('')
          : `<p class="text-slate-400 text-sm text-center py-4">No documents configured for this section.</p>`
        }
      </div>
    </div>
  `).join('');
}

function renderDocumentUpload(doc, isSubmitted) {
  const uploaded = uploadedDocs[doc.document_id];
  const isUploaded = !!uploaded;

  return `
    <div class="doc-row" data-doc-id="${doc.document_id}" data-mandatory="${doc.is_mandatory}">
      <div class="flex items-start justify-between mb-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-800 text-sm">${doc.document_name}</span>
            ${doc.is_mandatory
              ? `<span class="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded">Required</span>`
              : `<span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded">Optional</span>`
            }
          </div>
          <div class="text-xs text-slate-400 mt-0.5">
            Accepted: ${doc.allowed_file_format} · Max: ${(doc.max_file_size/1024/1024).toFixed(0)}MB
          </div>
        </div>
      </div>

      ${isSubmitted
        ? isUploaded
          ? `<div class="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
               <span class="text-emerald-500">✓</span>
               <div class="flex-1">
                 <div class="font-medium text-emerald-800 text-sm">${uploaded.file_name}</div>
                 <div class="text-xs text-emerald-600">${formatFileSize(uploaded.file_size)}</div>
               </div>
             </div>`
          : `<div class="px-4 py-3 bg-slate-50 rounded-xl text-slate-400 text-sm">Not uploaded</div>`
        : `<label class="upload-zone ${isUploaded ? 'uploaded' : ''} rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer text-center" id="zone-${doc.document_id}">
             <input type="file" class="hidden" id="file-${doc.document_id}"
               accept=".${doc.allowed_file_format.split(',').join(',.')}"
               onchange="handleFileSelect(this, ${doc.document_id}, ${doc.max_file_size}, '${doc.allowed_file_format}')"/>
             <div id="zone-inner-${doc.document_id}">
               ${isUploaded
                 ? `<div class="flex items-center gap-3">
                      <span class="text-2xl">✅</span>
                      <div class="text-left">
                        <div class="font-semibold text-emerald-700 text-sm">${uploaded.file_name}</div>
                        <div class="text-xs text-emerald-600">${formatFileSize(uploaded.file_size)} · Click to replace</div>
                      </div>
                    </div>`
                 : `<div>
                      <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                      <p class="text-sm font-semibold text-slate-500">Click to upload</p>
                      <p class="text-xs text-slate-400 mt-1">or drag and drop · ${doc.allowed_file_format}</p>
                    </div>`
               }
             </div>
           </label>
           <div id="upload-status-${doc.document_id}" class="mt-2 text-xs font-medium hidden"></div>`
      }
    </div>
  `;
}

async function handleFileSelect(input, docId, maxSize, allowedFormats) {
  const file = input.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = allowedFormats.split(',').map(f => f.trim().toLowerCase());

  if (!allowed.includes(ext)) {
    showToast(`File type .${ext} not allowed. Accepted: ${allowedFormats}`, 'error');
    input.value = '';
    return;
  }
  if (file.size > maxSize) {
    showToast(`File too large. Max: ${(maxSize/1024/1024).toFixed(0)}MB`, 'error');
    input.value = '';
    return;
  }

  const statusEl = document.getElementById(`upload-status-${docId}`);
  const zone     = document.getElementById(`zone-${docId}`);
  statusEl.classList.remove('hidden');
  statusEl.className = 'mt-2 text-xs font-medium text-indigo-600';
  statusEl.textContent = '⏳ Uploading...';

  const formData = new FormData();
  formData.append('file',           file);
  formData.append('application_id', applicationId);
  formData.append('document_id',    docId);

  const res = await api.upload('/upload', formData);

  if (res?.ok) {
    uploadedDocs[docId] = {
      upload_id: res.data.data.upload_id,
      file_name: file.name,
      file_size: file.size
    };

    zone.classList.add('uploaded');
    document.getElementById(`zone-inner-${docId}`).innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl">✅</span>
        <div class="text-left">
          <div class="font-semibold text-emerald-700 text-sm">${file.name}</div>
          <div class="text-xs text-emerald-600">${formatFileSize(file.size)} · Click to replace</div>
        </div>
      </div>`;

    statusEl.className = 'mt-2 text-xs font-medium text-emerald-600';
    statusEl.textContent = '✓ Uploaded successfully';
    showToast('File uploaded.', 'success');
    updateProgress();
  } else {
    statusEl.className = 'mt-2 text-xs font-medium text-red-500';
    statusEl.textContent = res?.data?.message || 'Upload failed.';
    showToast(res?.data?.message || 'Upload failed.', 'error');
    input.value = '';
  }
}

function updateProgress() {
  const allDocs = formStructure?.sections?.flatMap(s => s.documents || []) || [];
  if (allDocs.length === 0) return;

  const uploaded = allDocs.filter(d => uploadedDocs[d.document_id]).length;
  const pct      = Math.round((uploaded / allDocs.length) * 100);

  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${uploaded}/${allDocs.length} uploaded`;
}

async function submitApplication() {
  // Check mandatory docs
  const allDocs  = formStructure?.sections?.flatMap(s => s.documents || []) || [];
  const missing  = allDocs.filter(d => d.is_mandatory && !uploadedDocs[d.document_id]);

  if (missing.length > 0) {
    showToast(`Missing required documents: ${missing.map(d => d.document_name).join(', ')}`, 'error', 5000);
    return;
  }

  if (!confirmDialog('Submit your application? You cannot upload more documents after submission.')) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const res = await api.post(`/applications/${applicationId}/submit`);
  if (res?.ok) {
    showToast('Application submitted successfully! 🎉', 'success', 4000);
    setTimeout(() => window.location.href = '/client.html', 2000);
  } else {
    showToast(res?.data?.message || 'Submission failed.', 'error');
    btn.disabled = false;
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Submit Application`;
  }
}

// Drag and drop support
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop',     (e) => {
  e.preventDefault();
  const zone = e.target.closest('label[id^="zone-"]');
  if (!zone) return;
  const docId = zone.id.replace('zone-','');
  const input = document.getElementById(`file-${docId}`);
  if (input && e.dataTransfer.files[0]) {
    const dt = new DataTransfer();
    dt.items.add(e.dataTransfer.files[0]);
    input.files = dt.files;
    input.dispatchEvent(new Event('change'));
  }
});
