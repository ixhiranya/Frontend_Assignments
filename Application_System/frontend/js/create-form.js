let sectionCount = 0;
let availableFileTypes = [];

async function loadFileTypes() {
  const res = await fetch("http://127.0.0.1:5000/file-types");
  availableFileTypes = await res.json();
}

loadFileTypes(); 

function addSection() {
    sectionCount++;
    const container = document.getElementById("sectionsContainer");
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "border p-4 rounded mb-4 bg-gray-50";
    sectionDiv.innerHTML = `
    <input 
      type="text"
      placeholder="Section Name"
      class="border p-2 rounded w-full mb-3 section-name"
    />

    <div class="docsContainer mb-3"></div>

    <button 
      onclick="addDocument(this)"
      class="bg-purple-500 text-white px-3 py-1 rounded">
      + Add Document
    </button>
    `;
    container.appendChild(sectionDiv);
}

function addDocument(button) {
  const docsContainer = button.parentElement.querySelector(".docsContainer");

  const docDiv = document.createElement("div");
  docDiv.className = "border p-3 rounded mb-2 bg-white";

  let fileTypeCheckboxes = "";

  availableFileTypes.forEach(type => {
    fileTypeCheckboxes += `
      <label class="block">
        <input type="checkbox" value="${type.type_name}" class="file-type" />
        ${type.type_name.toUpperCase()}
      </label>
    `;
  });

  docDiv.innerHTML = `
    <input type="text" placeholder="Document Name"
      class="border p-1 rounded w-full mb-2 doc-name" />

    <div class="mb-2 relative">

      <button type="button"
        onclick="toggleDropdown(this)"
        class="border p-2 w-full text-left bg-gray-100 rounded">
        Select File Types
      </button>

      <div class="dropdown hidden absolute bg-white border p-2 rounded w-full mt-1 z-10">
        ${fileTypeCheckboxes}
      </div>

    </div>

    <div class="flex gap-3 mb-2">
      <input type="number" placeholder="Max Size (MB)"
        class="border p-1 rounded w-1/3 doc-size" />

      <label class="flex items-center gap-2">
        <input type="checkbox" class="doc-mandatory" />
        Mandatory
      </label>
    </div>
  `;

  docsContainer.appendChild(docDiv);
}

function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    dropdown.classList.toggle("hidden");
}

async function submitForm() {
    const formName = document.getElementById("formName").value;
    const sections = [];
    document.querySelectorAll("#sectionsContainer>div").forEach(sectionDiv => {
        const sectionName = sectionDiv.querySelector(".section-name").value;
        const docs = [];
        sectionDiv.querySelectorAll(".docsContainer > div").forEach(docDiv => {

            const selectedTypes = [];

            docDiv.querySelectorAll(".file-type:checked")
                .forEach(cb => {
                    selectedTypes.push(cb.value);
                });

            docs.push({
                name: docDiv.querySelector(".doc-name").value,
                format: selectedTypes.join(","),  // store as string
                size: docDiv.querySelector(".doc-size").value,
                mandatory: docDiv.querySelector(".doc-mandatory").checked
            });

        });
        sections.push({
            sectionName,
            documents: docs
        });
    });
    document.addEventListener("change", function (e) {
        if (e.target.classList.contains("file-type")) {
            const dropdown = e.target.closest(".dropdown");
            const button = dropdown.previousElementSibling;

            const selected = [];
            dropdown.querySelectorAll(".file-type:checked")
                .forEach(cb => selected.push(cb.value));

            button.textContent = selected.length > 0
                ? selected.join(", ")
                : "Select File Types";
        }
    });
    const finalData = {
        formName,
        sections
    };
    const response = await fetch(
        "http://localhost:5000/create-form",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalData)
        }
    );
    if (!response.ok) {
        alert("Server error: " + response.status);
        return;
    }

    const result = await response.json();
    alert(result.message);
}