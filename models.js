"use strict";
class baseModel {
	/**
	 * 
	 * @param {string} dbVersion Version of the IndexedDB database to attempt to open.
	 * @param {string} dbName Name of the IndexedDB database to open.
	 * @param {string} storeName The name of the object store within the db.
	 */
	constructor(dbName, dbVersion, storeName) {
		this.dbVersion = dbVersion;
		this.dbName = dbName;
		this.storeName = storeName;
	}
	/**
	 * Creates a an alpha-only string of random characters 
	 * @param {integer} length The length of the ID to be generated.
	 * @returns An alpha-only string containing an ID of the length requested.
	 */
	static makeid(length) {
		console.assert(length && (length > 0), "No length provided for creating an ID");

		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
	load(project_id) {
		console.assert(this.dbName, `No database name provided for loading from ${this.storeName}.`);
		console.assert(this.dbVersion, `No database version provided for loading from ${this.storeName}.`);
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			console.log(`Opening ${this.dbName} v${this.dbVersion}`);
			const openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				console.log(`Creating transaction "${this.storeName}"`);
				const loadTransaction = db.transaction([this.storeName], 'readonly');
				const objectStore = loadTransaction.objectStore(this.storeName);

				console.log("Loading from " + this.storeName + "...");
				let loadFrom = null;
				try { 
					loadFrom = objectStore.index("project_id");
				}
				catch(DOMException) {
					loadFrom = objectStore;
				}
				const loadRequest = loadFrom.getAll(project_id);
				loadRequest.onsuccess = (event) => {
					console.log("Successful loading from " + this.storeName + ".");
					db.close();
					resolve(event.target.result);
				};
				loadRequest.onerror = (event) => {
					console.log("Failed to load from " + this.storeName + ".");
					db.close();
					reject();
				}
				loadRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				console.log(`Failed to open ${this.dbName} v${this.dbVersion}.`);
				reject();
			};
			openDBRequest.onupgradeneeded = (event => {
				this.checkDatabase(event.target.result, event.oldVersion);
			})
		});
	}

	save(populateRecordCallback) {
		console.assert(populateRecordCallback, "No callback supplied for populating record to commit to db.");
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const saveTransaction = db.transaction([this.storeName], "readwrite");
				// Do something when all the data is added to the database.
				saveTransaction.oncomplete = (event) => {
					console.log(`Transaction "${this.storeName}" complete.`);
					resolve(recordToSave);
					db.close();
				};
				saveTransaction.onerror = (event) => {
					console.error("error: " + event);
				};
				const objectStore = saveTransaction.objectStore(this.storeName);
				const recordToSave = populateRecordCallback();
				console.assert(recordToSave, "No record to save to the db.");

				console.log(`Saving ${JSON.stringify(recordToSave)} to "${this.storeName}"...`);
				const datetime = new Date();

				recordToSave.updated = recordToSave.created? datetime : null;
				recordToSave.created = recordToSave.created? recordToSave.created : datetime;

				const saveRequest = objectStore.put(recordToSave);
				saveRequest.onsuccess = (event) => {
					console.log("Saved to " + this.storeName);
				}
				saveRequest.onerror = (event) => {
					console.log("Failed to save to " + this.storeName);
					db.close();
					reject("Failed to save to " + this.storeName);
				}
				saveRequest.oncomplete = (event) => {
					db.close();
				}	
			};
			openDBRequest.onerror = (event) => {
				console.log(`Failed to open ${this.dbName} v${this.dbVersion}.`);
				reject();
			};
		});
	}
	delete(id) {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open(dbName, dbVersion);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction([this.storeName], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					//					console.log("project deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const projectObjectStore = deleteTransaction.objectStore(this.storeName);
				const deleteRequest = projectObjectStore.delete(id);
				deleteRequest.onsuccess = (event) => {
					db.close();
					resolve();
				}
				deleteRequest.onerror = (event) => {
					db.close();
					//console.log("not deleted.");
				}
				deleteRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				console.log(`Failed to open ${this.dbName} v${this.dbVersion}.`);
				reject();
			}
		});
	}
	clear() {
		return new Promise((resolve, reject) => {
			const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			const openDBRequest = indexedDB.open(dbName, dbVersion);
			openDBRequest.onsuccess = (event) => {
				const db = event.target.result;
				const deleteTransaction = db.transaction([this.objectStore], "readwrite");
				deleteTransaction.oncomplete = (event) => {
					//					console.log("project deleted!");
				};
				deleteTransaction.onerror = (event) => {
					console.error("error: " + event);
				};

				const projectObjectStore = deleteTransaction.objectStore(this.objectStore);
				const deleteRequest = projectObjectStore.clear();
				deleteRequest.onsuccess = (event) => {
					db.close();
					resolve();
				}
				deleteRequest.onerror = (event) => {
					db.close();
					//console.log("not deleted.");
				}
				deleteRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				console.log(`Failed to open ${this.dbName} v${this.dbVersion}.`);
				reject();
			}
		});
	}
	// Check if the database needs creation or updating.
	checkDatabase(db, oldVersion) {
		if (oldVersion < 1) {
			// Create a thing ObjectStore for this database
			const projectObjectStore = db.createObjectStore("project", { keyPath: "internal_id" });

			const itemObjectStore = db.createObjectStore("item", { keyPath: "internal_id" });
			itemObjectStore.createIndex("project_id", "project_id", { unique: false, })

			const typeObjectStore = db.createObjectStore("item-type", { keyPath: "internal_id" });
			typeObjectStore.createIndex("project_id", "project_id", { unique: false, })

			const linkObjectStore = db.createObjectStore("link", { keyPath: "internal_id" });
			linkObjectStore.createIndex("project_id", "project_id", { unique: false, })

			const linkTypeObjectStore = db.createObjectStore("link-type", { keyPath: "internal_id" });
			linkTypeObjectStore.createIndex("project_id", "project_id", { unique: false, })

			const filterObjectStore = db.createObjectStore("filter", { keyPath: "internal_id" });
			filterObjectStore.createIndex("project_id", "project_id", { unique: false, })

		}
	}

}

