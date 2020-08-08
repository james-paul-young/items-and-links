class ConnectionProperties {

    /**
    * 
    * @param {Array} connectors The connectors to be used when creating connections between things.
    * @param {Array} things A list of sources and targets to connect.
    * @param {applicationResources} applicationResources Localisation support
    * @param {thingResources} thingResources Localisation support
    */
    constructor(applicationResources, connectionResources, connectors, things, types, activeProject) {
        this.connection = null;
        this.saveConnectionButton = null;
        this.saveCallback = null;
        this.modal = null;
        this.activeProject = activeProject;

        this.connectors = connectors;
        this.things = things;
        this.types = types;
        this.modal = document.createElement("div");
        this.modal.setAttribute("id", "connectionModal");
        this.modal.setAttribute("class", "modal fade");
        this.modal.setAttribute("tabindex", "-1");
        this.modal.setAttribute("role", "dialog");
        this.modal.innerHTML = `    
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Properties</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                        <fieldset>
                            <label for="connectionIdentifierInput">Identifier</label>
                            <input class="form-control" id="connectionIdentifierInput" placeholder="Enter identifier"></input>
                            <small id="connectionIdentifierHelp" class="form-text text-muted">Text displayed on visual
                            representations.</small>
            
                            <label for="connectionDescriptionInput">Description</label>
                            <textarea id="connectionDescriptionInput" class="form-control " placeholder="Enter description"
                            rows="3"></textarea>
            
                            <label for="connectionSourceInput">Source</label>
                            <select class="form-control" id="connectionSourceInput" placeholder="Source"></select>
                            <small id="connectionSourceHelp" class="form-text text-muted">The beginning of the
                            connection.</small>
            
                            <label for="connectionConnectorInput">Connector</label>
                            <ul id="connectionConnectorInput" class="list-group connectorsInput">
                            </ul>

                            <label for="connectionTargetInput">Target</label>
                            <select class="form-control" id="connectionTargetInput" placeholder="Target"></select>
                            <small id="connectionTargetHelp" class="form-text text-muted">The end of the connection.</small>
            
                            <label for="connectionCreatedInput">Created</label>
                            <input class="form-control" id="connectionCreatedInput" placeholder="" readonly=""></input>
                            <small id="connectionCreatedHelp" class="form-text text-muted">The date and time the connection was created.</small>

                            <label for="connectionUpdatedInput">Updated</label>
                            <input class="form-control" id="connectionUpdatedInput" placeholder="" readonly=""></input>
                            <small id="connectionUpdatedHelp" class="form-text text-muted">The date and time the connection was updated.</small>
            
                            <div class="modal-footer">
                                <button id="deleteConnectionButton" class="btn btn-primary" data-dismiss="modal">${applicationResources.deleteString}</button>
                                <button id="saveConnectionButton" class="btn btn-primary" data-dismiss="modal">Save</button>
                                <button id="cancelConnectionButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
      `
    }
    /**
    * @param {Connection} connection The data of the thing to display to the user.
    * @param {function} saveCallback Function to invoke when the user requests to save.
    */
    view(connection, saveCallback, sourceOverride, targetOverride, deleteCallback) {

        delete document.getElementById("connectionModal").dataset.internal_id;

        if (this.saveConnectionButton == null) {
            // Set up all the links to the HTML buttons.
            this.saveConnectionButton = document.getElementById("saveConnectionButton");
            console.assert(saveConnectionButton != null, "Cannot find saveConnectionButton");
            this.saveConnectionButton.addEventListener("click", event => {
                if (saveCallback != null) {
                    this.saveCallback = saveCallback;
                    this.save();
                }
            });
        }
        if (this.deleteConnectionButton == null) {
            // Set up all the links to the HTML buttons.
            this.deleteConnectionButton = document.getElementById("deleteConnectionButton");
            console.assert(deleteConnectionButton != null, "Cannot find deleteConnectionButton");
            this.deleteConnectionButton.addEventListener("click", event => {
                if (deleteCallback != null) {
                    this.deleteCallback = deleteCallback;
                    this.delete();
                }
            });
        }

        var sourceInput = document.getElementById("connectionSourceInput");
        var targetInput = document.getElementById("connectionTargetInput");
        targetInput.innerHTML = "";
        sourceInput.innerHTML = "";
        sourceInput.value = "";
        targetInput.value = "";
        var blankOption = document.createElement("option");
        sourceInput.appendChild(blankOption);
        
        var projectOption = document.createElement("option");
        projectOption.innerHTML = "<strong>" + this.activeProject.identifier + " (Project)</strong>";
        projectOption.value = this.activeProject.internal_id;
        sourceInput.appendChild(projectOption);

        targetInput.appendChild(blankOption.cloneNode());
        this.things.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier));
        this.things.forEach(thing => {
            var thingOption = document.createElement("option");
            thingOption.innerHTML = thing.identifier;
            const type = this.types.find(t => t.internal_id == thing.type);
            if(type != null) {
                thingOption.innerHTML = thingOption.innerHTML + " (<strong>" + type.identifier + "</strong>)";
            }
            thingOption.value = thing.internal_id;
            sourceInput.appendChild(thingOption);
            var targetThingOption = thingOption.cloneNode();
            targetThingOption.innerHTML = thing.identifier;
            if(type != null) {
                targetThingOption.innerHTML = targetThingOption.innerHTML + " (<strong>" + type.identifier + "</strong>)";
            }
            targetInput.appendChild(targetThingOption);
        });

        document.getElementById("connectionSourceInput").value = (connection == null) ? "" : connection.source;
        if (sourceOverride != null) {
            document.getElementById("connectionSourceInput").value = sourceOverride;
        }
        document.getElementById("connectionTargetInput").value = (connection == null) ? "" : connection.target;
        if (targetOverride != null) {
            document.getElementById("connectionTargetInput").value = targetOverride
        }
        document.getElementById("connectionIdentifierInput").value = (connection == null) ? "" : connection.identifier;
        document.getElementById("connectionDescriptionInput").value = (connection == null) ? "" : connection.description;
        if(connection != null) {
            document.getElementById("connectionModal").dataset.internal_id = connection.internal_id;
        }
        if(connection != null) {
            document.getElementById("connectionCreatedInput").value = (connection.created == null) ? "" : connection.created;
            document.getElementById("connectionUpdatedInput").value = (connection.updated == null) ? "" : connection.updated;
        }

        var connectorList = document.getElementById("connectionConnectorInput");
        connectorList.setAttribute("class", "connectorList border")
        connectorList.innerHTML = "";

        this.connectors.forEach(connector => {
            var connectorListItem = document.createElement("li");
            connectorListItem.setAttribute("class", "connectorListItem");
            connectorListItem.dataset.internal_id = connector.internal_id;
            connectorListItem.dataset.connector_list_id = connectorList.id;
            if ((connection != null) && (connector.internal_id == connection.connector)) {
                connectorListItem.classList.toggle("connectorListSelectedItem");
            }
            var connectorDiv = document.createElement("div");
            var connectorVisualSpan = document.createElement("span");
            var connectorTextSpan = document.createElement("span");
            if ((connection != null) && (connection.internal_id == connectorListItem.dataset.internal_id)) {
                connectorListItem.classList.toggle("connectorListSelectedItem");
            }
            connectorListItem.addEventListener("click", (event) => {
                var connectorList = document.getElementById(event.currentTarget.dataset.connector_list_id)
                var allconnectorListItems = connectorList.querySelectorAll(".connectorListItem");
                [...allconnectorListItems].forEach(connectorListItem => {
                    connectorListItem.classList.remove("connectorListSelectedItem");
                });
                event.currentTarget.classList.toggle("connectorListSelectedItem");
            });

            connectorVisualSpan.id = utils.makeid(20);
            connectorDiv.dataset.internal_id = connector.internal_id;
            connectorDiv.appendChild(connectorVisualSpan);

            connectorTextSpan.innerHTML = connector.identifier;
            connectorDiv.appendChild(connectorTextSpan);

            connectorListItem.appendChild(connectorDiv);
            connectorList.appendChild(connectorListItem);

            var svg = d3.select("#" + connectorVisualSpan.id).append('svg')
                .attr('width', 100)
                .attr('height', 20)
                .attr('id', "svg" + connectorDiv.id);
            var referenceMarker = ConnectorLines.data.find((datum) => datum.name == connector.marker);
            if (referenceMarker != null) {
                var marker = JSON.parse(JSON.stringify(referenceMarker));
                marker.colour = connector.colour;
                marker.width = 5;
                marker.height = 5;
                marker.internal_id = connector.internal_id;
                var dash = ConnectorLines.dashes.find((dash) => dash.name == connector.dash);
                ConnectorLines.createLineAndMarker(svg, 100, 20, marker, dash);
                var selectedConnector = document.getElementById(connector.internal_id);
                if (selectedConnector != null) {
                    selectedConnector.classList.toggle("connectorListSelectedItem");
                }
            }
        });
    }
    delete() {
        if (this.deleteCallback != null) {
            var connectionInternal_id = document.getElementById("connectionModal").dataset.internal_id == null? null : document.getElementById("connectionModal").dataset.internal_id;
            this.deleteCallback(connectionInternal_id);
        }
    }
    save() {
        // Get all the input elements from the modal dialog.
        var connectionInternal_id = document.getElementById("connectionModal").dataset.internal_id == null? null : document.getElementById("connectionModal").dataset.internal_id;
        var connectionIdentifierInput = document.getElementById("connectionIdentifierInput");
        var connectionDescriptionInput = document.getElementById("connectionDescriptionInput");
        var connectionSourceInput = document.getElementById("connectionSourceInput");
        var connectionTargetInput = document.getElementById("connectionTargetInput");
        var connectorListSelectedItem = document.querySelectorAll(".connectorListSelectedItem");
        var selectedConnector = null;
        if ((connectorListSelectedItem != null) && (connectorListSelectedItem.length > 0)) {
            selectedConnector = connectorListSelectedItem[0].dataset.internal_id;
        }
        var connectionToSave = {
            internal_id: connectionInternal_id,
            identifier: connectionIdentifierInput.value,
            description: connectionDescriptionInput.value,
            source: connectionSourceInput.value,
            target: connectionTargetInput.value,
            connector: selectedConnector
        }
        if (this.saveCallback != null) {
            this.saveCallback(connectionToSave);
        }
    }

}
