async function loadApplications(){

const res = await fetch(
"http://127.0.0.1:5000/api/applications/admin"
);

const data = await res.json();

const table = document.getElementById("applicationsTable");

table.innerHTML = "";

data.forEach(app => {

table.innerHTML += `
<tr class="border-b">
<td class="p-3">${app.application_id}</td>
<td class="p-3">${app.form_name}</td>
<td class="p-3">${app.doc_name}</td>

<td class="p-3">
<a
href="http://127.0.0.1:5000/${app.file_path}"
target="_blank"
class="bg-blue-500 text-white px-3 py-1 rounded"
>
Download
</a>
</td>

</tr>
`;

});

}

loadApplications();