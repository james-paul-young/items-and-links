const linksDB = {
	makeid : (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	loadConnections: projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["connection"], 'readonly');
				var objectStore = loadTransaction.objectStore("connection");

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
	saveLinkToDB: (link) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["connection"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("link written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("link error: " + event);
				};
				const objectStore = saveTransaction.objectStore("connection");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const linkToSave = {
					internal_id: link.internal_id,
					identifier: link.identifier,
					description: link.description,
					connector: link.connector ? link.connector.internal_id : null,
					project_id: link.project_id,
					source: link.source.internal_id,
					target: link.target.internal_id,
					created: link.created,
					updated: link.updated,
				};
				let mergedLink = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((linkToSave.internal_id == null) || (linkToSave.internal_id.length == 0));
				if (!newRecord) {
					linkToSave.updated = datetime;
					saveRequest = objectStore.put(linkToSave);
					mergedLink = {...linkToSave, ...link };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					linkToSave.internal_id = linksDB.makeid(50);
					linkToSave.created = datetime;
					linkToSave.updated = linkToSave.created;
					saveRequest = objectStore.add(linkToSave);
					mergedLink = {...linkToSave, ...link};
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "link (" + mergedLink.internal_id + ") added." : "Updated");
					console.log(mergedLink);
					resolve(mergedLink);
				}
				saveRequest.onerror = (event) => { console.log("link (" + mergedLink.internal_id + ") not added."); }
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
	deleteLinkFromDB: (linkId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["connection"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("Link deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("connection");
				const deleteRequest = itemObjectStore.delete(linkId);
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