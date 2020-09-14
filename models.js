"use strict";
const projectsDB = {
	makeid: (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	load: active => {
		return new Promise((resolve, reject) => {
			let filter = null;
			if (active != null) {
				filter = project => project.active;
			}
			else {
				filter = () => true;
			}
			// Get the currently active project.
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const loadTransaction = db.transaction(["project"], 'readonly');
				const objectStore = loadTransaction.objectStore("project");

				const loadRequest = objectStore.getAll();
				loadRequest.onsuccess = (event) => {
					resolve(event.target.result.filter(filter));
					//console.table(event.target.result.map(project => {return { internal_id: project.internal_id, identifier: project.identifier}}));
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

	activate: activeProject => {
		return new Promise((resolve, reject) => {
			projectsDB.load().then(projects => {
				projects.forEach(project => {
					projectsDB.save({ ...project, active: false, });
				});
				projectsDB.save(activeProject).then(result => {
					resolve();
				});
			});
		});
	},
	getActive: () => {
		return new Promise((resolve, reject) => {
			projectsDB.load(true).then(projects => {
				if (projects.length > 0) {
					resolve(projects[0]);
				}
				else {
					reject();
				}
			});
		});
	},

	save: (project) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["project"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("Transaction complete: project written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("project error: " + event);
				};
				const objectStore = saveTransaction.objectStore("project");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for the db.
				const projectToSave = {
					internal_id: project.internal_id,
					identifier: project.identifier,
					description: project.description,
					active: project.active,
					created: project.created,
					updated: project.updated,
				};

				let mergedRecord = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((projectToSave.internal_id == null) || (projectToSave.internal_id.length == 0));
				if (!newRecord) {
					projectToSave.updated = datetime;
					saveRequest = objectStore.put(projectToSave);
					mergedRecord = { ...projectToSave, ...project };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					projectToSave.internal_id = projectsDB.makeid(50);
					projectToSave.created = datetime;
					projectToSave.updated = projectToSave.created
					saveRequest = objectStore.add(projectToSave);
					mergedRecord = { ...projectToSave, ...project };
					mergedRecord.internal_id = projectToSave.internal_id;
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "project (" + objectStore.internal_id + ") added." : "Updated");

					resolve(mergedRecord);
				}
				saveRequest.onerror = (event) => { console.log("project (" + project.internal_id + ") not added."); }
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
	delete: (projectId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["project"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("project deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const projectObjectStore = deleteTransaction.objectStore("project");
				const deleteRequest = projectObjectStore.delete(projectId);
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
const itemsDB = {
	makeid: (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	load: projectId => {
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

	save: (item) => {
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
				let itemTypeInternalId = null;
				if(typeof(item.type) == "string") {
					itemTypeInternalId = item.type;
				}
				else {
					itemTypeInternalId = (item.type? item.type.internal_id : null);
				}

				const itemToSave = {
					internal_id: item.internal_id,
					identifier: item.identifier,
					description: item.description,
					colour: item.colour,
					fill_colour: item.fill_colour,
					project_id: item.project_id,
					type: itemTypeInternalId,
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
					mergedRecord = { ...itemToSave, ...item };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					itemToSave.internal_id = itemsDB.makeid(50);
					itemToSave.created = datetime;
					itemToSave.updated = itemToSave.created
					saveRequest = objectStore.add(itemToSave);
					mergedRecord = { ...itemToSave, ...item };
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
	delete: (itemId) => {
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
const itemTypesDB = {
	makeid: (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	load: projectId => {
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
	save: (itemType) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["type"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("itemType written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("itemType error: " + event);
				};
				const objectStore = saveTransaction.objectStore("type");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const itemTypeToSave = {
					internal_id: itemType.internal_id,
					identifier: itemType.identifier,
					description: itemType.description,
					project_id: itemType.project_id,
					colour: itemType.colour,
					background_colour: itemType.fill_colour,
					fill_colour: itemType.fill_colour,
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
					mergeditemType = { ...itemTypeToSave, ...itemType };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					itemTypeToSave.internal_id = itemTypesDB.makeid(50);
					itemTypeToSave.created = datetime;
					itemTypeToSave.updated = itemTypeToSave.created;
					saveRequest = objectStore.add(itemTypeToSave);
					mergeditemType = { ...itemTypeToSave, ...itemType };
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
	delete: (itemTypeId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["type"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("itemType deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("type");
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
const linksDB = {
	makeid: (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	load: projectId => {
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
	save: (link) => {
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
				let sourceInternalId = null;
				if(typeof(link.source) == "string") {
					sourceInternalId = link.source;
				}
				else if(link.source != null) {
					sourceInternalId = link.source.internal_id;
				}
				let targetInternalId = null;
				if(typeof(link.target) == "string") {
					targetInternalId = link.target;
				}
				else if(link.target != null) {
					targetInternalId = link.target.internal_id;
				}

				let connectorInternalId = null;
				if(typeof(link.connector) == "string") {
					connectorInternalId = link.connector;
				}
				else if(link.connector != null) {
					connectorInternalId = link.connector.internal_id;
				}
				const linkToSave = {
					internal_id: link.internal_id,
					identifier: link.identifier,
					description: link.description,
					connector: connectorInternalId,
					project_id: link.project_id,
					source: sourceInternalId,
					target: targetInternalId,
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
					mergedLink = { ...linkToSave, ...link };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					linkToSave.internal_id = linksDB.makeid(50);
					linkToSave.created = datetime;
					linkToSave.updated = linkToSave.created;
					saveRequest = objectStore.add(linkToSave);
					mergedLink = { ...linkToSave, ...link };
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
	delete: (linkId) => {
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
const linkTypesDB = {
	makeid: (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	load: projectId => {
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
	save: (linkType) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["connector"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("linkType written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("linkType error: " + event);
				};
				const objectStore = saveTransaction.objectStore("connector");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const linkTypeToSave = {
					internal_id: linkType.internal_id,
					identifier: linkType.identifier,
					description: linkType.description,
					project_id: linkType.project_id,
					marker: linkType.marker,
					dash: linkType.dash,
					colour: linkType.colour,
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
					mergedlinkType = { ...linkTypeToSave, ...linkType };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					linkTypeToSave.internal_id = linkTypesDB.makeid(50);
					linkTypeToSave.created = datetime;
					linkTypeToSave.updated = linkTypeToSave.created;
					saveRequest = objectStore.add(linkTypeToSave);
					mergedlinkType = { ...linkTypeToSave, ...linkType };
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
	delete: (linkTypeId) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction(["connector"], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					console.log("linkType deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const itemObjectStore = deleteTransaction.objectStore("connector");
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

const filtersDB = {
	makeid : (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	load: projectId => {
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

	save: (filter) => {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction(["filter"], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log("Transaction complete: filter written!");
				};
				saveTransaction.onerror = (event) => {
					console.error("filter error: " + event);
				};
				const objectStore = saveTransaction.objectStore("filter");
				let saveRequest = null;
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				const filterToSave = {
					internal_id: filter.internal_id,
					identifier: filter.identifier,
					description: filter.description,
					included: filter.included,
					visible: filter.visible,
					heat: filter.heat,
					active: filter.active,
					project_id: filter.project_id,
					created: filter.created,
					updated: filter.updated,
				};
				// Only save what is needed in the db. d3 adds a lot of unneccesary attributes for thedb.
				let mergedRecord = null;
				const datetime = new Date();
				// Check if a new record is being written. Needed for 
				// determining which operation to use later.
				const newRecord = ((filterToSave.internal_id == null) || (filterToSave.internal_id.length == 0));
				if (!newRecord) {
					filterToSave.updated = datetime;
					saveRequest = objectStore.put(filterToSave);
					mergedRecord = { ...filterToSave, ...filter };
				}
				else {
					// Saving a new record so lets initialise some values before writing to the object store
					filterToSave.internal_id = itemsDB.makeid(50);
					filterToSave.created = datetime;
					filterToSave.updated = filterToSave.created;
					saveRequest = objectStore.add(filterToSave);
					mergedRecord = { ...filterToSave, ...filter };
					mergedRecord.internal_id = filterToSave.internal_id;
				}
				saveRequest.onsuccess = (event) => {
					console.log(newRecord ? "filter (" + objectStore.internal_id + ") added." : "Updated");

					resolve(mergedRecord);
				}
				saveRequest.onerror = (event) => { console.log("filter (" + filter.internal_id + ") not added."); }
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
	delete: (filterId) => {
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
	},
	activate: activeFilter => {
		return new Promise((resolve, reject) => {
			filtersDB.load().then(filters => {
				filters.forEach(filter => {
					filter.active = true;
					filtersDB.save(filter);
				});
				filtersDB.save(activeFilter).then(result => {
					resolve();
				});
			});
		});
	},
	getActive: projectId => {
		return new Promise((resolve, reject) => {
			filtersDB.load(projectId).then(filters => {
				if (filters.length > 0) {
					resolve(filters[0]);
				}
				else {
					reject();
				}
			});
		});
	},
}
