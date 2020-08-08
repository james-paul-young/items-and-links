class ConnectorViewModel extends ViewModel {

    /**
     * All Connectors currently loaded.
     *
     * @since  0.0.1
     * @access private
     *
     * @type     Connectors
     * @memberof ConnectorViewModel
     */
    connectors = new Connectors();
    constructor(project) {
        super();
        // Make sure the required structures exist in the database.  
        this.checkDatabase();
        this._project = project;

    }
    get project() {
        return (this._project);
    }
    set project(value) {
        this._project = value;
        this.connectors = this.connectors.map(connector => {
            connector.project_id = value.internal_id;
            return (connector);
        })
    }
    saveAll() {
        this.connectors.forEach(connector => this.saveConnector(connector));
    }

    saveConnector(connectorData) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);

        var saveConnectorPromise = new Promise((resolve, reject) => {

            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var saveConnectorTransaction = db.transaction([this.connectorObjectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                saveConnectorTransaction.oncomplete = (event) => {
                    console.log("connector written!");
                };
                saveConnectorTransaction.onerror = (event) => {
                    console.error("connector error: " + event);
                };
                var connectorObjectStore = saveConnectorTransaction.objectStore(this.connectorObjectStoreName);
                var saveConnectorRequest = null;
                var connector = new Connector();
                connector.internal_id = connectorData.internal_id;
                connector.identifier = connectorData.identifier;
                connector.description = connectorData.description;
                connector.colour = connectorData.colour;
                connector.marker = connectorData.marker;
                connector.dash = connectorData.dash;
                connector.project_id = this.project.internal_id;

                // Check if a new record is being written. Needed for 
                // determining which operation to use later.
                var newRecord = ((connector.internal_id == null) || (connector.internal_id.length == 0));
                if (!newRecord) {
                    saveConnectorRequest = connectorObjectStore.put(connector);
                }
                else {
                    // Saving a new record so lets initialise some values before writing to the object store
                    connector.internal_id = utils.makeid(50);
                    saveConnectorRequest = connectorObjectStore.add(connector);
                }
                saveConnectorRequest.onsuccess = (event) => {
                    console.log(newRecord ? "connector Added." : "Updated");
                    if (newRecord) {
                        // Add the new record to the internal collection.
                        this.connectors.push(connector);
                    }
                    else {
                        // Update the record in the internal collection.
                        var existingConnectorIndex = this.connectors.findIndex(c => c.internal_id === connector.internal_id);
                        this.connectors[existingConnectorIndex] = connector;
                    }
                    resolve({ added: newRecord, connector: connector });
                }
                saveConnectorRequest.onerror = (event) => { console.log("connector not Added."); }
                saveConnectorRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (saveConnectorPromise);
    }

    loadConnectors(sortFunction) {
        var loadConnectorsPromise = new Promise((resolve, reject) => {
            // Get the currently active project.
            let projectViewModel = new ProjectViewModel();
            projectViewModel.load().then(result => {
                this._project = projectViewModel.active;

                this.connectors = new Connectors();
                var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
                openDBRequest.onsuccess = (event) => {
                    var db = event.target.result;
                    var loadConnectorTransaction = db.transaction([this.connectorObjectStoreName], 'readonly');
                    var connectorObjectStore = loadConnectorTransaction.objectStore(this.connectorObjectStoreName);

                    var loadConnectorRequest = connectorObjectStore.getAll();
                    loadConnectorRequest.onsuccess = (event) => {
                        [...event.target.result].forEach(result => {
                            var newConnector = new Connector();
                            newConnector.internal_id = result.internal_id;
                            newConnector.identifier = result.identifier;
                            newConnector.description = result.description;
                            newConnector.colour = result.colour;
                            newConnector.marker = result.marker;
                            newConnector.dash = result.dash;
                            newConnector.project_id = result.project_id;

                            // Kludge!!!
                            if (result.project_id == this.project.internal_id) {
                                this.connectors.push(newConnector);
                            }
                        });
                        if (sortFunction != null) {
                            this.connectors.sort(sortFunction);
                        }
                        resolve(this.connectors);
                    };
                    loadConnectorRequest.onerror = (event) => {
                        console.log("Error in loading connectors.");
                        reject();
                    }
                    loadConnectorRequest.oncomplete = (event) => {
                        db.close();
                    }
                }
                openDBRequest.onerror = (event) => {
                    alert("Database error: " + JSON.stringify(event));
                    reject();
                };
            });
        });
        return (loadConnectorsPromise);
    }
    deleteConnector(connectorId) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);
        console.assert((connectorId != null) && (connectorId != ""));

        var deleteConnectorPromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var deleteConnectorTransaction = db.transaction([this.connectorObjectStoreName], "readwrite");
                deleteConnectorTransaction.oncomplete = (event) => {
                    console.log("connector deleted!");
                };
                deleteConnectorTransaction.onerror = (event) => {
                    console.error("error: " + event);
                };

                var connectorObjectStore = deleteConnectorTransaction.objectStore(this.connectorObjectStoreName);
                var deleteConnectorRequest = connectorObjectStore.delete(connectorId);
                deleteConnectorRequest.onsuccess = (event) => {
                    console.log("deleted");
                    resolve();
                }
                deleteConnectorRequest.onerror = (event) => {
                    console.log("not deleted.");
                }
                deleteConnectorRequest.oncomplete = (event) => {
                    db.close();
                }
            }
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            }
        });
        return (deleteConnectorPromise);
    }
}
