class ConnectorView extends ApplicationView {
    uiElementNames = {
        /**
         * Main table listing all Connectors.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorsTable: "connectorsTable",
        /**
         * The identifier of the Connector.
         *
         * @since  0.0.1
        * @access public
         *
         * @type     string
         */
        connectorIdentifierInput: "connectorIdentifierInput",
        /**
         * The description of the Connector.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorDescriptionInput: "connectorDescriptionInput",
        /**
         * Colour selector on Modal.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorColourInput: "connectorColourInput",
        /**
         * Modal that allows user to enter information about a Connector.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorModal: "connectorModal",
        /**
         * Save button on the type modal.
        *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        saveConnectorButton: "saveConnectorButton",
        /**
         * Label used to display the text for creating a new Connector.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        createConnectorLabel: "createConnectorLabel",

        /**
         * Button used to create a new Connector.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        createConnectorButton: "createConnectorButton",
        /**
         * Marker selector on Modal.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorMarkerInput: "connectorMarkerInput",
        /**
         * The prefix used to prepend to each "view" action within a Connector row in the Connector table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        viewButtonPrefix: "View_",
        /**
         * The prefix used to prepend to each "delete" action within a Connector row in the Connector table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        deleteButtonPrefix: "Delete_",
        /**
         * The prefix used to prepend to each Connector row in the Connector table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorRowPrefix: "Row_",
        /**
         * The attribute used to store the internal id of the Connector.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        connectorInternalIdAttribute: "connectorinternal_id",
        connectorIconHelp: "connectorIconHelp",
        connectorIdentifierHelp: "connectorIdentifierHelp",
        connectorMarkerHelp: "connectorMarkerHelp",
        connectorDescriptionHelp: "connectorDescriptionHelp",
        modalTitle: "modalTitle",
        pageTitle: "pageTitle"
    }
    classNames = {
        connectorsInputSelected: ".connectorsInputSelected"
    }

    // Used to reference the main table on the Connectors page.
    connectorsTableName = "connectorsTable";

    connectorViewModel = new ConnectorViewModel();
    constructor() {
        super(applicationResources.connectorPageString);
        // Set up all the links to the HTML buttons.
        var saveConnectorButton = document.getElementById(this.uiElementNames.saveConnectorButton);
        console.assert(saveConnectorButton != null, "Cannot find saveConnectorButton");
        saveConnectorButton.addEventListener("click", event => this.save());

        var createconnectorButton = document.getElementById(this.uiElementNames.createConnectorButton);
        console.assert(createconnectorButton != null, "Cannot find createconnectorButton");
        createconnectorButton.addEventListener("click", event => this.create());

        this.connectorViewModel.loadConnectors()
            .then(connectors => {
                this.loadResources();
                this.list(this.uiElementNames.connectorsTable, connectors);
            })

        // Set up the event for handling the change of colour in the Properties modal.
        document.getElementById(this.uiElementNames.connectorColourInput).addEventListener("change", (event) => {
            // Get the current dash and marker names to restore the selection after redrawing markers
            var selectedConnectorListItem = document.querySelector(this.classNames.connectorsInputSelected);
            var markerName = null;
            var dashName = null;
            if (selectedConnectorListItem) {
                markerName = selectedConnectorListItem.dataset.marker;
                dashName = selectedConnectorListItem.dataset.dash;
            }
            // Redraw all candidate lines with the new selected colour.
            ConnectorLines.drawDashesAndMarkersSelect(this.uiElementNames.connectorMarkerInput, event.currentTarget.value, dashName, markerName);
        });
    }
    loadResources() {
        document.title = applicationResources.applicationNameString + " - " + connectorResources.pageTitleString;
        document.getElementById("pageTitle").innerHTML = connectorResources.pageTitleString + " (" + this.connectorViewModel.project.identifier + ")";
    }

    delete(connectorId) {
        this.connectorViewModel.deleteConnector(connectorId).then(() => {
            var connectorRow = document.getElementById(this.uiElementNames.connectorRowPrefix + connectorId);
            console.assert(connectorRow != null, "Can't find the row to delete.")
            var table = document.getElementById(this.connectorsTableName);
            table.deleteRow(connectorRow.rowIndex);
        });
    }
    create() {
        delete document.getElementById(this.uiElementNames.connectorModal).dataset.internal_id;
        document.getElementById(this.uiElementNames.connectorIdentifierInput).value = "";
        document.getElementById(this.uiElementNames.connectorDescriptionInput).value = "";
        document.getElementById(this.uiElementNames.connectorColourInput).value = null;
        ConnectorLines.drawDashesAndMarkersSelect(this.uiElementNames.connectorMarkerInput, "black", "", "");
    }
    save() {
        // Get all the input elements from the modal dialog.
        var connectorinternal_id = document.getElementById(this.uiElementNames.connectorModal).dataset.internal_id;
        var connectorIdentifierInput = document.getElementById(this.uiElementNames.connectorIdentifierInput);
        var connectorDescriptionInput = document.getElementById(this.uiElementNames.connectorDescriptionInput);
        var connectorChartColourInput = document.getElementById(this.uiElementNames.connectorColourInput);
        // Get the selected connector marker and dash based on the "selected" class.
        var marker = document.querySelector(this.classNames.connectorsInputSelected).dataset.marker;
        var dash = document.querySelector(this.classNames.connectorsInputSelected).dataset.dash;

        this.connectorViewModel.saveConnector({
            internal_id: connectorinternal_id,
            identifier: connectorIdentifierInput.value,
            description: connectorDescriptionInput.value,
            colour: connectorChartColourInput.value,
            marker: marker,
            dash: dash
        }).then(result => {
            var table = document.getElementById(this.uiElementNames.connectorsTable);
            this.DisplayConnectorRow(table, result.connector);
            // console.table("Connector saved.")
        });
    }
    view(connectorinternal_id) {
        var connector = this.connectorViewModel.connectors.find((c => c.internal_id == connectorinternal_id));
        console.assert(connector != null, "Cannot find connector in connectors collection.");
        document.getElementById(this.uiElementNames.connectorModal).dataset.internal_id = connector.internal_id;
        document.getElementById(this.uiElementNames.connectorIdentifierInput).value = connector.identifier;
        document.getElementById(this.uiElementNames.connectorDescriptionInput).value = connector.description;
        document.getElementById(this.uiElementNames.connectorColourInput).value = connector.colour;
        var marker = ConnectorLines.data.find(marker => marker.name == connector.marker)
        ConnectorLines.drawDashesAndMarkersSelect(this.uiElementNames.connectorMarkerInput, connector.colour, connector.dash, connector.marker);
    }
    list(connectorsTableName, connectors) {
        var listConnectorsPromise = new Promise((resolve, reject) => {
            var table = document.getElementById(connectorsTableName);

            // Add the header row.
            table.innerHTML = `
               <tr>
                    <th>${connectorResources.identifierColumnHeaderString}</th>
                    <th>${connectorResources.styleColumnHeaderString}</th>
                    <th>${connectorResources.descriptionColumnHeaderString}</th>
                    <th>${connectorResources.actionsColumnHeaderString}</th>
                </tr>`;
            connectors.forEach((connector) => {
                this.DisplayConnectorRow(table, connector);
            });
        });
        return (listConnectorsPromise);
    }
    DisplayConnectorRow(table, connector) {
        const identifierCellIndex = 0;
        const styleCellIndex = 1;
        const descriptionCellIndex = 2;
        const actionCellIndex = 3;

        console.assert(table != null, "No table to display Connectors in.");
        console.assert(connector != null, "No connector to display in table row.");
        // Try to find the row in the table
        var row = document.getElementById(this.uiElementNames.connectorRowPrefix + connector.internal_id);

        if (row == null) {
            // Row not found. Create a new row in the table and set it's id for future reference.
            row = table.insertRow(table.rows.length);
            row.setAttribute("id", this.uiElementNames.connectorRowPrefix + connector.internal_id);
        }
        else {
            row.innerHTML = "";
        }

        var identifierCell = row.insertCell(identifierCellIndex);
        var styleCell = row.insertCell(styleCellIndex);
        var connectorVisualDiv = document.createElement("div");
        connectorVisualDiv.id = utils.makeid(50);
        styleCell.appendChild(connectorVisualDiv);

        var svg = d3.select("#" + connectorVisualDiv.id).append('svg')
            .attr('width', 100)
            .attr('height', 20)
            .attr('id', "svg_" + connectorVisualDiv.id);
        var marker = ConnectorLines.data.find(datum => datum.name == connector.marker);
        if (marker != null) {
            var connectorMarker = JSON.parse(JSON.stringify(marker));
            connectorMarker.internal_id = utils.makeid(20);
            connectorMarker.colour = connector.colour;
            connectorMarker.height = 5;
            connectorMarker.width = 5;
            connector.marker = connectorMarker.internal_id;
            var connectorDash = ConnectorLines.dashes.find(dash => dash.name == connector.dash);
            ConnectorLines.createLineAndMarker(svg, 100, 20, connectorMarker, connectorDash, connector.colour);
        }
        var descriptionCell = row.insertCell(descriptionCellIndex);
        var actionsCell = row.insertCell(actionCellIndex);

        identifierCell.innerHTML = connector.identifier;
        descriptionCell.innerHTML = connector.description;

        var addRowPromise = new Promise((resolve, reject) => {
            actionsCell.innerHTML = `
            <button type="button" id="${this.uiElementNames.viewButtonPrefix + connector.internal_id}" data-internal_id="${connector.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
                data-target="#${this.uiElementNames.connectorModal}"><i class="fas fa-eye"></i> ${connectorResources.viewButtonString}</button>
            <button type="button" id="${this.uiElementNames.deleteButtonPrefix + connector.internal_id}" data-internal_id="${connector.internal_id}" class="deleteButton btn btn-danger btn-sm">
                <i class="fas fa-trash"></i> ${connectorResources.deleteButtonString}
            </button>`;
            resolve();
        });
        addRowPromise.then(() => {
            var viewConnectorButton = document.getElementById(this.uiElementNames.connectorRowPrefix + connector.internal_id);
            var connectorinternal_id = viewConnectorButton.dataset.internal_id;
            // Find the connector in the loaded connector collection.
            console.assert(viewConnectorButton != null, "Can't find viewConnectorButton");
            viewConnectorButton.addEventListener("click", event => this.view(connectorinternal_id));

            var deleteConnectorButton = document.getElementById(this.uiElementNames.deleteButtonPrefix + connector.internal_id);
            var connectorinternal_id = deleteConnectorButton.dataset.internal_id;
            // Find the connector in the loaded connector collection.
            console.assert(deleteConnectorButton != null, "Can't find deleteConnectorButton");
            deleteConnectorButton.addEventListener("click", event => this.delete(connectorinternal_id));

        });

    }
}

window.onload = () => {

    var connectorView = new ConnectorView();
}

