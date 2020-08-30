const itemsDB = {
	makeid : (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	loadItems: projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const loadTransaction = db.transaction(["thing"], 'readonly');
				const objectStore = loadTransaction.objectStore("thing");

				const loadRequest = objectStore.getAll();
				loadRequest.onsuccess = (event) => {
					resolve(event.target.result.filter(item => item.project_id == projectId));
					//console.table(event.target.result.map(item => {return { internal_id: item.internal_id, identifier: item.identifier}}));
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

	saveItemToDB: (item) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["thing"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("Transaction complete: item written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("item error: " + event);
				};
				const objectStore = saveTransaction.objectStore("thing");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const itemToSave = {
					internal_id: item.internal_id,
					identifier: item.identifier,
					description: item.description,
					colour: item.colour,
					fill_colour: item.fill_colour,
					project_id: item.project_id,
					type: item.type.internal_id,
					custom_image: item.custom_image,
					created: item.created,
					updated: item.updated,
				};

				let mergedRecord = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((itemToSave.internal_id == null) || (itemToSave.internal_id.length == 0));
				if (!newRecord) {
					itemToSave.updated = datetime;
					saveRequest = objectStore.put(itemToSave);
					mergedRecord = {...itemToSave, ...item};
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					itemToSave.internal_id = itemsDB.makeid(50);
					itemToSave.created = datetime;
					itemToSave.updated = itemToSave.created
					saveRequest = objectStore.add(itemToSave);
					mergedRecord = {...itemToSave, ...item };
					mergedRecord.internal_id = itemToSave.internal_id;
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "item (" + objectStore.internal_id + ") added." : "Updated");

					resolve(mergedRecord);
				}
				saveRequest.onerror = (event) => { console.log("item (" + item.internal_id + ") not added."); }
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
	deleteItemFromDB: (itemId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["thing"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("item deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("thing");
				const deleteRequest = itemObjectStore.delete(itemId);
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