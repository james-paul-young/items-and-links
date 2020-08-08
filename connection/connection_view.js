class ConnectionView extends ApplicationView {
    classNames = {
        connectionsInputSelected: ".connectionsInputSelected"
    }

    constructor() {
        super(applicationResources.connectionPageString);
        this.connectionViewModel = new ConnectionViewModel();
        this.connectorViewModel = new ConnectorViewModel();
        this.thingViewModel = new ThingViewModel();
        this.connectionProperties = null;
        this.typeViewModel = new TypeViewModel();
        this.identifierSortOrder = "";
        this.sourceSortOrder = "";
        this.destinationSortOrder = "";
        this.updatedSortOrder = "";

        // Set up all the listeners to the HTML buttons.
        var createConnectionButton = document.getElementById("createConnectionButton");
        console.assert(createConnectionButton != null, "Cannot find createConnectionButton");

        createConnectionButton.addEventListener("click", event => this.create());
        Promise.all([this.connectionViewModel.loadConnections(), this.connectorViewModel.loadConnectors(), this.thingViewModel.loadThings(), this.typeViewModel.loadTypes()])
            .then(results => {
                this.connectionProperties = new ConnectionProperties(applicationResources, connectionResources, this.connectorViewModel.connectors, this.thingViewModel.things, this.typeViewModel.types, this.connectionViewModel.project);
                // The project can be connected to but technically isn't a "thing"
                this.thingViewModel.things.push(this.connectionViewModel.project);
                document.body.appendChild(this.connectionProperties.modal);
                this.loadResources();
                Promise.all([this.list("connectionsTable", results[0]), this.matrix("connectionsMatrix", results[2], results[0])]).then(result => {
                });
            });
    }
    matrix(matrixName, things) {
        var matrixConnectionsPromise = new Promise((resolve, reject) => {
            var matrix = document.getElementById(matrixName);
            matrix.innerHTML = "";
            var HeaderRow = document.createElement("tr");
            HeaderRow.id = "header";
            matrix.appendChild(HeaderRow);

            var blankColumnHeader = document.createElement("td");
            blankColumnHeader.id = "blank_columnHeader";
            blankColumnHeader.innerHTML = "";
            HeaderRow.appendChild(blankColumnHeader);
            things.forEach(thingRow => {
                // Add the row
                var row = document.createElement("tr");
                row.id = thingRow.internal_id + "_row";

                // Add the header to the row
                var rowHeader = document.createElement("td");
                rowHeader.id = thingRow.internal_id + "_rowHeader";
                rowHeader.innerHTML = thingRow.identifier;
                row.appendChild(rowHeader);

                var columnHeader = document.createElement("th");
                columnHeader.id = thingRow.internal_id + "_columnHeader";
                columnHeader.classList.add("statusColumn");
                columnHeader.innerHTML = "<div><b>" + thingRow.identifier + "</b></div>";
                HeaderRow.appendChild(columnHeader);
                things.forEach(thingColumn => {
                    var column = document.createElement("td");
                    if (thingColumn.internal_id == thingRow.internal_id) {
                        column.classList.add("connection-disabled");
                    }
                    else {
                        column.classList.add("connection-enabled");
                    }
                    column.dataset.rowThing_internal_id = thingRow.internal_id;
                    column.dataset.columnThing_internal_id = thingColumn.internal_id;
                    column.dataset.toggle = "modal";
                    column.dataset.target = "#connectionModal";
                    column.dataset.connectionSource = thingRow.internal_id;
                    column.dataset.connectionTarget = thingColumn.internal_id;
                    column.addEventListener("click", event => {
                        const connectionId = event.currentTarget.dataset.connectionId;
                        const source = event.currentTarget.dataset.connectionSource;
                        const target = event.currentTarget.dataset.connectionTarget;
                        this.view(connectionId, source, target);
                    });
                    var connection = this.connectionViewModel.connections.find(connection => connection.source == thingRow.internal_id && connection.target == thingColumn.internal_id);
                    if (connection != null) {
                        column.id = "connection_cell" + connection.internal_id;
                        column.dataset.connectionId = connection.internal_id;
                        column.innerHTML = "X";
                    }
                    row.appendChild(column);
                });
                matrix.appendChild(row);
            });
            resolve();
        });
        return (matrixConnectionsPromise);

    }
    loadResources() {
        document.title = applicationResources.applicationNameString + " - " + connectionResources.pageTitleString;
        document.getElementById("pageTitle").innerHTML = connectionResources.pageTitleString + " (" + this.connectionViewModel.project.identifier + ")";
    }

    delete(connectionId) {
        this.connectionViewModel.deleteConnection(connectionId).then(() => {
            var connectionRow = document.getElementById("connection_row" + connectionId);
            console.assert(connectionRow != null, "Can't find the row to delete.")
            var table = document.getElementById("connectionsTable");
            table.deleteRow(connectionRow.rowIndex);
            this.matrix("connectionsMatrix", this.thingViewModel.things);
        });
    }
    create(defaultSource, defaultTarget) {
        this.view(null, defaultSource, defaultTarget);
    }
    save(connectionData) {

        this.connectionViewModel.saveConnection(connectionData).then(result => {
            this.DisplayConnection("connectionsTable", result.connection);
            this.matrix("connectionsMatrix", this.thingViewModel.things);
            // console.table("Connection saved.")
        });
    }
    view(connectionInternal_id, sourceOverride, targetOverride) {
        var connection = null;
        if (connectionInternal_id != null) {
            connection = this.connectionViewModel.connections.find((c => c.internal_id == connectionInternal_id));
        }
        this.connectionProperties.view(connection, this.save.bind(this), sourceOverride, targetOverride, this.delete.bind(this));
    }
    list(tableName, connections) {
        var listConnectionsPromise = new Promise((resolve, reject) => {
            const tableHeaderPromise = new Promise((resolve, reject) => {
                var table = document.getElementById(tableName);
                // Add the header row.
                table.innerHTML = `
                <tr>
                    <th><a id="identifierSortOrder" href="#" title="Sort order">${connectionResources.identifierColumnHeaderString}<i class="fas fa-sort"></i></a></th>
                    <th><a id="descriptionSortOrder" href="#" title="Sort order">${connectionResources.descriptionColumnHeaderString}<i class="fas fa-sort"></i></a></th>
                    <th><a id="sourceSortOrder" href="#" title="Sort order">${connectionResources.sourceColumnHeaderString}<i class="fas fa-sort"></i></a></th>
                    <th>${connectionResources.connectorColumnHeaderString}</th>
                    <th colspan="2"><a id="targetSortOrder" href="#" title="Sort order">${connectionResources.targetColumnHeaderString}<i class="fas fa-sort"></i></a></th>
                    <th><a id="updatedSortOrder" href="#" title="Sort order">${connectionResources.updatedColumnHeaderString}<i class="fas fa-sort"></i></a></th>
                </tr>`;
                resolve();
            });
            tableHeaderPromise.then(result => {
                const identifierSortOrderAction = document.getElementById("identifierSortOrder");
                identifierSortOrderAction.addEventListener("click", event => {
                    if (this.identifierSortOrder == "ascending") {
                        this.connectionViewModel.connections.sort((b, a) => ('' + a.identifier).localeCompare(b.identifier));
                        this.identifierSortOrder = "descending";
                    }
                    else {
                        this.connectionViewModel.connections.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier));
                        this.identifierSortOrder = "ascending";
                    }
                    this.list("connectionsTable");
                });
                const descriptionSortOrderAction = document.getElementById("descriptionSortOrder");
                descriptionSortOrderAction.addEventListener("click", event => {
                    if (this.descriptionSortOrder == "ascending") {
                        this.connectionViewModel.connections.sort((b, a) => ('' + a.description).localeCompare(b.identifier));
                        this.descriptionSortOrder = "descending";
                    }
                    else {
                        this.connectionViewModel.connections.sort((a, b) => ('' + a.description).localeCompare(b.identifier));
                        this.descriptionSortOrder = "ascending";
                    }
                    this.list("connectionsTable");
                });
                const sourceSortOrderAction = document.getElementById("sourceSortOrder");
                sourceSortOrderAction.addEventListener("click", event => {
                    if (this.sourceSortOrder == "ascending") {
                        this.connectionViewModel.connections.sort((b, a) => {
                            var sourceAThing = this.thingViewModel.things.find(thing => thing.internal_id == a.source);
                            var sourceBThing = this.thingViewModel.things.find(thing => thing.internal_id == b.source);
                            let thingAType = this.typeViewModel.types.find(type => type.internal_id == sourceAThing.type);
                            let thingBType = this.typeViewModel.types.find(type => type.internal_id == sourceBThing.type);

                            let thingAConnectionType = this.connectorViewModel.connectors.find(connector => connector.internal_id == a.connector);
                            let thingBConnectionType = this.connectorViewModel.connectors.find(connector => connector.internal_id == b.connector);
                            let thingAConnectionTypeIdentifier = thingAConnectionType.identifier;
                            let thingBConnectionTypeIdentifier = thingBConnectionType.identifier;
                            let thingATypeIdentifier = (thingAType == null)? "" : thingAType.identifier;
                            let thingBTypeIdentifier = (thingBType == null)? "" : thingBType.identifier;
                            return(('' + sourceAThing.identifier + thingATypeIdentifier + thingAConnectionTypeIdentifier).localeCompare('' + sourceBThing.identifier + thingBTypeIdentifier + thingBConnectionTypeIdentifier));
                        });
                        this.sourceSortOrder = "descending";
                    }
                    else {
                        this.connectionViewModel.connections.sort((a, b) => {
                            var sourceAThing = this.thingViewModel.things.find(thing => thing.internal_id == a.source);
                            var sourceBThing = this.thingViewModel.things.find(thing => thing.internal_id == b.source);
                            let thingAType = this.typeViewModel.types.find(type => type.internal_id == sourceAThing.type);
                            let thingBType = this.typeViewModel.types.find(type => type.internal_id == sourceBThing.type);

                            let thingAConnectionType = this.connectorViewModel.connectors.find(connector => connector.internal_id == a.connector);
                            let thingBConnectionType = this.connectorViewModel.connectors.find(connector => connector.internal_id == b.connector);
                            let thingAConnectionTypeIdentifier = (thingAConnectionType == null)? "" : thingAConnectionType.identifier;
                            let thingBConnectionTypeIdentifier = (thingBConnectionType == null)? "" : thingBConnectionType.identifier;
                            let thingATypeIdentifier = (thingAType == null)? "" : thingAType.identifier;
                            let thingBTypeIdentifier = (thingBType == null)? "" : thingBType.identifier;
                            return(('' + sourceAThing.identifier + thingATypeIdentifier + thingAConnectionTypeIdentifier).localeCompare('' + sourceBThing.identifier + thingBTypeIdentifier + thingBConnectionTypeIdentifier));
                        });
                        this.sourceSortOrder = "ascending";
                    }
                    this.list("connectionsTable");
                });
                const targetSortOrderAction = document.getElementById("targetSortOrder");
                targetSortOrderAction.addEventListener("click", event => {
                    if (this.targetSortOrder == "ascending") {
                        this.connectionViewModel.connections.sort((b, a) => {
                            var targetAThing = this.thingViewModel.things.find(thing => thing.internal_id == a.target);
                            var targetBThing = this.thingViewModel.things.find(thing => thing.internal_id == b.target);
                            return(('' + targetAThing.identifier).localeCompare(targetBThing.identifier));
                        });
                        this.targetSortOrder = "descending";
                    }
                    else {
                        this.connectionViewModel.connections.sort((a, b) => {
                            var targetAThing = this.thingViewModel.things.find(thing => thing.internal_id == a.target);
                            var targetBThing = this.thingViewModel.things.find(thing => thing.internal_id == b.target);
                            return(('' + targetAThing.identifier).localeCompare(targetBThing.identifier));
                        });
                        this.targetSortOrder = "ascending";
                    }
                    this.list("connectionsTable");
                });
                const updatedSortOrderAction = document.getElementById("updatedSortOrder");
                updatedSortOrderAction.addEventListener("click", event => {
                    if (this.updatedSortOrder == "ascending") {
                        this.connectionViewModel.connections.sort((b, a) => {
                            return(('' + Date.parse(a.updated)).localeCompare('' + Date.parse(b.updated)));
                        });
                        this.updatedSortOrder = "descending";
                    }
                    else {
                        this.connectionViewModel.connections.sort((a, b) => {
                            return(('' + Date.parse(a.updated)).localeCompare('' + Date.parse(b.updated)));
                        });
                        this.updatedSortOrder = "ascending";
                    }
                    this.list("connectionsTable");
                });
                this.connectionViewModel.connections.forEach((connection) => {
                    this.DisplayConnection(tableName, connection);
                });
            });
        });
        return (listConnectionsPromise);
    }
    DisplayConnection(tableName, connection) {
        var table = document.getElementById(tableName);

        console.assert(table != null, "No table to display Connections in.");
        console.assert(connection != null, "No connection to display in table row.");
        // Try to find the row in the table
        var row = document.getElementById("connection_row" + connection.internal_id);

        if (row == null) {
            // Row not found. Create a new row in the table and set it's id for future reference.
            row = table.insertRow(table.rows.length);
            row.setAttribute("id", "connection_row" + connection.internal_id);
            row.dataset.internal_id = connection.internal_id;
            row.dataset.toggle = "modal";
            row.dataset.target = "#connectionModal";
        }
        else {
            row.innerHTML = "";
        }
        row.addEventListener("click", event => {
            const internal_id = event.currentTarget.dataset.internal_id;
            this.view(internal_id);
        });

        var identifierCell = row.insertCell(-1);
        var descriptionCell = row.insertCell(-1);
        var sourceCell = row.insertCell(-1);
        var connectorCell = row.insertCell(-1);
        var targetCell = row.insertCell(-1);
        var targetCellDescription = row.insertCell(-1);
        var updatedCell = row.insertCell(-1);

        descriptionCell.innerHTML = connection.description;
        identifierCell.innerHTML = connection.identifier;
        if(connection.updated != null) {
            updatedCell.innerHTML = connection.updated.toString().substring(4, connection.updated.toString().indexOf(" G"));
        }

        var sourceThing = this.thingViewModel.things.find(thing => thing.internal_id == connection.source);
        if (sourceThing != null) {
            //sourceCell.innerHTML = sourceThing.identifier;
            let thingType = this.typeViewModel.types.find(type => type.internal_id == sourceThing.type);
            sourceCell.innerHTML = sourceThing.identifier + ((thingType != null)? " <i>(" + thingType.identifier + ")</i>" : "");
            sourceCell.title = sourceThing.description;
        }
        var targetThing = this.thingViewModel.things.find(thing => thing.internal_id == connection.target);
        if (targetThing != null) {
            //targetCell.innerHTML = targetThing.identifier;
            let thingType = this.typeViewModel.types.find(type => type.internal_id == targetThing.type);
            targetCell.innerHTML = targetThing.identifier + ((thingType != null)? " <i>(" + thingType.identifier + ")</i>" : "");
            targetCellDescription.innerHTML = targetThing.description;
        }

        var connector = this.connectorViewModel.connectors.find(c => c.internal_id == connection.connector);
        var connectorVisualDiv = document.createElement("span");
        connectorVisualDiv.id = utils.makeid(50);
        connectorCell.appendChild(connectorVisualDiv);

        var svg = d3.select("#" + connectorVisualDiv.id).append('svg')
            .attr('width', 100)
            .attr('height', 20)
            .attr('id', "svg_" + connectorVisualDiv.id);
        if (connector != null) {
            var marker = ConnectorLines.data.find(datum => datum.name == connector.marker);
            if (marker != null) {
                var connectorMarker = JSON.parse(JSON.stringify(marker));

                connectorMarker.internal_id = utils.makeid(20);
                connectorMarker.colour = connector.colour;
                connectorMarker.height = 5;
                connectorMarker.width = 5;
                var connectorDash = ConnectorLines.dashes.find(dash => dash.name == connector.dash);
                ConnectorLines.createLineAndMarker(svg, 100, 20, connectorMarker, connectorDash, connector.colour);
            }
            connectorCell.innerHTML += "<br>" + connector.identifier;
            connectorCell.classList.add("connector");
        }
        // var actionsCell = row.insertCell(actionCellIndex);

        // var addRowPromise = new Promise((resolve, reject) => {
        //     actionsCell.innerHTML = `
        //     <button type="button" id="View${connection.internal_id}" data-internal_id="${connection.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
        //         data-target="#connectionModal"><i class="fas fa-eye"></i> ${connectionResources.viewButtonString}</button>
        //     <button type="button" id="Delete${connection.internal_id}" data-internal_id="${connection.internal_id}" class="deleteButton btn btn-danger btn-sm">
        //         <i class="fas fa-trash"></i> ${connectionResources.deleteButtonString}
        //     </button>`;
        //     resolve(connection.internal_id);
        // });
        // addRowPromise.then((connection_internal_id) => {
        //     // Find the connection in the loaded connection collection.
        //     var viewConnectionButton = document.getElementById("View" + connection_internal_id);
        //     console.assert(viewConnectionButton != null, "Can't find viewConnectionButton");
        //     var connectionInternal_id = viewConnectionButton.dataset.internal_id;
        //     viewConnectionButton.addEventListener("click", event => this.view(connectionInternal_id));

        //     var deleteConnectionButton = document.getElementById("Delete" + connection_internal_id);
        //     // Find the connection in the loaded connection collection.
        //     console.assert(deleteConnectionButton != null, "Can't find deleteConnectionButton");
        //     var connectionInternal_id = deleteConnectionButton.dataset.internal_id;
        //     deleteConnectionButton.addEventListener("click", event => this.delete(connectionInternal_id));
        // });
    }
}

var connectionView
window.onload = () => {
    connectionView = new ConnectionView();
}
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn') && !connectionView.showProperties) {
        connectionView.showProperties = false;
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

