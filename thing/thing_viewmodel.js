class ThingViewModel extends ViewModel {

    /**
     * All Things currently loaded.
     *
     * @since  0.0.1
     * @access private
     *
     * @type     Things
     * @memberof ThingViewModel
     */
    things = new Things();
    connectionViewModel = new ConnectionViewModel();

    constructor(project) {
        super();
        console.assert(this.connectionViewModel != null, "Unable to find the ConnectionViewModel.");
        // Make sure the required structures exist in the database.  
        this.checkDatabase();
        this._project = project;
    }
    get project() {
        return (this._project);
    }
    set project(value) {
        this._project = value;
        this.things = this.things.map(thing => {
            thing.project_id = value.internal_id;
            return (thing);
        })
    }
    saveAll() {
        this.things.forEach(thing => this.saveThing(thing));
    }

    saveThing(thingData) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);

        var saveThingPromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var saveThingTransaction = db.transaction([this.thingObjectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                saveThingTransaction.oncomplete = (event) => {
                    console.log("thing written!");
                };
                saveThingTransaction.onerror = (event) => {
                    console.error("thing error: " + event);
                };
                var thingObjectStore = saveThingTransaction.objectStore(this.thingObjectStoreName);
                var saveRequest = null;
                var thing = null;
                if (thingData.internal_id != null) {
                    var thing = this.things.find(t => t.internal_id == thingData.internal_id);
                    thing.internal_id = thingData.internal_id;
                }
                else {
                    thing = new Thing();
                }
                thing.identifier = thingData.identifier;
                thing.description = thingData.description;
                thing.type = thingData.type;
                thing.fill_colour = thingData.fill_colour;
                thingData.colour = thingData.colour;
                thing.project_id = this.project.internal_id;
                if (thingData.jiraId != null) {
                    thing.jiraId = thingData.jiraId;
                }

                var datetime = new Date();
                if (thing.created == null) {
                    thing.created = datetime;
                }
                else {
                    thing.updated = datetime;
                }
                thing.custom_image = thingData.custom_image;

                if (thingData.connections != null) {
                    thingData.connections.forEach(connection => {
                        if (connection.internal_id == null) {
                            connection.internal_id = utils.makeid(50);
                        }
                    })
                }
                thing.connections = thingData.connections;

                // Check if a new record is being written. Needed for 
                // determining which operation to use later.
                var newRecord = ((thing.internal_id == null) || (thing.internal_id.length == 0));
                if (!newRecord) {
                    thing.updated = new Date();
                    saveRequest = thingObjectStore.put(thing);
                }
                else {
                    // Saving a new record so lets initialise some values before writing to the object store
                    thing.internal_id = utils.makeid(50);
                    thing.created = new Date();
                    thing.updated = thing.created
                    saveRequest = thingObjectStore.add(thing);
                }
                saveRequest.onsuccess = (event) => {
                    console.log(newRecord ? "thing (" + thing.internal_id + ") added." : "Updated");
                    if (newRecord) {
                        // Add the new record to the internal collection.
                        this.things.push(thing);
                    }
                    else {
                        // Update the record in the internal collection.
                        var existingThingIndex = this.things.findIndex(t => t.internal_id === thing.internal_id);
                        this.things[existingThingIndex] = thing;
                    }
                    resolve({ added: newRecord, thing: thing });
                }
                saveRequest.onerror = (event) => { console.log("thing (" + thing.internal_id + ") not added."); }
                saveRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (saveThingPromise);
    }

    loadThings(sortFunction) {
        var loadThingsPromise = new Promise((resolve, reject) => {
            // Get the currently active project.
            let projectViewModel = new ProjectViewModel();
            projectViewModel.load().then(result => {
                this._project = projectViewModel.active;

                this.length = 0;
                var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
                openDBRequest.onsuccess = (event) => {
                    var db = event.target.result;
                    var loadThingTransaction = db.transaction([this.thingObjectStoreName], 'readonly');
                    var thingObjectStore = loadThingTransaction.objectStore(this.thingObjectStoreName);

                    var loadRequest = null;
                    if (this.project == null) {
                        loadRequest = thingObjectStore.getAll();
                    }
                    else {
                        loadRequest = thingObjectStore.getAll();
                        //                    loadRequest = thingObjectStore.get(this.project.internal_id);
                    }
                    loadRequest.onsuccess = (event) => {
                        if (event.target.result != null) {
                            [...event.target.result].forEach(result => {
                                var newThing = new Thing();
                                newThing.internal_id = result.internal_id;
                                newThing.identifier = result.identifier;
                                newThing.description = result.description;
                                newThing.type = result.type;
                                newThing.connections = result.connections;
                                newThing.created = result.created;
                                newThing.updated = result.updated;
                                newThing.custom_image = result.custom_image;
                                newThing.fill_colour = result.fill_colour;
                                newThing.colour = result.colour;
                                newThing.project_id = result.project_id;
                                if (result.jiraId != null) {
                                    newThing.jiraId = result.jiraId;
                                }

                                // Kludge!!!
                                if (result.project_id == this.project.internal_id) {
                                    this.things.push(newThing);
                                }
                            });
                            if (sortFunction != null) {
                                this.things.sort(sortFunction);
                            }
                        }
                        resolve(this.things);
                    };
                    loadRequest.onerror = (event) => {
                        console.log("Error in loading things.");
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
        return (loadThingsPromise);
    }
    deleteThing(thingId) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);
        console.assert((thingId != null) && (thingId != ""));
        console.assert(this.connectionViewModel != null, "Unable to find the ConnectionViewModel for deleting connection.");

        var deleteThingPromise = new Promise((resolve, reject) => {
            var thingToDelete = this.things.find(thing => thing.internal_id == thingId);
            if (thingToDelete != null) {
                this.connectionViewModel.loadConnections().then(results => {
                    this.connectionViewModel.connections
                        .filter(c => {
                            return ((c.target == thingToDelete.internal_id) || (c.source == thingToDelete.internal_id));
                        })
                        .forEach(connection => {
                            this.connectionViewModel.deleteConnection(connection.internal_id);
                        });
                })
            }
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var deleteThingTransaction = db.transaction([this.thingObjectStoreName], "readwrite");
                deleteThingTransaction.oncomplete = (event) => {
                    console.log("thing deleted!");
                };
                deleteThingTransaction.onerror = (event) => {
                    console.error("error: " + event);
                };

                var thingObjectStore = deleteThingTransaction.objectStore(this.thingObjectStoreName);
                var deleteRequest = thingObjectStore.delete(thingId);
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
        return (deleteThingPromise);
    }
}
