const itemTypesDB = {
	makeid : (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	loadTypes: projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["type"], 'readonly');
				var objectStore = loadTransaction.objectStore("type");

				var loadRequest = objectStore.getAll();
				loadRequest.onsuccess = (event) => {
					resolve(event.target.result.filter(item => item.project_id == projectId));
				};
				loadRequest.onerror = (event) => {
					console.log("Error in loading.");
					reject();
				}
				loadRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				alert("Database error: " + JSON.stringify(event));
				reject();
			};
		});
	},
	saveitemTypeToDB: (itemType) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["connection"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("itemType written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("itemType error: " + event);
				};
				const objectStore = saveTransaction.objectStore("connection");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const itemTypeToSave = {
					internal_id: itemType.internal_id,
					identifier: itemType.identifier,
					description: itemType.description,
					connector: itemType.connector ? itemType.connector.internal_id : null,
					project_id: itemType.project_id,
					source: itemType.source.internal_id,
					target: itemType.target.internal_id,
					created: itemType.created,
					updated: itemType.updated,
				};
				let mergeditemType = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((itemTypeToSave.internal_id == null) || (itemTypeToSave.internal_id.length == 0));
				if (!newRecord) {
					itemTypeToSave.updated = datetime;
					saveRequest = objectStore.put(itemTypeToSave);
					mergeditemType = {...itemTypeToSave, ...itemType };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					itemTypeToSave.internal_id = itemTypesDB.makeid(50);
					itemTypeToSave.created = datetime;
					itemTypeToSave.updated = itemTypeToSave.created;
					saveRequest = objectStore.add(itemTypeToSave);
					mergeditemType = {...itemTypeToSave, ...itemType};
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "itemType (" + mergeditemType.internal_id + ") added." : "Updated");
					resolve(mergeditemType);
				}
				saveRequest.onerror = (event) => { console.log("itemType (" + mergeditemType.internal_id + ") not added."); }
				saveRequest.oncomplete = (event) => {
					db.close();
				}
			};
			openDBRequest.onerror = (event) => {
				alert("Database error: " + event.target.errorCode);
				reject();
			};
		});
	},
	deleteitemTypeFromDB: (itemTypeId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["connection"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("itemType deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("connection");
				const deleteRequest = itemObjectStore.delete(itemTypeId);
				deleteRequest.onsuccess = (event) => {
					console.log("deleted");
					resolve();
				}
				deleteRequest.onerror = (event) => {
					console.log("not deleted.");
				}
				deleteRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				alert("Database error: " + event.target.errorCode);
				reject();
			}
		});
	}
};