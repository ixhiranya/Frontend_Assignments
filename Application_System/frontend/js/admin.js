async function loadForms() {
    const res = await fetch("http://localhost:5000/forms");
    const data = await res.json();
    const table = document.getElementById("tableBody");
    table.innerHTML = "";
    data.forEach((form, index) => {
        table.innerHTML += `
        <tr class="border-b">
        <td class="p-3">${index + 1}</td>
        <td class="p-3">${form.form_id}</td>
        <td class="p-3">${form.form_name}</td>
        <td class="p-3">0</td>
        <td class="p-3 space-x-2">
          <button class="bg-green-500 text-white px-2 py-1 rounded">View</button>
          <button class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        </td>
      </tr>`;
    });
}
loadForms();