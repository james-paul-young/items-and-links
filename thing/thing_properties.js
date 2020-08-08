class ThingProperties {
    thing = null;
    HTML = "";
    saveThingButton = null;
    thingImageInput = null;
    thingTypeInput = null;
    thingFillColourInput = null;
    types = null;
    modal = null;
    saveCallback = null;
    // custom_image = null;
    clearThingImageButton = null;
    /**
     * 
     * @param {Types} types An array of types the user can select from when creating/updating the thing.
     * @param {applicationResources} applicationResources Localisation support
     * @param {thingResources} thingResources Localisation support
     */
    constructor(applicationResources, thingResources, types) {
        this.types = types;
        this.modal = document.createElement("div");
        this.modal.setAttribute("id", "thingModal");
        this.modal.setAttribute("class", "modal fade");
        this.modal.setAttribute("tabindex", "-1");
        this.modal.setAttribute("role", "dialog");
        this.background_colour = null;
        this.foreground_colour = null;
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
                                        <label id="thingTypeLabel" for="thingTypeInput">${thingResources.typeString}</label>
                                        <select class="form-control" id="thingTypeInput" placeholder="${thingResources.typePlaceholderString}"></select>
                                        <small id="thingTypeHelp" class="form-text text-muted">${thingResources.typeHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="thingIdentifierInput">${thingResources.identifierString}</label>
                                        <input class="form-control" id="thingIdentifierInput" placeholder="${thingResources.identifierPlaceholderString}"></input>
                                        <small id="thingIdentifierHelp" class="form-text text-muted">${thingResources.identifierHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="thingImageInput">${thingResources.imageString}</label>
                                        <div id="imageDiv"><img id="thingImage" height="100" width="100"></div>
                                        <label class="btn btn-primary cursor-pointer" for="thingImageInput">Browse</label>
                                            <input type="file" id="thingImageInput" placeholder="${thingResources.imagePlaceholderString}" hidden></input>
                                            <label class="btn btn-primary cursor-pointer" for="clearThingImageButton">Clear</label>
                                        <button id="clearThingImageButton" class="btn btn-primary" hidden></button>
                                        <small id="thingTypeHelp" class="form-text text-muted">${thingResources.imageHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="thingDescriptionInput">${thingResources.descriptionString}</label>
                                        <textarea class="form-control" id="thingDescriptionInput" placeholder="${thingResources.descriptionPlaceholderString}" rows="3"></textarea>
                                        <small id="thingDescriptionHelp" class="form-text text-muted">${thingResources.descriptionHelpString}</small>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label for="thingBorderColourInput">${thingResources.borderColourString}</label>
                                        <input id="thingBorderColourInput" class="form-control " type="color" placeholder="${thingResources.borderColourPlaceholderString}"></input>
                                        <small id="thingBorderColourHelp" class="form-text text-muted">${thingResources.borderColourHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="thingFillColourInput">${thingResources.fillColourString}</label>
                                        <input id="thingFillColourInput" class="form-control " type="color" placeholder="${thingResources.fillColourPlaceholderString}"></input>
                                        <small id="thingFillColourHelp" class="form-text text-muted">${thingResources.fillColourHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="thingCreatedInput">${applicationResources.createdString}</label>
                                        <input class="form-control" id="thingCreatedInput" readonly></input>
                                        <small id="thingCreatedHelp" class="form-text text-muted">${applicationResources.createdHelpString}</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="thingUpdatedInput">${applicationResources.updatedString}</label>
                                        <input class="form-control" id="thingUpdatedInput" readonly></input>
                                        <small id="thingUpdatedHelp" class="form-text text-muted">${applicationResources.updatedHelpString}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                            <button id="deleteThingButton" class="btn btn-danger" data-dismiss="modal">${applicationResources.deleteString}</button>
                            <button id="saveThingButton" class="btn btn-primary" data-dismiss="modal">${thingResources.saveString}</button>
                            <button id="cancelThingButton" class="btn btn-danger" data-dismiss="modal">${thingResources.cancelString}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }
    /**
     * @param {string} defaultFillColour The colour to display as a default selection for a thing without a fill colour.
     * @param {thing} thingToDisplay The data of the thing to display to the user.
     * @param {function} saveCallback Function to invoke when the user requests to save.
    */
    view(defaultFillColour, thingToDisplay, saveCallback, deleteCallback) {

        delete document.getElementById("thingModal").dataset.internal_id;

        if (this.saveThingButton == null) {
            // Set up all the links to the HTML buttons.
            this.saveThingButton = document.getElementById("saveThingButton");
            console.assert(saveThingButton != null, "Cannot find saveThingButton");
            this.saveThingButton.addEventListener("click", event => {
                if (saveCallback != null) {
                    this.saveCallback = saveCallback;
                    this.save();
                }
            });
        }
        if (this.deleteThingButton == null) {
            // Set up all the links to the HTML buttons.
            this.deleteThingButton = document.getElementById("deleteThingButton");
            console.assert(deleteThingButton != null, "Cannot find deleteThingButton");
            this.deleteThingButton.addEventListener("click", event => {
                if (deleteCallback != null) {
                    this.deleteCallback = deleteCallback;
                    this.delete();
                }
            });
        }

        if (this.thingImageInput == null) {
            this.thingImageInput = document.getElementById("thingImageInput");
            console.assert(thingImageInput != null, "Cannot find thingImageInput");
            this.thingImageInput.addEventListener("change", event => {
                if (event.currentTarget.files != null && event.currentTarget.files[0] != null) {
                    var image = document.getElementById("thingImage");
                    image.src = URL.createObjectURL(event.currentTarget.files[0]);
                }
            });
        }

        if (this.thingFillColourInput == null) {
            this.thingFillColourInput = document.getElementById("thingFillColourInput");
            console.assert(thingFillColourInput != null, "Cannot find thingFillColourInput");
            this.thingFillColourInput.addEventListener("change", event => {
                this.background_colour = event.currentTarget.value;
            });
        }

        if (this.thingBorderColourInput == null) {
            this.thingBorderColourInput = document.getElementById("thingBorderColourInput");
            console.assert(thingBorderColourInput != null, "Cannot find thingBorderColourInput");
            this.thingBorderColourInput.addEventListener("change", event => {
                this.colour = event.currentTarget.value;
            });
        }

        if (this.thingTypeInput == null) {
            this.thingTypeInput = document.getElementById("thingTypeInput");
            var iconOption = document.createElement("option");
            this.thingTypeInput.appendChild(iconOption);

            this.types.forEach(type => {
                // var typeOption = document.createElement("option");
                // typeOption.setAttribute("class", "fa");
                // typeOption.value = type.internal_id;
                // typeOption.innerHTML = String.fromCharCode(parseInt(type.iconCode, 16)) + "&emsp;&emsp;" + type.identifier;
                var typeOption = document.createElement("option");
                typeOption.value = type.internal_id;
                typeOption.innerHTML = type.identifier;
                this.thingTypeInput.appendChild(typeOption);
            });
        }
        if (this.clearThingImageButton == null) {
            this.clearThingImageButton = document.getElementById("clearThingImageButton");
            console.assert(clearThingImageButton != null, "Cannot find clearThingImageButton");
            this.clearThingImageButton.addEventListener("click", event => {
                var imageDiv = document.getElementById("imageDiv");
                var image = document.getElementById("thingImage");
                imageDiv.removeChild(image);
                image = document.createElement("img");
                image.id = "thingImage";
                image.setAttribute("height", "100");
                image.setAttribute("width", "100");
                imageDiv.appendChild(image);
            });
        }

        if (thingToDisplay != null) {
            document.getElementById("thingModal").dataset.internal_id = thingToDisplay.internal_id;
        }
        document.getElementById("thingIdentifierInput").value = (thingToDisplay == null) ? "" : thingToDisplay.identifier;
        document.getElementById("thingDescriptionInput").value = (thingToDisplay == null) ? "" : thingToDisplay.description;
        document.getElementById("thingTypeInput").value = (thingToDisplay == null) ? "" : thingToDisplay.type;
        document.getElementById("thingFillColourInput").value = (thingToDisplay == null) ? "" : (thingToDisplay.fill_colour == null)? defaultFillColour : thingToDisplay.fill_colour;
        document.getElementById("thingBorderColourInput").value = (thingToDisplay == null) ? "" : (thingToDisplay.colour == null)? "" : thingToDisplay.colour;
        document.getElementById("thingCreatedInput").value = (thingToDisplay == null) ? "" : thingToDisplay.created;
        document.getElementById("thingUpdatedInput").value = (thingToDisplay == null) ? "" : thingToDisplay.updated;

        // Save for later when saving thing.
        // this.custom_image = thingToDisplay.custom_image;

        if ((thingToDisplay != null) && (thingToDisplay.custom_image != null)) {
            document.getElementById("thingImage").src = "data:image/png;base64, " + btoa(thingToDisplay.custom_image);
        }
    }
    delete() {
        if (this.deleteCallback != null) {
            this.deleteCallback(document.getElementById("thingModal").dataset.internal_id);
        }
    }
    save() {
        var saveThing = null;
        // Get all the input elements from the modal dialog.
        var thinginternal_id = document.getElementById("thingModal").dataset.internal_id;
        var thingIdentifierInput = document.getElementById("thingIdentifierInput");
        var thingDescriptionInput = document.getElementById("thingDescriptionInput");
        var thingTypeInput = document.getElementById("thingTypeInput");
        var thingFillColourInput = document.getElementById("thingFillColourInput");
        var thingImageInput = document.getElementById("thingImageInput");
        var thingImage = document.getElementById("thingImage");
        var imagePromise = new Promise((resolve, reject) => {
            if ((thingImageInput != null) && (thingImageInput.files.length > 0)) {
                // Get a new image.
                var fileReader = new FileReader();
                fileReader.onload = e => {
                    resolve(e.currentTarget.result);
                }
                fileReader.readAsBinaryString(thingImageInput.files[0]);
            }
            else if(thingImage.src != "") {
                // Use the existing image.
                resolve(atob(thingImage.src.replace("data:image/png;base64, ", "")));
            }
            else
            {
                // Do not use any image.
                resolve(null);
            }
        });
        imagePromise.then(results => {
            saveThing = {
                internal_id: thinginternal_id,
                identifier: thingIdentifierInput.value,
                description: thingDescriptionInput.value,
                type: thingTypeInput.value,
                custom_image: results,
                fill_colour: this.background_colour,
                colour: this.colour, 
            };
            if (this.saveCallback != null) {
                this.saveCallback(saveThing);
            }
        })
        return saveThing;
    }
}