class projects extends baseModel {
	constructor(dbName, dbVersion) {
		super(dbName, dbVersion, "project");
	}
	save(projectData) {
		const populateRecordCallback = () => {
			return {
				internal_id: projectData.internal_id,
				identifier: projectData.identifier,
				description: projectData.description,
				active: projectData.active,
				created: projectData.created,
				updated: projectData.updated,
			};
		}
		return super.save(populateRecordCallback);
	}
}

class items extends baseModel {
	constructor(dbName, dbVersion, projectId) {
		super(dbName, dbVersion, "item", projectId);
	}
	save(itemData) {
		const populateRecordCallback = () => {
			return {
				internal_id: itemData.internal_id,
				identifier: itemData.identifier,
				description: itemData.description,
				forcolour: itemData.forcolour,
				backcolour: itemData.backcolour,
				created: itemData.created,
				updated: itemData.updated,
				project_id: itemData.project_id,
			};
		}
		return super.save(populateRecordCallback);
	}
}

class itemTypes extends baseModel {
	constructor(dbName, dbVersion) {
		super(dbName, dbVersion, "item-type");
	}
	save(itemTypeData) {
		const populateRecordCallback = () => {
			return {
				internal_id: itemTypeData.internal_id,
				identifier: itemTypeData.identifier,
				description: itemTypeData.description,
				project_id: itemTypeData.project_id,
				colour: itemTypeData.colour,
				background_colour: itemTypeData.fill_colour,
				fill_colour: itemTypeData.fill_colour,
				created: itemTypeData.created,
				updated: itemTypeData.updated,
			};
		}
		return super.save(populateRecordCallback);
	}
}
class links extends baseModel {
	constructor(dbName, dbVersion) {
		super(dbName, dbVersion, "link");
	}
	save(linkData) {
		const populateRecordCallback = () => {
			return {
				internal_id: linkData.internal_id,
				identifier: linkData.identifier,
				description: linkData.description,
				linkTypeId: linkData.linkTypeId,
				project_id: linkData.project_id,
				source: linkData.sourceId,
				target: linkData.targetId,
				created: linkData.created,
				updated: linkData.updated,
			};
		}
		return super.save(populateRecordCallback);
	}
}
class linkTypes extends baseModel {
	constructor(dbName, dbVersion) {
		super(dbName, dbVersion, "link-type");
	}
	save(linkTypeData) {
		const populateRecordCallback = () => {
			return {
				internal_id: linkTypeData.internal_id,
				identifier: linkTypeData.identifier,
				description: linkTypeData.description,
				project_id: linkTypeData.project_id,
				marker: linkTypeData.marker,
				dash: linkTypeData.dash,
				colour: linkTypeData.colour,
				created: linkTypeData.created,
				updated: linkTypeData.updated,
			};
		}
		return super.save(populateRecordCallback);
	}
}
class filters extends baseModel {
	constructor(dbName, dbVersion) {
		super(dbName, dbVersion, "filter");
	}
	save(filterData) {
		const populateRecordCallback = () => {
			return {
				internal_id: filterData.internal_id,
				identifier: filterData.identifier,
				description: filterData.description,
				included: filterData.included,
				visible: filterData.visible,
				heat: filterData.heat,
				active: filterData.active,
				project_id: filterData.project_id,
				created: filterData.created,
				updated: filterData.updated,
			};
		}
		return super.save(populateRecordCallback);
	}
	get active() {
		super.load().then(filters => {
			return filters.find(filter => filter.active);
		});
	}
	set active(value) {
		super.load().then(async filters => {
			const currentActive = filters.find(filter => filter.active);
			await this.save({ ...currentActive, active: false, });
			const result = await this.save({ ...value, active: true, });
			return result;
		});
	}

}