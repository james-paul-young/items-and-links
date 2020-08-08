

class TypeView extends ApplicationView {
    // List of all element names used in this view.
    uiElements = {

        viewButtonPrefix: "View_",
        /**
         * The prefix used to prepend to each "delete" action within a type row in the type table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        deleteButtonPrefix: "Delete_",
        /**
        * The prefix used to prepend to each type row in the type table.
         *
         * @since  0.0.1
         * @access public
         *
         * @type     string
         */
        typeRowPrefix: "Row_",
    }

    /**
     *  The Viewmodel for this view. Contains the data and operations for Types.
     *
     * @since  0.0.1
     * @access public
     *
     * @type     TypeViewModel
     */
    typeViewModel = new TypeViewModel();

    loadResources() {
        document.getElementById("createTypeLabel").innerHTML = typeResources.createLabelString;
        //document.getElementById("typeIconHelp").innerHTML = typeResources.iconHelpString;
        document.getElementById("typeIdentifierHelp").innerHTML = typeResources.iconHelpString;
        document.getElementById("typeColourHelp").innerHTML = typeResources.colourHelpString;
        document.getElementById("typeDescriptionHelp").innerHTML = typeResources.descriptionHelpString;
        document.getElementById("modalTitle").innerHTML = typeResources.modalTitleString;
        document.title = applicationResources.applicationNameString + " - " + typeResources.pageTitleString;
    }
    addListeners() {
        // Set up the listeners for the Modal buttons.
        var saveTypeButton = document.getElementById("saveTypeButton");
        console.assert(saveTypeButton != null, "Cannot find saveTypeButton.");
        saveTypeButton.addEventListener("click", event => this.save());

        var createtypeButton = document.getElementById("createTypeButton");
        console.assert(createtypeButton != null, "Cannot find createtypeButton");
        createtypeButton.addEventListener("click", event => this.create());
    }
    constructor() {
        super(applicationResources.typePageString);
        console.assert(this.typeViewModel != null, "TypeViewModel not loaded. Add script link to HTML.");
        this.typeViewModel.loadTypes()
            .then(types => {
                document.getElementById("pageTitle").innerHTML = typeResources.pageTitleString + " (" + this.typeViewModel.project.identifier + ")";
                this.list("typesTable", types);
                this.loadResources();
                this.addListeners();

                // Setup the list of icons avaialble to choose from.
                // var typeIconInput = document.getElementById("typeIconInput");
                // console.assert(typeIconInput != null, "Cannot find Icon Select.");
                // // Add the "nothing selected" option.
                // var iconOption = document.createElement("option");
                // typeIconInput.appendChild(iconOption);
                // typeResources.icons.forEach(icon => {
                //     iconOption = document.createElement("option");
                //     iconOption.value = icon.name;
                //     iconOption.setAttribute("class", "fa");
                //     iconOption.innerHTML = String.fromCharCode(parseInt(icon.unicode, 16)) + "&emsp;&emsp;" + icon.name.replace("-", " ").toUpperCase();
                //     typeIconInput.appendChild(iconOption);
                // });

                if (this.typeImageInput == null) {
                    this.typeImageInput = document.getElementById("typeImageInput");
                    console.assert(typeImageInput != null, "Cannot find typeImageInput");
                    this.typeImageInput.addEventListener("change", event => {
                        if (event.currentTarget.files != null && event.currentTarget.files[0] != null) {
                            var image = document.getElementById("typeImage");
                            image.src = URL.createObjectURL(event.currentTarget.files[0]);
                        }
                    });
                }
                if (this.clearTypeImageButton == null) {
                    this.clearTypeImageButton = document.getElementById("clearTypeImageButton");
                    console.assert(clearTypeImageButton != null, "Cannot find clearTypeImageButton");
                    this.clearTypeImageButton.addEventListener("click", event => {
                        var imageDiv = document.getElementById("imageDiv");
                        var image = document.getElementById("typeImage");
                        imageDiv.removeChild(image);
                        image = document.createElement("img");
                        image.id = "thingImage";
                        image.setAttribute("height", "100");
                        image.setAttribute("width", "100");
                        imageDiv.appendChild(image);
                    });
                }
            });

    }

