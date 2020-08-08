class VisualiseViewModel extends ViewModel {

    get nodes() {
        return (this.thingViewModel.things);
    }

    get types() {
        return (this.typesViewModel.types);
    }

    get links() {

        return (this.connectionViewModel.connections);
    }
    get connectors() {
        return (this.connectorViewModel.connectors);
    }

    //visualise = new Visualise();
    get project() {
        return (this.projectViewModel.active);
    }
    set project(value) {
        this.projectViewModel.active = value;
    }

    constructor(project) {
        super();
        this._project = project;
        this.thingViewModel = new ThingViewModel();
        this.connectionViewModel = new ConnectionViewModel();
        this.typesViewModel = new TypeViewModel();
        this.connectorViewModel = new ConnectorViewModel();
        this.projectViewModel = new ProjectViewModel();

        this.markers = [];
        this.linkProperties = [];
        this.filters = [];
        this.options= [];
    
    
    }
    deleteConnection(connectionId) {
        const deletePromise = new Promise((resolve, reject) => {
            this.connectionViewModel.deleteConnection(connectionId).then(result => {
                resolve();
            });
        });
        return (deletePromise);

    }
    deleteThing(nodeId) {
        var deletePromise = new Promise((resolve, reject) => {
            this.connectionViewModel.connections = this.connectionViewModel.connections.filter(c => {
                var found = (c.source == nodeId || c.target == nodeId);
                if (found) {
                    this.connectionViewModel.deleteConnection(c.internal_id);
                }
                return (!found);
            })

            this.thingViewModel.deleteThing(nodeId).then(results => {
                var mappedArray = this.thingViewModel.things.map(x => x.internal_id);
                var indexOfThing = mappedArray.indexOf(nodeId);
                this.thingViewModel.things.splice(indexOfThing, 1);
                resolve();
            })
        })
        return (deletePromise);
    }
    saveConnection(connectionData) {
        var saveConnectionPromise = new Promise((resolve, reject) => {
            this.connectionViewModel.saveConnection(connectionData)
                .then((results) => {
                    this.identifyMarkers();
                    resolve(results.connection);
                });
        });

        return (saveConnectionPromise);
    }
    identifyMarkers() {
        this.linkProperties.length = 0;
        this.markers.length = 0;
        // Sift through the connections viewmodel then the connectors to get the markers used
        this.links.forEach(connection => {
            // Get the connector used in this connection.
            var connector = this.connectorViewModel.connectors.find(c => c.internal_id == connection.connector);
            if ((connector != null) && (this.linkProperties.find(c => c.internal_id == connector.internal_id) == null)) {
                this.linkProperties.push(connector);
                var marker = ConnectorLines.data.find(datum => datum.name == connector.marker);
                if (marker != null) {
                    // copy marker data from the library of markers.
                    var newMarker = JSON.parse(JSON.stringify(marker));
                    newMarker.colour = connector.colour;
                    newMarker.internal_id = ((connector.marker_id == null) || (connector.marker_id.length == 0))? utils.makeid(50) : connector.marker_id;
                    connector.marker_id = newMarker.internal_id;
                    this.markers.push(newMarker);
                }
            }
        });

    }
    load(existingData, fromImport) {
        var loadPromise = null;
        if (existingData != null) {
            loadPromise = new Promise((resolve, reject) => {
                this.projectViewModel.saveProject(existingData.project);
                // this.projectViewModel.projects.push(existingData.project);

                this.connectionViewModel.connections = existingData.connections;
                this.thingViewModel.things = existingData.things;
                this.typesViewModel.types = existingData.types;
                this.connectorViewModel.connectors = existingData.connectors;
                existingData.project.internal_id = null;
                this.identifyMarkers();
                resolve();
            });
        }
        else {
            loadPromise = new Promise((resolve, reject) => {
                Promise.all([this.connectionViewModel.loadConnections(),
                this.connectorViewModel.loadConnectors(),
                this.thingViewModel.loadThings(),
                this.typesViewModel.loadTypes(),
                this.loadOptions(),
                this.loadFilter()])
                    .then(results => {
                        // Filter out any items and connectors as required.
                        if(this.filters[0] && (this.filters[0].types != null)) {
                            var filteredThings = [];
                            this.filters[0].types.forEach(filterType => {
                                var xxx = this.thingViewModel.things.filter(thing => thing.type == filterType)
                                xxx.forEach(thing => filteredThings.push(thing));
                            });
                            //console.log("X");
                            this.thingViewModel.things = filteredThings;
                        }
                        if(this.filters[0] && (this.filters[0].connectors != null)) {
                            var filteredConnections = [];
                            this.filters[0].connectors.forEach(filterConnector => {
                                var yyy = this.connectionViewModel.connections.filter(connection => 
                                    connection.connector == filterConnector
                                    )
                                yyy.forEach(connection => filteredConnections.push(connection));
                            });
                            //console.log("X");
                            this.connectionViewModel.connections = filteredConnections;
                        }
                        // Clean up any loose connections
                        this.connectionViewModel.connections = this.connectionViewModel.connections.filter(connection => this.thingViewModel.things.some(thing => thing.internal_id == connection.source) && this.thingViewModel.things.some(thing => thing.internal_id == connection.target));
                        // // Add the project to link any orphans to
                        // var projectThing = new Thing();
                        // projectThing.identifier = this.project.identifier;
                        // projectThing.internal_id = this.project.internal_id;
                        // projectThing.description = this.project.description;
                        // this.thingViewModel.things.push(projectThing);

                        // // Connect any epics to the project
                        // let epicConnections = this.thingViewModel.things.map(thing => {
                        //     let thingType = this.typesViewModel.types.find(type => type.internal_id == thing.type);
                        //     if ((thingType != null) && (thingType.identifier == "Epic")) {
                        //         let newConnection = null;
                        //         newConnection = new Connection();
                        //         newConnection.internal_id = utils.makeid(100);
                        //         newConnection.connector = "";
                        //         newConnection.identifier = "Virtual link (auto-generated)"
                        //         newConnection.description = "Automatically generated link for an Epic."
                        //         newConnection.source = this.project.internal_id;
                        //         newConnection.target = thing.internal_id;
                        //         return (newConnection);
                        //     }
                        // });
                        // epicConnections.forEach(connection => {
                        //     if (connection != null) {
                        //         this.links.push(connection);
                        //     }
                        // })

                        // // Connect any orphan things to the project
                        // let orhpanThingConnections = this.thingViewModel.things.map(thing => {
                        //     let newConnection = null;
                        //     let existingConnection = this.links.filter(link => (link.source == thing.internal_id) || (link.target == thing.internal_id));
                        //     if (existingConnection.length == 0) {
                        //         newConnection = new Connection();
                        //         newConnection.internal_id = utils.makeid(100);
                        //         newConnection.connector = "";
                        //         newConnection.identifier = "Virtual link (auto-generated)"
                        //         newConnection.description = "Automatically generated link for an orphan."
                        //         newConnection.source = this.project.internal_id;
                        //         newConnection.target = thing.internal_id;
                        //         return (newConnection);
                        //     }
                        // })
                        // orhpanThingConnections.forEach(connection => {
                        //     if (connection != null) {
                        //         this.links.push(connection);
                        //     }
                        // })
                        // // Connect any orphan chains to the project
                        // let orhpanChainConnections = this.thingViewModel.things.map(thing => {
                        //     let newConnection = null;
                        //     let existingConnection = this.links.filter(link => (link.target == thing.internal_id));
                        //     if (existingConnection.length == 0) {
                        //         newConnection = new Connection();
                        //         newConnection.internal_id = utils.makeid(100);
                        //         newConnection.connector = "";
                        //         newConnection.identifier = "Orphan link"
                        //         newConnection.description = "Automatically generated link."
                        //         newConnection.source = this.project.internal_id;
                        //         newConnection.target = thing.internal_id;
                        //         return (newConnection);
                        //     }
                        // })
                        // orhpanChainConnections.forEach(connection => {
                        //     if (connection != null) {
                        //         this.links.push(connection);
                        //     }
                        // })

                        if (results == null) {
                            this.options.push(new VisualiseOptions());
                            this.options[0].strength = -4000; // Default value
                            this.options[0].nodeRadius = 20;
                            this.options[0].maxDistance = 500;
                            this.options[0].linkRadius = 250;
                            this.options[0].strokeWidth = 2;
                        }
                        this.identifyMarkers();
                        resolve();
                    })
            })
        }
        return (loadPromise);
    }
    saveThing(thingData) {
        return (this.thingViewModel.saveThing(thingData));
    }
    exportAll() {
        var exportAllPromise = new Promise((resolve, reject) => {
            var all = {
                connections: null,
                connectors: null,
                things: null,
                types: null
            };

            all.connections = this.connectionViewModel.connections;
            all.connectors = this.connectorViewModel.connectors;
            all.things = this.thingViewModel.things;
            all.types = this.typesViewModel.types;
            all.project = this.project;
            resolve(all);
        })
        return (exportAllPromise);
    }
    
    saveOptions(optionsData) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);

        var savevisualiseOptionsPromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var savevisualiseOptionsTransaction = db.transaction([this.visualiseOptionsObjectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                savevisualiseOptionsTransaction.oncomplete = (event) => {
                    console.log("visualiseOptions written!");
                };
                savevisualiseOptionsTransaction.onerror = (event) => {
                    console.error("visualiseOptions error: " + event);
                };
                var visualiseOptionsObjectStore = savevisualiseOptionsTransaction.objectStore(this.visualiseOptionsObjectStoreName);
                var savevisualiseOptionsRequest = null;
                var visualiseOptions = new VisualiseOptions();
                visualiseOptions.internal_id = utils.makeid(20);
                visualiseOptions.identifier = optionsData.identifier;
                visualiseOptions.description = optionsData.description;
                visualiseOptions.nodeRadius = optionsData.nodeRadius;
                visualiseOptions.strength = optionsData.strength;
                visualiseOptions.maxDistance = optionsData.maxDistance;
                visualiseOptions.linkRadius = optionsData.linkRadius;
                visualiseOptions.fill_colour = optionsData.fill_colour;
                visualiseOptions.strokeWidth = optionsData.strokeWidth;
                visualiseOptions.nodeLabels = optionsData.nodeLabels;
                visualiseOptions.pathLabels = optionsData.pathLabels;
                this.options.length = 0;
                this.options.push(visualiseOptions);

                visualiseOptionsObjectStore.clear()
                // Saving a new record so lets initialise some values before writing to the object store
                visualiseOptions.created = new Date();
                savevisualiseOptionsRequest = visualiseOptionsObjectStore.add(visualiseOptions);

                savevisualiseOptionsRequest.onsuccess = (event) => {
                    resolve();
                }
                savevisualiseOptionsRequest.onerror = (event) => { console.log("visualiseOptions not Added."); }
                savevisualiseOptionsRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (savevisualiseOptionsPromise);
    }
    loadOptions(sortFunction) {
        var loadPromise = new Promise((resolve, reject) => {
            this.options.length = 0;
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            console.assert(indexedDB != null, "Cannot find IndexedDB.");
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var loadTransaction = db.transaction([this.visualiseOptionsObjectStoreName], 'readonly');
                var objectStore = loadTransaction.objectStore(this.visualiseOptionsObjectStoreName);

                var loadRequest = objectStore.getAll();
                loadRequest.onsuccess = (event) => {
                    [...event.target.result].forEach(result => {
                        var newOptions = new Type(this.dbName, this.dbVersion);
                        newOptions.internal_id = result.internal_id;
                        newOptions.identifier = result.identifier;
                        newOptions.description = result.description;
                        newOptions.strength = parseInt(result.strength);
                        newOptions.maxDistance = parseInt(result.maxDistance);
                        newOptions.nodeRadius = parseInt(result.nodeRadius);
                        newOptions.fill_colour = result.fill_colour;
                        newOptions.linkRadius = parseInt(result.linkRadius);
                        newOptions.strokeWidth = parseInt(result.strokeWidth);
                        newOptions.nodeLabels = result.nodeLabels;
                        newOptions.pathLabels = result.pathLabels;
                        this.options.push(newOptions);
                    });
                    if (sortFunction != null) {
                        this.types.sort(sortFunction);
                    }
                    resolve(this.options);
                };
                loadRequest.onerror = (event) => {
                    console.log("Error in loading options.");
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
        return (loadPromise);

    }
    saveFilter(filterData) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);

        var savevisualiseFilterPromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var savevisualiseFilterTransaction = db.transaction([this.visualiseFilterObjectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                savevisualiseFilterTransaction.oncomplete = (event) => {
                    console.log("visualiseFilter written!");
                };
                savevisualiseFilterTransaction.onerror = (event) => {
                    console.error("visualiseFilter error: " + event);
                };
                var visualiseFilterObjectStore = savevisualiseFilterTransaction.objectStore(this.visualiseFilterObjectStoreName);
                var savevisualiseFilterRequest = null;
                var visualiseFilter = new VisualiseFilterOptions();
                visualiseFilter.internal_id = utils.makeid(20);
                visualiseFilter.identifier = filterData.identifier;
                visualiseFilter.description = filterData.description;
                visualiseFilter.types = filterData.types;
                visualiseFilter.connectors = filterData.connectors;
                this.filters.length = 0;
                this.filters.push(visualiseFilter);

                visualiseFilterObjectStore.clear()
                // Saving a new record so lets initialise some values before writing to the object store
                visualiseFilter.created = new Date();
                savevisualiseFilterRequest = visualiseFilterObjectStore.add(visualiseFilter);

                savevisualiseFilterRequest.onsuccess = (event) => {
                    resolve();
                }
                savevisualiseFilterRequest.onerror = (event) => { console.log("visualiseFilter not Added."); }
                savevisualiseFilterRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (savevisualiseFilterPromise);
    }
    loadFilter(sortFunction) {
        var loadPromise = new Promise((resolve, reject) => {
            this.filters.length = 0;
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            console.assert(indexedDB != null, "Cannot find IndexedDB.");
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var loadTransaction = db.transaction([this.visualiseFilterObjectStoreName], 'readonly');
                var objectStore = loadTransaction.objectStore(this.visualiseFilterObjectStoreName);

                var loadRequest = objectStore.getAll();
                loadRequest.onsuccess = (event) => {
                    [...event.target.result].forEach(result => {
                        var newFilter = new VisualiseFilterOptions(this.dbName, this.dbVersion);
                        newFilter.internal_id = result.internal_id;
                        newFilter.identifier = result.identifier;
                        newFilter.description = result.description;
                        newFilter.types = result.types;
                        newFilter.connectors = result.connectors;
                        this.filters.push(newFilter);
                    });
                    if (sortFunction != null) {
                        this.types.sort(sortFunction);
                    }
                    resolve(this.filters);
                };
                loadRequest.onerror = (event) => {
                    console.log("Error in loading filter.");
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
        return (loadPromise);

    }
}
