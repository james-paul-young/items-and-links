class ProjectProperties {
    project = null;
    HTML = "";
    saveButton = null;
    modal = null;
    saveCallback = null;
    namingPrefix = "project";
    /**
     * 
     * @param {applicationResources} applicationResources Localisation support
     * @param {projectResources} resources Localisation support
     */
    constructor(applicationResources, resources) {
        this.modal = document.createElement("div");
        this.modal.setAttribute("id", this.namingPrefix + "Modal");
        this.modal.setAttribute("class", "modal fade");
        this.modal.setAttribute("tabindex", "-1");
        this.modal.setAttribute("role", "dialog");
        // modal.setAttribute("aria-labelledby", "exampleModalLabel");
        // modal.setAttribute("aria-hidden", "true");
        this.modal.innerHTML = `  
                <div class="modal-dialog modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">${applicationResources.propertiesString}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label for="${this.namingPrefix}IdentifierInput">${resources.identifierString}</label>
                                        <input class="form-control" id="${this.namingPrefix}IdentifierInput" placeholder="${resources.identifierPlaceholderString}"></input>
                                        <small id="${this.namingPrefix}IdentifierHelp" class="form-text text-muted">${resources.identifierHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="${this.namingPrefix}DescriptionInput">${resources.descriptionString}</label>
                                        <textarea class="form-control" id="${this.namingPrefix}DescriptionInput" placeholder="${resources.descriptionPlaceholderString}" rows="3"></textarea>
                                        <small id="${this.namingPrefix}DescriptionHelp" class="form-text text-muted">${resources.descriptionHelpString}</small>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label for="${this.namingPrefix}CreatedInput">${applicationResources.createdString}</label>
                                        <input class="form-control" id="${this.namingPrefix}CreatedInput" readonly></input>
                                        <small id="${this.namingPrefix}CreatedHelp" class="form-text text-muted">${applicationResources.createdHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="${this.namingPrefix}UpdatedInput">${applicationResources.updatedString}</label>
                                        <input class="form-control" id="${this.namingPrefix}UpdatedInput" readonly></input>
                                        <small id="${this.namingPrefix}UpdatedHelp" class="form-text text-muted">${applicationResources.updatedHelpString}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button id="saveProjectButton" class="btn btn-primary" data-dismiss="modal">${resources.saveString}</button>
                                <button id="cancelProjectButton" class="btn btn-danger" data-dismiss="modal">${resources.cancelString}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }
    /**
     * @param {Project} data The data of the item to display to the user.
     * @param {function} saveCallback Function to invoke when the user requests to save.
    */
    view(data, saveCallback) {

        delete document.getElementById(this.namingPrefix + "Modal").dataset.internal_id;

        if (this.saveButton == null) {
            // Set up all the links to the HTML buttons.
            this.saveButton = document.getElementById("saveProjectButton");
            console.assert(this.saveButton != null, "Cannot find saveProjectButton");
            this.saveButton.addEventListener("click", event => {
                if (saveCallback != null) {
                    this.saveCallback = saveCallback;
                    this.save();
                }
            });
        }

        if (data != null) {
            document.getElementById(this.namingPrefix + "Modal").dataset.internal_id = data.internal_id;
        }
        document.getElementById(this.namingPrefix + "IdentifierInput").value = (data == null) ? "" : data.identifier;
        document.getElementById(this.namingPrefix + "DescriptionInput").value = (data == null) ? "" : data.description;
        document.getElementById(this.namingPrefix + "CreatedInput").value = (data == null) ? "" : data.created;
        document.getElementById(this.namingPrefix + "UpdatedInput").value = (data == null) ? "" : data.updated;
    }
    // /**
    //  * @param {Project} data The data of the item to display to the user.
    //  * @param {function} saveCallback Function to invoke when the user requests to save.
    // */
    // view2(data, saveCallback) {

    //     delete document.getElementById(this.namingPrefix + "Modal").dataset.internal_id;

    //     if (this.saveButton == null) {
    //         // Set up all the links to the HTML buttons.
    //         this.saveButton = document.getElementById("saveProjectButton");
    //         console.assert(this.saveButton != null, "Cannot find saveProjectButton");
    //         this.saveButton.addEventListener("click", event => {
    //             if (saveCallback != null) {
    //                 this.saveCallback = saveCallback;
    //                 this.save();
    //             }
    //         });
    //     }

    //     if (data != null) {
    //         console.assert(viewModel.current != null, "Nothing to view.")
    //         //        document.getElementById(this.namingPrefix + "Modal").dataset.internal_id = data.internal_id;

    //         document.getElementById(this.namingPrefix + "IdentifierInput").value = (data == null) ? "" : data.identifier;
    //         document.getElementById(this.namingPrefix + "DescriptionInput").value = (data == null) ? "" : data.description;
    //         document.getElementById(this.namingPrefix + "CreatedInput").value = (data == null) ? "" : data.created;
    //         document.getElementById(this.namingPrefix + "UpdatedInput").value = (data == null) ? "" : data.updated;
    //     }
    // }
    save() {
        var data = null;
        // Get all the input elements from the modal dialog.
        var internal_id = document.getElementById(this.namingPrefix + "Modal").dataset.internal_id;
        var identifierInput = document.getElementById(this.namingPrefix + "IdentifierInput");
        var descriptionInput = document.getElementById(this.namingPrefix + "DescriptionInput");
        data = {
            internal_id: internal_id,
            identifier: identifierInput.value,
            description: descriptionInput.value,
        };
        if (this.saveCallback != null) {
            this.saveCallback(data);
        }
    }
    static Binding(b) {
        _this = this
        this.elementBindings = []
        this.value = b.object[b.property]
        this.valueGetter = function () {
            return _this.value;
        }
        this.valueSetter = function (val) {
            _this.value = val
            for (var i = 0; i < _this.elementBindings.length; i++) {
                var binding = _this.elementBindings[i]
                binding.element[binding.attribute] = val
            }
        }
        this.addBinding = function (element, attribute, event) {
            var binding = {
                element: element,
                attribute: attribute
            }
            if (event) {
                element.addEventListener(event, function (event) {
                    _this.valueSetter(element[attribute]);
                })
                binding.event = event
            }
            this.elementBindings.push(binding)
            element[attribute] = _this.value
            return _this
        }

        Object.defineProperty(b.object, b.property, {
            get: this.valueGetter,
            set: this.valueSetter
        });

        b.object[b.property] = this.value;
    }
}