    delete(typeId) {
        this.typeViewModel.deleteType(typeId).then(() => {
            var typeRow = document.getElementById(this.uiElements.typeRowPrefix + typeId);
            console.assert(typeRow != null, "Can't find the row to delete.")
            var table = document.getElementById("typesTable");
            table.deleteRow(typeRow.rowIndex);
        });
    }
    create() {
        this.view(null);
    }
    save() {
        var imagePromise = new Promise((resolve, reject) => {
            var typeImageInput = document.getElementById("typeImageInput");

            if ((typeImageInput != null) && (typeImageInput.files.length > 0)) {
                // Get a new image.
                var fileReader = new FileReader();
                fileReader.onload = e => {
                    resolve(e.currentTarget.result);
                }
                fileReader.readAsBinaryString(typeImageInput.files[0]);
            }
            else if (typeImageInput.src != "") {
                // Use the existing image.
                resolve(atob(typeImageInput.src.replace("data:image/png;base64, ", "")));
            }
            else {
                // Do not use any image.
                resolve(null);
            }
        });
        imagePromise.then(result => {
            // Get all the input elements from the modal dialog.
            var typeinternal_id = document.getElementById("typeModal").dataset.internal_id;
            var typeIdentifierInput = document.getElementById("typeIdentifierInput");
            var typeDescriptionInput = document.getElementById("typeDescriptionInput");
            var typeColourInput = document.getElementById("typeColourInput");
            var typeBackgroundColourInput = document.getElementById("typeBackgroundColourInput");
            // var typeIconInput = document.getElementById("typeIconInput");

            this.typeViewModel.saveType({
                internal_id: typeinternal_id,
                identifier: typeIdentifierInput.value,
                description: typeDescriptionInput.value,
                colour: typeColourInput.value,
                background_colour: typeBackgroundColourInput.value,
                // icon: typeIconInput.value,
                custom_image: result,
            }).then(result => {
                var table = document.getElementById("typesTable");
                console.assert(table != null, "Cannot find Types table.");
                this.DisplayTypeRow(table, result.type);
                // console.table("Type saved.")
            });

        })

    }
    view(typeinternal_id) {
        delete document.getElementById("typeModal").dataset.internal_id
        // document.getElementById("typeModal").setAttribute("typeInternalIdAttribute", "");
        document.getElementById("typeIdentifierInput").value = "";
        document.getElementById("typeDescriptionInput").value = "";
        document.getElementById("typeColourInput").value = null;
        document.getElementById("typeBackgroundColourInput").value = "#ffffff";
        //document.getElementById("typeIconInput").value = "";
        document.getElementById("typeImage").src = "";

        if (typeinternal_id != null) {
            var type = this.typeViewModel.types.find((type => type.internal_id == typeinternal_id));
            console.assert(type != null, "Cannot find type in types collection.");
            document.getElementById("typeModal").dataset.internal_id = type.internal_id;
            document.getElementById("typeIdentifierInput").value = type.identifier;
            document.getElementById("typeDescriptionInput").value = type.description;
            document.getElementById("typeColourInput").value = type.colour;
            document.getElementById("typeBackgroundColourInput").value = type.background_colour;
            //document.getElementById("typeIconInput").value = type.icon;
            if ((type != null) && (type.custom_image != null)) {
                document.getElementById("typeImage").src = "data:image/png;base64, " + btoa(type.custom_image);
            }
        }

    }
    list(typesTable, types) {
        var table = document.getElementById(typesTable);
        var listTypesPromise = new Promise((resolve, reject) => {

            // Add the header row.
            table.innerHTML = `
                <tr>
                    <th>${typeResources.iconColumnHeaderString}</th>
                    <th>${typeResources.identifierColumnHeaderString}</th>
                    <th>${typeResources.descriptionColumnHeaderString}</th>
                    <th>${typeResources.actionsColumnHeaderString}</th>
                </tr>`;
            types.forEach((type) => {
                this.DisplayTypeRow(table, type);
            });
        });
        return (listTypesPromise);
    }
    DisplayTypeRow(table, type) {
        const iconCellIndex = 0;
        const identifierCellIndex = 1;
        const descriptionCellIndex = 2;
        const actionCellIndex = 3;

        console.assert(table != null, "No table to display Types in.");
        console.assert(type != null, "No type to display in table row.");
        // Try to find the row in the table
        var row = document.getElementById(this.uiElements.typeRowPrefix + type.internal_id);

        if (row == null) {
            // Row not found. Create a new row in the table and set it's id for future reference.
            row = table.insertRow(table.rows.length);
            row.setAttribute("id", this.uiElements.typeRowPrefix + type.internal_id);
        }
        else {
            row.innerHTML = "";
        }

        // These have to be added in correct order.
        var iconCell = row.insertCell(iconCellIndex);
        var iconSpan = iconCell.appendChild(document.createElement("span"))
        iconSpan.classList.add("fa");
        var identifierCell = row.insertCell(identifierCellIndex);
        var descriptionCell = row.insertCell(descriptionCellIndex);
        var actionsCell = row.insertCell(actionCellIndex);

        var iconCellContent = typeResources.icons.find(icon => icon.name == type.icon);
        if (iconCellContent != null) {
            iconSpan.style.color = type.colour;
            iconSpan.innerHTML = String.fromCharCode(parseInt(iconCellContent.unicode, 16));
        }
        identifierCell.innerHTML = type.identifier;
        descriptionCell.innerHTML = type.description;

        var addRowPromise = new Promise((resolve, reject) => {
            actionsCell.innerHTML = `
            <button type="button" id="${this.uiElements.viewButtonPrefix + type.internal_id}" data-internal_id="${type.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
                data-target="#typeModal"></i>${typeResources.viewButtonString}</button>
            <button type="button" id="${this.uiElements.deleteButtonPrefix + type.internal_id}" data-internal_id="${type.internal_id}" class="deleteButton btn btn-danger btn-sm">
                ${typeResources.deleteButtonString}
            </button>`;
            resolve();
        });
        addRowPromise.then(() => {
            var viewTypeButton = document.getElementById(this.uiElements.viewButtonPrefix + type.internal_id);
            console.assert(viewTypeButton != null, "Cannot find View button.")
            var typeinternal_id = viewTypeButton.dataset.internal_id;
            // Find the type in the loaded type collection.
            console.assert(viewTypeButton != null, "Can't find viewTypeButton");
            viewTypeButton.addEventListener("click", event => this.view(typeinternal_id));

            var deleteTypeButton = document.getElementById(this.uiElements.deleteButtonPrefix + type.internal_id);
            var typeinternal_id = deleteTypeButton.dataset.internal_id;
            // Find the type in the loaded type collection.
            console.assert(deleteTypeButton != null, "Can't find deleteTypeButton");
            deleteTypeButton.addEventListener("click", event => this.delete(typeinternal_id));

        });

    }
}

window.onload = () => {
    var typeView = new TypeView();
}

