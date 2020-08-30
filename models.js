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
	loadProjects: active => {
		return new Promise((resolve, reject) => {
			let filter = null;
			if(active != null) {
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

	activateProject: activeProject => {
		return new Promise((resolve, reject) => {
			projectsDB.loadProjects().then(projects => {
				projects.forEach(project => {
					projectsDB.saveProjectToDB({ ...project, active: false, });
					projectsDB.saveProjectToDB(activeProject).then(result => {
						resolve();
					});
				});
			});
		});
	},
	getActiveProject: () => {
		return new Promise((resolve, reject) => {
			projectsDB.loadProjects(true).then(projects => {
				if(projects.length > 0) {
					resolve(projects[0]);
				}
				else {
					reject();
				}
			});
		});
	},

	saveProjectToDB: (project) => {
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
	deleteProjectFromDB: (projectId) => {
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