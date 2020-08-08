class TypeViewModel extends ViewModel {

    /**
     * All Types currently loaded.
     *
     * @since  0.0.1
     * @access private
     *
     * @type     Types
     * @memberof TypeViewModel
     */
    constructor(project) {
        super();
        // Make sure the required structures exist in the database.  
        this.checkDatabase();
        this.types = new Types();
        this._project = project;
    }
    get project() {
        return (this._project);
    }
    set project(value) {
        this._project = value;
        this.types = this.types.map(type => {
            type.project_id = value.internal_id;
            return (type);
        })
    }

    saveAll() {
        this.types.forEach(type => this.saveType(type));
    }

    saveType(typeData) {

        var saveTypePromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            console.assert(indexedDB != null, "Cannot find IndexedDB.");
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var saveTypeTransaction = db.transaction([this.typeObjectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                saveTypeTransaction.oncomplete = (event) => {
                    console.log("type written!");
                };
                saveTypeTransaction.onerror = (event) => {
                    console.error("type error: " + event);
                };
                var typeObjectStore = saveTypeTransaction.objectStore(this.typeObjectStoreName);
                var saveTypeRequest = null;
                var type = new Type();
                type.internal_id = typeData.internal_id;
                type.identifier = typeData.identifier;
                type.description = typeData.description;
                // type.icon = typeData.icon;
                type.colour = typeData.colour;
                type.background_colour = typeData.background_colour;
                type.project_id = this.project.internal_id;

                type.custom_image = typeData.custom_image;
                if (typeData.jiraId != null) {
                    type.jiraId = typeData.jiraId;
                }

                // Check if a new record is being written. Needed for 
                // determining which operation to use later.
                var newRecord = ((type.internal_id == null) || (type.internal_id.length == 0));
                if (!newRecord) {
                    saveTypeRequest = typeObjectStore.put(type);
                }
                else {
                    // Saving a new record so lets initialise some values before writing to the object store
                    type.internal_id = utils.makeid(50);
                    saveTypeRequest = typeObjectStore.add(type);
                }
                saveTypeRequest.onsuccess = (event) => {
                    console.log(newRecord ? "type Added." : "Updated");
                    if (newRecord) {
                        // Add the new record to the internal collection.
                        this.types.push(type);
                    }
                    else {
                        // Update the record in the internal collection.
                        var existingTypeIndex = this.types.findIndex(t => t.internal_id === type.internal_id);
                        this.types[existingTypeIndex] = type;
                    }
                    resolve({ added: newRecord, type: type });
                }
                saveTypeRequest.onerror = (event) => { console.log("type not Added."); }
                saveTypeRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (saveTypePromise);
    }

    loadTypes(sortFunction) {
        var loadPromise = new Promise((resolve, reject) => {
            // Get the currently active project.
            let projectViewModel = new ProjectViewModel();
            projectViewModel.load().then(result => {
                this._project = projectViewModel.active;
                // Clear out any previous Types.
                this.length = 0;

                var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                console.assert(indexedDB != null, "Cannot find IndexedDB.");
                var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
                openDBRequest.onsuccess = (event) => {
                    var db = event.target.result;
                    var loadTransaction = db.transaction([this.typeObjectStoreName], 'readonly');
                    var typeObjectStore = loadTransaction.objectStore(this.typeObjectStoreName);

                    var loadRequest = typeObjectStore.getAll();
                    loadRequest.onsuccess = (event) => {
                        [...event.target.result].forEach(result => {
                            var newType = new Type();
                            newType.internal_id = result.internal_id;
                            newType.identifier = result.identifier;
                            newType.description = result.description;
                            // newType.icon = result.icon;
                            newType.colour = result.colour;
                            newType.background_colour = result.background_colour;
                            newType.project_id = result.project_id;
                            newType.custom_image = result.custom_image;
                            newType.jiraId = result.jiraId;
                            // Kludge!!!
                            if (result.project_id == this.project.internal_id) {
                                this.types.push(newType);
                            }
                        });
                        if (sortFunction != null) {
                            this.types.sort(sortFunction);
                        }
                        resolve(this.types);
                    };
                    loadRequest.onerror = (event) => {
                        console.log("Error in loading types.");
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
        });

        return (loadPromise);
    }
    deleteType(typeId) {
        console.assert((typeId != null) && (typeId != ""), "Type Id has not been passed. Ensure the Internal Id of the type has been provided.");

        var deleteTypePromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            console.assert(indexedDB != null, "Cannot find IndexedDB.");
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var deleteTypeTransaction = db.transaction([this.typeObjectStoreName], "readwrite");
                deleteTypeTransaction.oncomplete = (event) => {
                    console.log("type deleted!");
                };
                deleteTypeTransaction.onerror = (event) => {
                    console.error("error: " + event);
                };

                var typeObjectStore = deleteTypeTransaction.objectStore(this.typeObjectStoreName);
                var deleteTypeRequest = typeObjectStore.delete(typeId);
                deleteTypeRequest.onsuccess = (event) => {
                    console.log("deleted");
                    resolve();
                }
                deleteTypeRequest.onerror = (event) => {
                    console.log("not deleted.");
                }
                deleteTypeRequest.oncomplete = (event) => {
                    db.close();
                }
            }
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            }
        });
        return (deleteTypePromise);
    }
}
