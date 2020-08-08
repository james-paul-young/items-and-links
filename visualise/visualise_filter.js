class VisualiseFilter {

    /**
     * 
     * @param {Types} types An array of types the user can select from when creating/updating the thing.
     * @param {applicationResources} applicationResources Localisation support
     * @param {thingResources} thingResources Localisation support
     */
    constructor(applicationResources, visualiseResources) {
        this.HTML = "";
        this.modal = null;
        this.saveCallback = null;
        this.connectors = [];
        this.things = [];
        this.thingTypes = [];

        this.modal = document.createElement("div");
        this.modal.setAttribute("id", "filterModal");
        this.modal.setAttribute("class", "modal fade");
        this.modal.setAttribute("tabindex", "-1");
        this.modal.setAttribute("role", "dialog");
        this.modal.innerHTML = `  
        <!-- The Visualise Filter Modal -->
        <!-- Modal content -->
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="">Visualise Filter</h5>
                    <button id="visualiseFilterCloseButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label for="typesList">Item types</label>
                            <select id="typesList" multiple="" class="form-control tallList"></select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label for="connectorsList">Connector types</label>
                            <select id="connectorsList" multiple="" class="form-control tallList"></select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="saveFilterButton" class="btn btn-primary" data-dismiss="modal">OK</button>
                <button id="cancelFilterButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
            </div>
        </div>
        `;
    }
    view(filterToDisplay, saveCallback, thingTypes, connectors) {

        this.saveCallback = saveCallback;
        this.thingTypes = thingTypes;
        this.connectors = connectors;

        if (this.saveFilterButton == null) {
            // Set up all the links to the HTML buttons.
            this.saveFilterButton = document.getElementById("saveFilterButton");
            console.assert(saveFilterButton != null, "Cannot find saveFilterButton");
            this.saveFilterButton.addEventListener("click", event => {
                if (this.saveCallback != null) {
                    this.saveCallback = saveCallback;
                    this.save();
                }
            });
        }
        this.listConnectors("connectorsList", this.connectors, filterToDisplay);
        this.listTypes("typesList", this.thingTypes, filterToDisplay);
    }
    listTypes(typesTableName, types, filterToDisplay) {
        var listTypesPromise = new Promise((resolve, reject) => {
            var table = document.getElementById(typesTableName);

            // Add the header row.
            table.innerHTML = ``;
            types.forEach((type) => {
                this.DisplayTypeRow(table, type, filterToDisplay);
            });
        });
        return (listTypesPromise);
    }

    listConnectors(connectorsTableName, connectors, filterToDisplay) {
        var listConnectorsPromise = new Promise((resolve, reject) => {
            var table = document.getElementById(connectorsTableName);

            // Add the header row.
            table.innerHTML = ``;
            connectors.forEach((connector) => {
                this.DisplayConnectorRow(table, connector, filterToDisplay);
            });
        });
        return (listConnectorsPromise);
    }
    DisplayConnectorRow(table, connector, filterToDisplay) {
        var connectorOption = document.createElement("option");
        connectorOption.value = "option_" + connector.internal_id;
        connectorOption.innerHTML = connector.identifier;
        if(filterToDisplay.connectors.some(c => c == connector.internal_id)) {
            connectorOption.selected = true;
        }

        table.appendChild(connectorOption);

        // Try to find the row in the table
        //var row = document.getElementById("Connector_" + connector.internal_id);

        // if (row == null) {
        //     // Row not found. Create a new row in the table and set it's id for future reference.
        //     row = table.insertRow(table.rows.length);
        //     row.setAttribute("id", "Connector_" + connector.internal_id);
        // }
        // else {
        //     row.innerHTML = "";
        // }

        // var visibleCell = row.insertCell(-1);
        // var identifierCell = row.insertCell(-1);
        // var styleCell = row.insertCell(-1);
        // var descriptionCell = row.insertCell(-1);

        // var connectorVisualDiv = document.createElement("div");
        // connectorVisualDiv.id = utils.makeid(50);
        // styleCell.appendChild(connectorVisualDiv);

        // var svg = d3.select("#" + connectorVisualDiv.id).append('svg')
        //     .attr('width', 100)
        //     .attr('height', 20)
        //     .attr('id', "svg_" + connectorVisualDiv.id);
        // var marker = ConnectorLines.data.find(datum => datum.name == connector.marker);
        // if (marker != null) {
        //     var connectorMarker = JSON.parse(JSON.stringify(marker));
        //     connectorMarker.internal_id = utils.makeid(20);
        //     connectorMarker.colour = connector.colour;
        //     connectorMarker.height = 5;
        //     connectorMarker.width = 5;
        //     connector.marker = connectorMarker.internal_id;
        //     var connectorDash = ConnectorLines.dashes.find(dash => dash.name == connector.dash);
        //     ConnectorLines.createLineAndMarker(svg, 100, 20, connectorMarker, connectorDash, connector.colour);
        // }

        // identifierCell.innerHTML = connector.identifier;
        // descriptionCell.innerHTML = connector.description;

        // var addRowPromise = new Promise((resolve, reject) => {
        //     visibleCell.innerHTML = `<input type="checkbox" class="form-check" id="visible_ + ${connector.internal_id}">`

        // //     actionsCell.innerHTML = `
        // //     <button type="button" id="${this.uiElementNames.viewButtonPrefix + connector.internal_id}" data-internal_id="${connector.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
        // //         data-target="#${this.uiElementNames.connectorModal}"><i class="fas fa-eye"></i> ${connectorResources.viewButtonString}</button>
        // //     <button type="button" id="${this.uiElementNames.deleteButtonPrefix + connector.internal_id}" data-internal_id="${connector.internal_id}" class="deleteButton btn btn-danger btn-sm">
        // //         <i class="fas fa-trash"></i> ${connectorResources.deleteButtonString}
        // //     </button>`;
        //      resolve();
        // });
        // addRowPromise.then(() => {
        // //     var viewConnectorButton = document.getElementById(this.uiElementNames.connectorRowPrefix + connector.internal_id);
        // //     var connectorinternal_id = viewConnectorButton.dataset.internal_id;
        // //     // Find the connector in the loaded connector collection.
        // //     console.assert(viewConnectorButton != null, "Can't find viewConnectorButton");
        // //     viewConnectorButton.addEventListener("click", event => this.view(connectorinternal_id));

        // //     var deleteConnectorButton = document.getElementById(this.uiElementNames.deleteButtonPrefix + connector.internal_id);
        // //     var connectorinternal_id = deleteConnectorButton.dataset.internal_id;
        // //     // Find the connector in the loaded connector collection.
        // //     console.assert(deleteConnectorButton != null, "Can't find deleteConnectorButton");
        // //     deleteConnectorButton.addEventListener("click", event => this.delete(connectorinternal_id));

        // });

    }
    DisplayTypeRow(table, type, filterToDisplay) {
        var typeOption = document.createElement("option");
        typeOption.value = "option_" + type.internal_id;
        typeOption.innerHTML = type.identifier;
        if(filterToDisplay.types.some(t => t == type.internal_id)) {
            typeOption.selected = true;
        }

        table.appendChild(typeOption);

        // console.assert(table != null, "No table to display Types in.");
        // console.assert(type != null, "No type to display in table row.");
        // // Try to find the row in the table
        // var row = document.getElementById("Type_" + type.internal_id);

        // if (row == null) {
        //     // Row not found. Create a new row in the table and set it's id for future reference.
        //     row = table.insertRow(table.rows.length);
        //     row.setAttribute("id", "Type_" + type.internal_id);
        // }
        // else {
        //     row.innerHTML = "";
        // }

        // var visibleCell = row.insertCell(-1);
        // var identifierCell = row.insertCell(-1);
        // var descriptionCell = row.insertCell(-1);

        // identifierCell.innerHTML = type.identifier;
        // descriptionCell.innerHTML = type.description;

        // var addRowPromise = new Promise((resolve, reject) => {
        //     visibleCell.innerHTML = `<input type="checkbox" class="form-check" id="visible_ + ${type.internal_id}">`

        // //     actionsCell.innerHTML = `
        // //     <button type="button" id="${this.uiElementNames.viewButtonPrefix + type.internal_id}" data-internal_id="${type.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
        // //         data-target="#${this.uiElementNames.typeModal}"><i class="fas fa-eye"></i> ${typeResources.viewButtonString}</button>
        // //     <button type="button" id="${this.uiElementNames.deleteButtonPrefix + type.internal_id}" data-internal_id="${type.internal_id}" class="deleteButton btn btn-danger btn-sm">
        // //         <i class="fas fa-trash"></i> ${typeResources.deleteButtonString}
        // //     </button>`;
        //      resolve();
        // });
        // addRowPromise.then(() => {
        // //     var viewTypeButton = document.getElementById(this.uiElementNames.typeRowPrefix + type.internal_id);
        // //     var typeinternal_id = viewTypeButton.dataset.internal_id;
        // //     // Find the type in the loaded type collection.
        // //     console.assert(viewTypeButton != null, "Can't find viewTypeButton");
        // //     viewTypeButton.addEventListener("click", event => this.view(typeinternal_id));

        // //     var deleteTypeButton = document.getElementById(this.uiElementNames.deleteButtonPrefix + type.internal_id);
        // //     var typeinternal_id = deleteTypeButton.dataset.internal_id;
        // //     // Find the type in the loaded type collection.
        // //     console.assert(deleteTypeButton != null, "Can't find deleteTypeButton");
        // //     deleteTypeButton.addEventListener("click", event => this.delete(typeinternal_id));

        // });

    }
    save() {
        var savePromise = new Promise((resolve, reject) => {
            var filterToSave = null;
            var typesList = document.getElementById("typesList");
            var connectorsList = document.getElementById("connectorsList");

            var typesFilterItems = [...typesList.options].filter(option => option.selected);
            var typesFilter = typesFilterItems.map(filterItem => filterItem.value.replace("option_", ""));

            var connectorsFilterItems = [...connectorsList.options].filter(option => option.selected);
            var connectorsFilter = connectorsFilterItems.map(filterItem => filterItem.value.replace("option_", ""));

            filterToSave = {
                connectors: connectorsFilter,
                types: typesFilter,
            };
            if (this.saveCallback != null) {
                this.saveCallback(filterToSave);
            }
            resolve(filterToSave);
        });
        return (savePromise);
    }
}