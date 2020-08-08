const linkTypesDB = {
	makeid : (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	loadConnectors: projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["connector"], 'readonly');
				var objectStore = loadTransaction.objectStore("connector");

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
	savelinkTypeToDB: (linkType) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["connection"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("linkType written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("linkType error: " + event);
				};
				const objectStore = saveTransaction.objectStore("connection");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const linkTypeToSave = {
					internal_id: linkType.internal_id,
					identifier: linkType.identifier,
					description: linkType.description,
					connector: linkType.connector ? linkType.connector.internal_id : null,
					project_id: linkType.project_id,
					source: linkType.source.internal_id,
					target: linkType.target.internal_id,
					created: linkType.created,
					updated: linkType.updated,
				};
				let mergedlinkType = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((linkTypeToSave.internal_id == null) || (linkTypeToSave.internal_id.length == 0));
				if (!newRecord) {
					linkTypeToSave.updated = datetime;
					saveRequest = objectStore.put(linkTypeToSave);
					mergedlinkType = {...linkTypeToSave, ...linkType };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					linkTypeToSave.internal_id = linkTypesDB.makeid(50);
					linkTypeToSave.created = datetime;
					linkTypeToSave.updated = linkTypeToSave.created;
					saveRequest = objectStore.add(linkTypeToSave);
					mergedlinkType = {...linkTypeToSave, ...linkType};
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "linkType (" + mergedlinkType.internal_id + ") added." : "Updated");
					resolve(mergedlinkType);
				}
				saveRequest.onerror = (event) => { console.log("linkType (" + mergedlinkType.internal_id + ") not added."); }
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
	deletelinkTypeFromDB: (linkTypeId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["connection"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("linkType deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("connection");
				const deleteRequest = itemObjectStore.delete(linkTypeId);
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