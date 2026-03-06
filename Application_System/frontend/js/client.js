async function loadForms() {

  const res = await fetch("http://127.0.0.1:5000/forms");
  const forms = await res.json();

  const table = document.getElementById("formsTable");
  table.innerHTML = "";

  forms.forEach((form, index) => {

    table.innerHTML += `
      <tr class="border-b">
        <td class="p-3">${index + 1}</td>
        <td class="p-3">${form.form_name}</td>
        <td class="p-3">
          <button 
            onclick="applyForm(${form.form_id})"
            class="bg-blue-500 text-white px-3 py-1 rounded">
            Apply
          </button>
        </td>
      </tr>
    `;
  });
}

function applyForm(id) {
  window.location.href = `apply-form.html?id=${id}`;
}

loadForms();