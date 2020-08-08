class ConnectionViewModel extends ViewModel {
    /**
     * All Connections currently loaded.
     *
     * @since  0.0.1
     * @access private
     *
     * @type     Connections
     * @memberof ConnectionViewModel
     */

    constructor(project) {
        super();
        this.connections = new Connections();
        // Make sure the required structures exist in the database.  
        this.checkDatabase();
        this._project = project;
    }
    get project() {
        return (this._project);
    }
    set project(value) {
        this._project = value;
        this.connections = this.connections.map(connection => {
            connection.project_id = value.internal_id;
            return (connection);
        })
    }

    saveAll() {
        this.connections.forEach(connection => this.saveConnection(connection));
    }
    saveConnection(connectionData) {
        var saveConnectionPromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var saveConnectionTransaction = db.transaction([this.connectionObjectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                saveConnectionTransaction.oncomplete = (event) => {
                    console.log("connection written!");
                };
                saveConnectionTransaction.onerror = (event) => {
                    console.error("connection error: " + event);
                };
                var connectionObjectStore = saveConnectionTransaction.objectStore(this.connectionObjectStoreName);
                var saveConnectionRequest = null;
                var connection = new Connection();
                connection.internal_id = connectionData.internal_id;
                connection.identifier = connectionData.identifier;
                connection.description = connectionData.description;
                connection.connector = connectionData.connector;
                connection.source = connectionData.source;
                connection.target = connectionData.target;
                connection.project_id = this.project.internal_id;

                // Check if a new record is being written. Needed for 
                // determining which operation to use later.
                var newRecord = ((connection.internal_id == null) || (connection.internal_id.length == 0));
                var datetime = new Date();
                if (!newRecord) {
                    connection.updated = datetime;
                    saveConnectionRequest = connectionObjectStore.put(connection);
                }
                else {
                    connection.created = datetime;
                    connection.updated = datetime;
                    // Saving a new record so lets initialise some values before writing to the object store
                    connection.internal_id = utils.makeid(50);
                    saveConnectionRequest = connectionObjectStore.add(connection);
                }
                saveConnectionRequest.onsuccess = (event) => {
                    //console.log(newRecord ? "connection Added." : "Updated");
                    if (newRecord) {
                        // Add the new record to the internal collection.
                        this.connections.push(connection);

                    }
                    else {
                        // Update the record in the internal collection.
                        var existingConnectionIndex = this.connections.findIndex(c => c.internal_id === connection.internal_id);
                        this.connections[existingConnectionIndex] = connection;
                    }
                    resolve({ added: newRecord, connection: connection });
                }
                saveConnectionRequest.onerror = (event) => {
                    //    console.log("connection not Added."); 
                }
                saveConnectionRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (saveConnectionPromise);
    }

    loadConnections(sortFunction) {
        var loadConnectionsPromise = new Promise((resolve, reject) => {
            // Get the currently active project.
            let projectViewModel = new ProjectViewModel();
            projectViewModel.load().then(result => {
                this._project = projectViewModel.active;

                this.connections = new Connections();
                var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
                openDBRequest.onsuccess = (event) => {
                    var db = event.target.result;
                    var loadConnectionTransaction = db.transaction([this.connectionObjectStoreName], 'readonly');
                    var connectionObjectStore = loadConnectionTransaction.objectStore(this.connectionObjectStoreName);

                    var loadConnectionRequest = connectionObjectStore.getAll();
                    loadConnectionRequest.onsuccess = (event) => {
                        [...event.target.result].forEach(result => {
                            var newConnection = new Connection();
                            newConnection.internal_id = result.internal_id;
                            newConnection.identifier = result.identifier;
                            newConnection.description = result.description;
                            newConnection.source = result.source;
                            newConnection.target = result.target;
                            newConnection.connector = result.connector;
                            newConnection.project_id = result.project_id;
                            newConnection.created = result.created;
                            newConnection.updated = result.updated;

                            // Kludge!!!
                            if (result.project_id == this.project.internal_id) {
                                this.connections.push(newConnection);
                            }
                        });
                        if (sortFunction != null) {
                            this.connections.sort(sortFunction);
                        }
                        resolve(this.connections);
                    };
                    loadConnectionRequest.onerror = (event) => {
                        console.log("Error in loading connections.");
                        reject();
                    }
                    loadConnectionRequest.oncomplete = (event) => {
                        db.close();
                    }
                }
                openDBRequest.onerror = (event) => {
                    alert("Database error: " + JSON.stringify(event));
                    reject();
                };
            });
        });
        return (loadConnectionsPromise);
    }
    deleteConnection(connectionId) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);
        console.assert((connectionId != null) && (connectionId != ""));

        var deleteConnectionPromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var deleteConnectionTransaction = db.transaction([this.connectionObjectStoreName], "readwrite");
                deleteConnectionTransaction.oncomplete = (event) => {
                    console.log("connection deleted!");
                };
                deleteConnectionTransaction.onerror = (event) => {
                    console.error("error: " + event);
                };

                var connectionObjectStore = deleteConnectionTransaction.objectStore(this.connectionObjectStoreName);
                var deleteConnectionRequest = connectionObjectStore.delete(connectionId);
                deleteConnectionRequest.onsuccess = (event) => {
                    console.log("deleted");
                    resolve();
                }
                deleteConnectionRequest.onerror = (event) => {
                    console.log("connection not deleted.");
                }
                deleteConnectionRequest.oncomplete = (event) => {
                    db.close();
                }
            }
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            }
        });
        return (deleteConnectionPromise);
    }
}
