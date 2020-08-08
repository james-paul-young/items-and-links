class ThingView extends ApplicationView {
    thingProperties = null;
    uiElementNames = {
        /**
         * The prefix used to prepend to each "view" action within a Thing row in the Thing table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        viewButtonPrefix: "View_",
        /**
         * The prefix used to prepend to each "delete" action within a Thing row in the Thing table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        deleteButtonPrefix: "Delete_",
        /**
         * The prefix used to prepend to each Thing row in the Thing table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        thingRowPrefix: "Row_",
    }

    constructor() {
        super(applicationResources.thingPageString);

        this.thingViewModel = new ThingViewModel();
        this.typeViewModel = new TypeViewModel();
        this.connectorViewModel = new ConnectorViewModel();

        Promise.all([this.typeViewModel.loadTypes(), this.thingViewModel.loadThings((a, b) => ('' + a.identifier).localeCompare(b.identifier))], this.connectorViewModel.loadConnectors()).then(results => {
            var createthingButton = document.getElementById("createThingButton");
            console.assert(createthingButton != null, "Cannot find createthingButton");
            createthingButton.addEventListener("click", event => this.create(event));

            this.list("thingsTable");
            this.thingProperties = new ThingProperties(applicationResources, thingResources, this.typeViewModel.types);
            document.body.appendChild(this.thingProperties.modal);
            this.loadResources();
        });

    }
    loadResources() {
        document.title = applicationResources.applicationNameString + " - " + thingResources.pageTitleString;
        document.getElementById("pageTitle").innerHTML = thingResources.pageTitleString + " (" + this.thingViewModel.project.identifier + ")";
    }

    delete(thingId) {
        this.thingViewModel.deleteThing(thingId).then(() => {
            var thingRow = document.getElementById(this.uiElementNames.thingRowPrefix + thingId);
            console.assert(thingRow != null, "Can't find the row to delete.")
            var table = document.getElementById("thingsTable");
            table.deleteRow(thingRow.rowIndex);
        });
    }
    create() {
        this.view(null);
    }

    save(thingData) {
        this.thingViewModel.saveThing(thingData).then(result => {
            var table = document.getElementById("thingsTable");
            this.DisplayThingRow(table, result.thing);
        });
    }
    view(thinginternal_id) {
        var thing = null;
        if (thinginternal_id != null) {
            thing = this.thingViewModel.things.find((thing => thing.internal_id == thinginternal_id));
        }
        this.thingProperties.view("#ffffff", thing, this.save.bind(this), this.delete.bind(this), "#000000");
    }
    list(thingsTableName) {
        var listThingsPromise = new Promise((resolve, reject) => {
            var table = document.getElementById(thingsTableName);

            const tableHeaderPromise = new Promise((resolve, reject) => {
                // Add the header row.
                table.innerHTML = `
                <thead>
                    <tr>
                        <th><a id="typeSortOrder" href="#" title="Sort order">${thingResources.typeColumnHeaderString}</a></th>
                        <th><a id="identifierSortOrder" href="#" title="Sort order">${thingResources.identifierColumnHeaderString}</a></th>
                        <th><a id="descriptionSortOrder" href="#" title="Sort order">${thingResources.descriptionColumnHeaderString}</a></th>
                        <th><a id="updatedSortOrder" href="#" title="Sort order">${applicationResources.updatedString}</a></th>
                    </tr>
                </thead><tbody></tbody>`;
                resolve();
            });
            tableHeaderPromise.then((result => {
                const typeSortOrderAction = document.getElementById("typeSortOrder");
                typeSortOrderAction.addEventListener("click", event => {
                    if (this.typeSortOrder == "ascending") {
                        this.thingViewModel.things.sort((b, a) => {
                            var typeA = this.typeViewModel.types.find(t => t.internal_id == a.type);
                            var typeB = this.typeViewModel.types.find(t => t.internal_id == b.type);

                            return ('' + typeA.identifier).localeCompare(typeB.identifier);
                        });
                        this.typeSortOrder = "descending";
                    }
                    else {
                        this.thingViewModel.things.sort((a, b) => {
                            var typeA = this.typeViewModel.types.find(t => t.internal_id == a.type);
                            var typeB = this.typeViewModel.types.find(t => t.internal_id == b.type);

                            return ('' + typeA.identifier).localeCompare(typeB.identifier);
                        });
                        this.typeSortOrder = "ascending";
                    }
                    this.list("thingsTable");
                });
                const identifierSortOrderAction = document.getElementById("identifierSortOrder");
                identifierSortOrderAction.addEventListener("click", event => {
                    if (this.identifierSortOrder == "ascending") {
                        this.thingViewModel.things.sort((b, a) => ('' + a.identifier).localeCompare(b.identifier));
                        this.identifierSortOrder = "descending";
                    }
                    else {
                        this.thingViewModel.things.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier));
                        this.identifierSortOrder = "ascending";
                    }
                    this.list("thingsTable");
                });
                const descriptionSortOrderAction = document.getElementById("descriptionSortOrder");
                descriptionSortOrderAction.addEventListener("click", event => {
                    if (this.descriptionSortOrder == "ascending") {
                        this.thingViewModel.things.sort((b, a) => ('' + a.description).localeCompare(b.description));
                        this.descriptionSortOrder = "descending";
                    }
                    else {
                        this.thingViewModel.things.sort((a, b) => ('' + a.description).localeCompare(b.description));
                        this.descriptionSortOrder = "ascending";
                    }
                    this.list("thingsTable");
                });
                const updatedSortOrderAction = document.getElementById("updatedSortOrder");
                updatedSortOrderAction.addEventListener("click", event => {
                    if (this.updatedSortOrder == "ascending") {
                        this.thingViewModel.things.sort((b, a) => a.updated - b.updated);
                        this.updatedSortOrder = "descending";
                    }
                    else {
                        this.thingViewModel.things.sort((a, b) => a.updated - b.updated);
                        this.updatedSortOrder = "ascending";
                    }
                    this.list("thingsTable");
                });
            }))
            this.thingViewModel.things.forEach((thing) => {
                this.DisplayThingRow(table, thing);
            });
        });
        return (listThingsPromise);
    }
    identifierSortOrder = "ascending";
    descriptionSortOrder = "descending";

    DisplayThingRow(table, thing, insertAtRowIndex) {

        console.assert(table != null, "No table to display Things in.");
        console.assert(thing != null, "No thing to display in table row.");
        // Try to find the row in the table
        let row = document.getElementById(this.uiElementNames.thingRowPrefix + thing.internal_id);

        if (row == null) {
            if (insertAtRowIndex != null) {
                row = table.tBodies[0].insertRow(insertAtRowIndex);
            } 
            else {
                row = table.tBodies[0].insertRow(table.rows.length - 1);
            }
            // Row not found. Create a new row in the table and set it's id for future reference.
            row.setAttribute("id", this.uiElementNames.thingRowPrefix + thing.internal_id);

            row.dataset.internal_id = thing.internal_id;
            row.dataset.toggle = "modal";
            row.dataset.target = "#thingModal";
            row.setAttribute("draggable", "true");
        }
        else {
            row.innerHTML = "";
        }

        // var thingIconSpan = typeCell.appendChild(document.createElement("span"));
        // thingIconSpan.setAttribute("class", "fa");
        var type = this.typeViewModel.types.find(t => t.internal_id == thing.type);

        var typeCell = row.insertCell(-1);
        var identifierCell = row.insertCell(-1);
        var descriptionCell = row.insertCell(-1);
        var updatedCell = row.insertCell(-1);

        typeCell.innerHTML = (type == null) ? "" : "<nobr>" + type.identifier + "</nobr>";
        typeCell.classList.add("type");
        identifierCell.classList.add("identifier");
        descriptionCell.classList.add("description");
        updatedCell.classList.add("updated");

        identifierCell.innerHTML = (thing.identifier == null) ? "" : "<nobr>" + thing.identifier + "<nobr>";
        descriptionCell.innerHTML = (thing.description == null) ? "" : thing.description;
        updatedCell.innerHTML = (thing.updated == null) ? "" : thing.updated.toString().substring(4, thing.updated.toString().indexOf(" G"));

        // var actionsCell = row.insertCell(actionCellIndex);
        // actionsCell.classList.add("actions");

        row.addEventListener("click", event => {
            const thinginternal_id = event.currentTarget.dataset.internal_id;
            this.view(thinginternal_id);
        });
        // row.addEventListener("dragstart", event => {
        //     event.dataTransfer.setData("row_Id", event.target.id);
        //     event.dataTransfer.setData("text", event.target.dataset.internal_id);
        // });
        // row.addEventListener("dragover", event => {
        //     event.preventDefault();
        //     event.dataTransfer.dropEffect = 'move';
        // });
        // row.addEventListener("drop", event => {
        //     event.preventDefault();
        //     var data = event.dataTransfer.getData("row_Id");
        //     var dragged_internal_id = event.dataTransfer.getData("text");
        //     const draggedRow = document.getElementById(data);
        //     const table = document.getElementById("thingsTable");
        //     const draggedRowIndex = draggedRow.rowIndex;
        //     if(draggedRowIndex != event.currentTarget.rowIndex) {
        //         table.deleteRow(draggedRowIndex);
        //         const targetedRowIndex = event.currentTarget.rowIndex;
        //         // table.insertRow(targetedRowIndex);
        //         console.log(data + ", draggedRowIndex = " + draggedRowIndex + ", targetedRowIndex = " + targetedRowIndex);
        //         this.DisplayThingRow(table, this.thingViewModel.things.find(thing => thing.internal_id == dragged_internal_id), targetedRowIndex - 1);
        //         // Modify the DisplayRow() method to allow a row to be inserted at a specific position. because need to re-link any event handlers to that row.
        //         //ev.target.appendChild(document.getElementById(data));
    
        //     }
        // });

        // var addRowPromise = new Promise((resolve, reject) => {
        //     actionsCell.innerHTML = `<nobr>
        //     <button type="button" id="${this.uiElementNames.viewButtonPrefix + thing.internal_id}" data-internal_id="${thing.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
        //         data-target="#thingModal"><i class="fas fa-eye"></i> ${thingResources.viewButtonString}</button>
        //     <button type="button" id="${this.uiElementNames.deleteButtonPrefix + thing.internal_id}" data-internal_id="${thing.internal_id}" class="deleteButton btn btn-danger btn-sm">
        //         <i class="fas fa-trash"></i> ${thingResources.deleteButtonString}
        //     </button></nobr>`;
        //     resolve();
        // });
        // addRowPromise.then(() => {
        //     var viewThingButton = document.getElementById(this.uiElementNames.viewButtonPrefix + thing.internal_id);
        //     var thinginternal_id = viewThingButton.dataset.internal_id;
        //     // Find the thing in the loaded thing collection.
        //     console.assert(viewThingButton != null, "Can't find viewThingButton");
        //     viewThingButton.addEventListener("click", event => this.view(thinginternal_id));

        //     var deleteThingButton = document.getElementById(this.uiElementNames.deleteButtonPrefix + thing.internal_id);
        //     thinginternal_id = deleteThingButton.dataset.internal_id;
        //     console.assert(deleteThingButton != null, "Can't find deleteThingButton");
        //     deleteThingButton.addEventListener("click", event => this.delete(thinginternal_id));
        // });

    }
}

window.onload = () => {
    var thingView = new ThingView();
}

document.onkeyup = (event) => {
    switch (event.code) {
        case "F2":
            {
                var createThingButton = document.getElementById("createThingButton");
                console.assert(createThingButton != null, "Cannot find create button.");
                createThingButton.click();
            }
            break;
        case "keyS":
            {
                if (event.ctrlKey)
                    var saveThingButton = document.getElementById("saveThingButton");
                console.assert(saveThingButton != null, "Cannot find save button.");
                saveThingButton.click();
            }
            break;
    }
}
