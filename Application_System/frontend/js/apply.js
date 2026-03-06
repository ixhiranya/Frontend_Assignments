const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get("id");

async function loadForm() {

  const res = await fetch(`http://127.0.0.1:5000/form/${formId}`);
  const data = await res.json();

  document.getElementById("formTitle").textContent =
    data.form.form_name;

  const form = document.getElementById("dynamicForm");

  let grouped = {};

  data.documents.forEach(doc => {
    if (!grouped[doc.section_name])
      grouped[doc.section_name] = [];

    grouped[doc.section_name].push(doc);
  });

  for (let section in grouped) {

    form.innerHTML += `
      <h3 class="text-xl font-semibold mt-4 mb-2">${section}</h3>
    `;

    grouped[section].forEach(doc => {

      form.innerHTML += `
        <div class="mb-4">
          <label class="block mb-1">
            ${doc.doc_name}
            ${doc.mandatory ? "<span class='text-red-500'>*</span>" : ""}
          </label>

          <input type="file"
            data-mandatory="${doc.mandatory}"
            class="border p-2 w-full" />
        </div>
      `;
    });
  }
}

loadForm();

async function submitApplication() {

  const files = document.querySelectorAll("#dynamicForm input[type='file']");

  const formData = new FormData();

  formData.append("formId", formId);

  files.forEach(fileInput => {

    if (fileInput.files.length > 0) {
      formData.append("documents", fileInput.files[0]);
    }

  });

  const res = await fetch(
    "http://127.0.0.1:5000/api/applications/submit",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  alert(data.message);
}