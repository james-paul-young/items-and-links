const filterDB = {
	makeid : (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	loadFilters: projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const loadTransaction = db.transaction(["filter"], 'readonly');
				const objectStore = loadTransaction.objectStore("filter");

				const loadRequest = objectStore.getAll();
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

	saveFilterToDB: (filter) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["filter"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("Transaction complete: item written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("filter error: " + event);
				};
				const objectStore = saveTransaction.objectStore("filter");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				let mergedRecord = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((filter.internal_id == null) || (filter.internal_id.length == 0));
				if (!newRecord) {
					filter.updated = datetime;
					saveRequest = objectStore.put(filter);
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					filter.internal_id = itemsDB.makeid(50);
					filter.created = datetime;
					filter.updated = filter.created
					saveRequest = objectStore.add(filter);
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "filter (" + objectStore.internal_id + ") added." : "Updated");

					resolve(filter);
				}
				saveRequest.onerror = (event) => { console.log("filter (" + item.internal_id + ") not added."); }
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
	deleteFilterFromDB: (filterId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["filter"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("filter deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("filter");
				const deleteRequest = itemObjectStore.delete(filterId);
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
}