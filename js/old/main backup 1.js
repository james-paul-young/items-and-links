const dbName = "rmdb";
const dbVersion = 2;

var requirementModal = document.getElementById("requirementModal");
window.onload = () =>
{
    console.log("Loading...");
	LoadDatabase();
    // Listen for button click events

	var createRequirementButton = document.getElementById("createRequirementButton");
	createRequirementButton.addEventListener("click", (event) => {
		document.getElementById("requirementIdentifierInput").value = "";
		document.getElementById("requirementTypeInput").value = "";
		document.getElementById("requirementLabelInput").value = "";
		document.getElementById("requirementDescriptionInput").value = "";
		requirementModal.style.display = "block";
	});
	// Get the <span> element that closes the modal
	var requirementModalClose = document.getElementById("requirementModalClose");
	requirementModalClose.addEventListener("click", (event) => {
		requirementModal.style.display = "none";
	});
	var saveRequirementButton = document.getElementById("saveRequirementButton");
	saveRequirementButton.addEventListener("click", (event) => {
		SaveRequirement();
		requirementModal.style.display = "none";
		LoadDatabase();
	});
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
  if (event.target == requirementModal) {
    requirementModal.style.display = "none";
  }
}

function guid()
{
        const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}


function SaveRequirement()
{
    var request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = (event) => 
    { 
        var db = event.target.result; 
        var transaction = db.transaction(["requirement"], "readwrite");

        // Get all the input elements from the modal dialog.
	var requirementGUID = requirementModal.getAttribute("requirementGUID");

	var requirementIdentifierInput = document.getElementById("requirementIdentifierInput");
	var requirementTypeInput = document.getElementById("requirementTypeInput");
	var requirementLabelInput = document.getElementById("requirementLabelInput");
	var requirementDescriptionInput = document.getElementById("requirementDescriptionInput");
	var requirementRationaleInput = document.getElementById("requirementRationaleInput");
	
        var newRecord = (requirementGUID == null) || (requirementGUID.length > 0);

        var requirement = { 
            guid: requirementGUID || guid(),
            identifier: requirementIdentifierInput.value,
		type: requirementTypeInput.value,
		label: requirementLabelInput.value,
		description: requirementDescriptionInput.value,
		rationale: requirementRationaleInput.value
        };
        console.log("requirement = " + JSON.stringify(requirement));
        
        // Do something when all the data is added to the database.
       transaction.oncomplete = (event) => { console.log("Requirement written!");};
        transaction.onerror = (event) => { console.error("error: " + event);};
    
        var requirementObjectStore = transaction.objectStore("requirement");
        //console.log("requirementObjectStore.name + ", newRecord = " + newRecord + ", contents = " + item.contents);
        //console.log("Name = " + item.contents);
        var request = null;
        if(!newRecord)
        {
            request = requirementObjectStore.put(requirement);
        }
        else
        {
            request = requirementObjectStore.add(requirement);
        }
        request.onsuccess = (event) => { console.log(newRecord? "Requirement Added." : "Updated"); }
        request.onerror = (event) => { console.log("Requirement not Added."); }
                request.oncomplete = (event) => { db.close(); }
    };
    request.onerror = (event) => { alert("Database error: " + event.target.errorCode); };
}

function load_store(store) {
  return new Promise(function(resolve, reject) {
    var request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function load_stores(db, names) {
  var tx = db.transaction(names, 'readonly');
  var stores = names.map((name) => tx.objectStore(name));
  var load_store_promises = stores.map(load_store);
  return Promise.all(load_store_promises);
}

function LoadDatabase()
{

    var request = indexedDB.open(dbName, dbVersion);
	request.onupgradeneeded = (event) =>
	{
		console.log("Upgrade needed.");
		var db = event.target.result;
		if(event.oldVersion < 1)
		{
			// Create a Requirement ObjectStore for this database
			var requirementObjectStore = db.CreateObjectStore("requirement", { keyPath: "guid" });
		}
		if(event.oldVersion < 2)
		{
			var requirementObjectStore = db.CreateObjectStore("requirement_type", { keyPath: "guid" });
		}
	};

    request.onsuccess = (event) => 
    { 
        var db = event.target.result; 
	load_stores(db, ["requirement", "requirement_type"]).then(results => { 
		console.log(JSON.stringify(results)); 
	});

        var transaction = db.transaction(["requirement"], "readwrite");

        // Do something when all the data is added to the database.
        transaction.oncomplete = (event) => { console.log("All read!");};
        transaction.onerror = (event) => { console.error("error: " + event);};
        
	var requirementObjectStore = transaction.objectStore("requirement");
        var readRequirementsRequest = requirementObjectStore.getAll();
        readRequirementsRequest.onerror = function(event)
        {
                            // Handle errors!
                        console.log("Error when getting all records.");
        };
        readRequirementsRequest.onsuccess = (event) =>
        {
            var table = document.getElementById("requirementsTable");
		table.innerHTML = "";
		// Add the header row
                var headerRow = table.insertRow(table.rows.length);
		headercell = headerRow.appendChild(document.createElement("TH"));
		headercell.innerHTML = "Type";
		headercell = headerRow.appendChild(document.createElement("TH"));
		headercell.innerHTML = "ID";
		headercell = headerRow.appendChild(document.createElement("TH"));
		headercell.innerHTML = "Label";
		headercell = headerRow.appendChild(document.createElement("TH"));
		headercell.innerHTML = "Description";

		headercell = headerRow.appendChild(document.createElement("TH"));
		headercell.innerHTML = "Rationale";
		
            // Do something with the request.result!
            console.log("Found " + event.target.result.length + " records.");
            event.target.result.forEach((item) => 
            {
                var row = table.insertRow(table.rows.length);
                row.setAttribute("id", "Row " + item.guid);

                var typeCell = row.insertCell(0);
                var identifierCell = row.insertCell(1);
                var labelCell = row.insertCell(2);
                var descriptionCell = row.insertCell(3);
                var rationaleCell = row.insertCell(4);
		
		typeCell.innerHTML = item.type;
		identifierCell.innerHTML = item.identifier;
		labelCell.innerHTML = item.label;
		descriptionCell.innerHTML = item.description;
		rationaleCell.innerHTML = item.rationale;
	     });
//            console.log("Completing...");
//            db.close();
        };
        readRequirementsRequest.oncomplete = (event) => 
        { 
            console.log("completing...");
            db.close(); 
        }
    };
    request.onerror = (event) => { alert("Database error: " + JSON.stringify(event)); };
}