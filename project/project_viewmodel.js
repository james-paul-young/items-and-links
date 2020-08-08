class ProjectViewModel extends ViewModel {
    /**
     * All Projects currently loaded.
     *
     * @since  0.0.1
     * @access private
     *
     * @type     Projects
     * @memberof ProjectViewModel
     */
    get projects()
    {
        return(this._projects);
    }
    set projects(value) {
        this._projects = value;
    }
    constructor() {
        super();
        this.objectStoreName = this.projectObjectStoreName;
        // Make sure the required structures exist in the database.  
        this.checkDatabase();
        this._projects = new Projects();
        this.current = null;
        this.loaded = false;
        this.thingViewModel = new ThingViewModel();
        this.connectionViewModel = new ConnectionViewModel();
        this.typesViewModel = new TypeViewModel();
        this.connectorViewModel = new ConnectorViewModel();
        this.load(null);
    }
    set active(project) {
        this.projects.forEach(project => {
            project.active = false;
            this.save(project, true);
        })
        project.active = true;
        this.save(project, false);
    }
    get active() {
        return(this.projects.find(project => project.active));
    }

    save(data, suppressUpdateTimestamp) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);

        var savePromise = new Promise((resolve, reject) => {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var saveTransaction = db.transaction([this.objectStoreName], "readwrite");
                // Do something when all the data is added to the database.
                saveTransaction.oncomplete = (event) => {
                    console.log("Written!");
                };
                saveTransaction.onerror = (event) => {
                    console.error("Error: " + event);
                };
                var objectStore = saveTransaction.objectStore(this.objectStoreName);
                var saveRequest = null;
                var project = null;
                if (data.internal_id != null) {
                    var project = this.projects.find(item => item.internal_id == data.internal_id);
                    project.internal_id = data.internal_id;
                }
                else {
                    project = new Project();
                }
                project.identifier = data.identifier;
                project.description = data.description;

                var datetime = new Date();
                if (project.created == null) {
                    project.created = datetime;
                }
                else {
                    if (!suppressUpdateTimestamp) {
                        project.updated = datetime;
                    }
                }
                // Check if a new record is being written. Needed for 
                // determining which operation to use later.
                var newRecord = ((project.internal_id == null) || (project.internal_id.length == 0));
                if (!newRecord) {
                    project.updated = new Date();
                    saveRequest = objectStore.put(project);
                }
                else {
                    // Saving a new record so lets initialise some values before writing to the object store
                    project.internal_id = utils.makeid(50);
                    project.created = new Date();
                    saveRequest = objectStore.add(project);
                }
                saveRequest.onsuccess = (event) => {
                    console.log(newRecord ? "Added." : "Updated");
                    if (newRecord) {
                        // Add the new record to the internal collection.
                        this.projects.push(project);
                    }
                    else {
                        // Update the record in the internal collection.
                        var existingItemIndex = this.projects.findIndex(o => o.internal_id === project.internal_id);
                        this.projects[existingItemIndex] = project;
                    }
                    resolve({ added: newRecord, project: project });
                }
                saveRequest.onerror = (event) => { console.log("Not Added."); }
                saveRequest.oncomplete = (event) => {
                    db.close();
                }
            };
            openDBRequest.onerror = (event) => {
                alert("Database error: " + event.target.errorCode);
                reject();
            };
        });
        return (savePromise);
    }

    load(sortFunction) {
        var loadPromise = new Promise((resolve, reject) => {
            this.length = 0;
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
            openDBRequest.onsuccess = (event) => {
                var db = event.target.result;
                var loadTransaction = db.transaction([this.objectStoreName], 'readonly');
                var objectStore = loadTransaction.objectStore(this.objectStoreName);

                var loadRequest = objectStore.getAll();
                loadRequest.onsuccess = (event) => {
                    [...event.target.result].forEach(result => {
                        var newProject = new Project();
                        newProject.internal_id = result.internal_id;
                        newProject.identifier = result.identifier;
                        newProject.description = result.description;
                        newProject.active = result.active;
                        newProject.created = result._created;
                        newProject.updated = result._updated;

                        this.projects.push(newProject);
                    });
                    if (sortFunction != null) {
                        this.projects.sort(sortFunction);
                    }
                    resolve(this.projects);
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
            this.loaded = true;
        });
        return (loadPromise);
    }
    delete(id) {
        console.assert((this.dbName != null) && (this.dbName != ""));
        console.assert(this.dbVersion != null);
        console.assert((id != null) && (id != ""));

        var deletePromise = new Promise((resolve, reject) => {
            var toDelete = this.projects.find(item => item.internal_id == id);
            if (toDelete != null) {
                var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                var openDBRequest = indexedDB.open(this.dbName, this.dbVersion);
                openDBRequest.onsuccess = (event) => {
                    var db = event.target.result;
                    var deleteTransaction = db.transaction([this.objectStoreName], "readwrite");
                    deleteTransaction.oncomplete = (event) => {
                        console.log("Deleted!");
                    };
                    deleteTransaction.onerror = (event) => {
                        console.error("error: " + event);
                    };

                    var objectStore = deleteTransaction.objectStore(this.objectStoreName);
                    var deleteRequest = objectStore.delete(id);
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
            }
        });
        return (deletePromise);
    }
    importAll(importContent) {
        var importPromise = new Promise((resolve, reject) => {
            this.connectionViewModel.connections = [];
            this.connectorViewModel.connectors = [];
            this.thingViewModel.things = [];
            this.typesViewModel.types = [];

            var imported = JSON.parse(importContent);
            if(imported.project == null) {
                imported.project = { internal_id: "imported" + imported.length, description: "Imported project", identifier: "Imported Project", }
            }
            this.projects.push(imported.project);
            // imported.project.internal_id = null;
            this.save(imported.project).then(result => {
                this.active = result.project;

                this.connectionViewModel.connections = imported.connections;
                this.connectionViewModel.project = this.active;
                this.connectionViewModel.saveAll();

                this.thingViewModel.things = imported.things;
                this.thingViewModel.project = this.active;
                this.thingViewModel.saveAll();

                this.typesViewModel.types = imported.types;
                this.typesViewModel.project = this.active;
                this.typesViewModel.saveAll();

                this.connectorViewModel.connectors = imported.connectors;
                this.connectorViewModel.project = this.active;
                this.connectorViewModel.saveAll();
    
                this.load({
                    connections: this.connectionViewModel.connections, 
                    things: this.thingViewModel.things,
                    types: this.typesViewModel.types,
                    connectors: this.connectorViewModel.connectors, 
                }).then(() => {
                    resolve(true);
                });
    
            });
        });
        return (importPromise);
    }
    importJiras(importContent) {
        var importPromise = new Promise((resolve, reject) => {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(importContent, "text/xml");

            var connections = [];
            var items = [];
            var connectors = [];
            var types = [];

            var jiraItems = Array.from(xmlDoc.getElementsByTagName("item"));
            var jiraItemKeys = Array.from(jiraItems).map(item => {
                var key = item.querySelector("key");
                return ({ id: key.getAttribute("id"), value: key.innerHTML, })
            });
            jiraItems.map(item => {
                const type = item.querySelector("type");
                const typeName = type.innerHTML;
                const typeId = type.getAttribute("id");
                if (types.find(findType => findType.jiraId == typeId) == null) {
                    let saveType = new Type();
                    saveType.identifier = typeName;
                    saveType.description = "Imported from Jira";
                    saveType.jiraId = typeId;
                    types.push(saveType);
                }

                const key = item.querySelector("key");
                const id = key.getAttribute("id");
                // const identifier = key.innerHTML;
                const identifier = item.querySelector("title").innerHTML;
                const description = item.querySelector("description").innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                var thing = new Thing();
                thing.identifier = identifier;
                thing.jiraId = id;
                const jiraTypeId = item.querySelector("type").getAttribute("id");
                thing.jiraTypeId = types.find(type => type.jiraId == jiraTypeId).jiraId;

                thing.description = description;
                items.push(thing);

                if (item.querySelector("issuelinks") != null) {
                    // #region issuelinks
                    var issueLinks = Array.from(item.querySelectorAll("issuelinks"));
                    issueLinks.forEach(issueLink => {
                        if (issueLink.querySelectorAll("inwardlinks") != null) {
                            const inwardConnectorsArray = Array.from(issueLink.querySelectorAll("inwardlinks"));
                            const mappedInwardConnectors = inwardConnectorsArray.map(inwardConnector => {
                                var identifier = inwardConnector.getAttribute("description");
                                var description = "Imported from Jira";
                                if (inwardConnector.querySelectorAll("issuelink") != null) {
                                    const inwardConnections = Array.from(inwardConnector.querySelectorAll("issuelink"));
                                    const mappedConnections = inwardConnections.map(inwardConnection => {
                                        if (inwardConnection.querySelectorAll("issuekey")) {
                                            const issueKeys = Array.from(inwardConnection.querySelectorAll("issuekey"));
                                            const mappedIssueKeys = issueKeys.map(issueKey => {
                                                const targetItemId = issueKey.getAttribute("id");
                                                let connection = new Connection();
                                                connection.identifier = identifier;
                                                connection.jiraSourceId = id; // From the current Item (way back at the beginning of this loop)
                                                connection.jiraTargetId = targetItemId;
                                                connection.description = "Imported from Jira";
                                                connections.push(connection);

                                                // Find the connector in the collection
                                                let connector = connectors.find(connector => connector.identifier == identifier);
                                                if (connector == null) {
                                                    let newConnector = new Connector();
                                                    newConnector.identifier = identifier;
                                                    newConnector.description = "Imported from Jira.";
                                                    connectors.push(newConnector);
                                                }
                                            })
                                        }
                                    });
                                }
                                return ({ identifier: identifier, description: description });
                            });
                        }
                        if (issueLink.querySelectorAll("outwardlinks") != null) {
                            const outwardConnectorsArray = Array.from(issueLink.querySelectorAll("outwardlinks"));
                            const mappedOutwardConnectors = outwardConnectorsArray.map(outwardConnector => {
                                const identifier = outwardConnector.getAttribute("description");
                                const description = "Imported from Jira";
                                if (outwardConnector.querySelectorAll("issuelink") != null) {
                                    const outwardConnections = Array.from(outwardConnector.querySelectorAll("issuelink"));
                                    const mappedConnections = outwardConnections.map(outwardConnection => {
                                        if (outwardConnection.querySelectorAll("issuekey")) {
                                            const issueKeys = Array.from(outwardConnection.querySelectorAll("issuekey"));
                                            const mappedIssueKeys = issueKeys.map(issueKey => {
                                                const targetItemId = issueKey.getAttribute("id");
                                                let connection = new Connection();
                                                connection.identifier = identifier;
                                                connection.jiraSourceId = id; // From the current Item (way back at the beginning of this loop)
                                                connection.jiraTargetId = targetItemId;
                                                connection.description = "Imported from Jira";
                                                connections.push(connection);

                                                // Find the connector in the collection
                                                let connector = connectors.find(connector => connector.identifier == identifier);
                                                if (connector == null) {
                                                    let newConnector = new Connector();
                                                    newConnector.identifier = identifier;
                                                    newConnector.description = "Imported from Jira.";
                                                    connectors.push(newConnector);
                                                }
                                            })
                                        }
                                    });
                                }
                                return ({ identifier: identifier, description: description });
                            });
                        }
                    });
                    // #endregion
                }
                var customfieldsss = Array.from(item.querySelectorAll("customfields"));
                customfieldsss.forEach(customfieldss => {
                    const customfields = Array.from(customfieldss.querySelectorAll("customfield"));
                    customfields.forEach(customfield => {
                        const key = customfield.getAttribute("key");
                        if (key.indexOf("epic-link") > -1) {
                            // Epic link found
                            // const targetItemId = issueKey.getAttribute("id");
                            const customfieldValuesss = customfield.querySelectorAll("customfieldvalues");
                            customfieldValuesss.forEach(customfieldvaluess => {
                                const customfieldvalues = customfieldvaluess.querySelectorAll("customfieldvalue");
                                customfieldvalues.forEach(customfieldvalue => {

                                    const targetJiraKey = customfieldvalue.innerHTML;
                                    const target = jiraItemKeys.find(key => key.value == targetJiraKey);
                                    if (target != null) {
                                        let connection = new Connection();
                                        connection.identifier = "Epic Link";
                                        connection.description = "Imported from Jira";
                                        connection.jiraSourceId = target.id; // From the current Item (way back at the beginning of this loop)
                                        connection.jiraTargetId = id;
                                        connections.push(connection);

                                        // Find the connector in the collection
                                        let connector = connectors.find(connector => connector.identifier == connection.identifier);
                                        if (connector == null) {
                                            let newConnector = new Connector();
                                            newConnector.identifier = connection.identifier;
                                            newConnector.description = "Imported from Jira.";
                                            connectors.push(newConnector);
                                        }
                                    }
                                })
                            })
                        }

                    });
                });
            });

            let savePromisesArray = [];

            this.typesViewModel.project = this.active;
            this.typesViewModel.loadTypes().then(result => {});
            types.forEach(type => {
                if(this.typesViewModel.types.find(existingType => type.jiraId == existingType.jiraId) == null) {
                    savePromisesArray.push(this.typesViewModel.saveType(type));
            }
        })

            this.connectorViewModel.project = this.active;
            connectors.forEach(connector => {
                savePromisesArray.push(this.connectorViewModel.saveConnector(connector));
            });
            Promise.all(savePromisesArray).then(results => {
                let saveThingArray = [];
                this.thingViewModel.project = this.active;
                items.forEach(item => {
                    const thingType = this.typesViewModel.types.find(type => type.jiraId == item.jiraTypeId);
                    if (thingType != null) {
                        item.type = thingType.internal_id;
                    }
                    saveThingArray.push(this.thingViewModel.saveThing(item));
                })
                Promise.all(saveThingArray).then(results => {
                    this.connectionViewModel.project = this.active;
                    connections.forEach(connection => {
                        const source = this.thingViewModel.things.find(item => item.jiraId == connection.jiraSourceId);
                        const target = this.thingViewModel.things.find(item => item.jiraId == connection.jiraTargetId);
                        const connectionType = this.connectorViewModel.connectors.find(connector => connector.identifier == connection.identifier);
                        if (connectionType != null) {
                            connection.connector = connectionType.internal_id;
                        }
                        if (source != null) {
                            connection.source = source.internal_id;
                        }
                        if (target != null) {
                            connection.target = target.internal_id;
                        }
                        // Don't save the connection if either the source or target does not exist.
                        if ((connection.source != null) && (connection.target != null)) {
                            this.connectionViewModel.saveConnection(connection);
                        }
                    });
                });
            });
            resolve(items);
        });
        return (importPromise);
    }
    exportAll() {
        var exportAllPromise = new Promise((resolve, reject) => {
            var all = {
                connections: null,
                connectors: null,
                things: null,
                types: null
            };

            this.connectionViewModel.project = this.active;
            this.connectorViewModel.project = this.active;
            this.thingViewModel.project = this.active;
            this.typesViewModel.project = this.active;

            Promise.all([this.connectionViewModel.loadConnections(), this.connectorViewModel.loadConnectors(), this.thingViewModel.loadThings(), this.typesViewModel.loadTypes()]).then(result => {
                all.connections = this.connectionViewModel.connections.copy();
                all.connectors = this.connectorViewModel.connectors.copy();
                all.things = this.thingViewModel.things.copy();
                all.types = this.typesViewModel.types.copy();
                all.project = this.active.copy();
                resolve(all);
            })
        })
        return (exportAllPromise);
    }

}
	