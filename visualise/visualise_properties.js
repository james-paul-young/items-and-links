class VisualiseProperties {
    strengthMin = -20000;
    strengthMax = 20000;
    maxDistanceMax = 15000;
    maxDistanceMin = 0;
    nodeRadiusMin = 5;
    nodeRadiusMax = 100;
    linkRadiusMax = 500;
    linkRadiusMin = 0;
    strokeWidthMax = 30;
    strokeWidthMin = 1;

    options = null;
    visualiseStrengthInput = null;
    visualiseMaxDistanceInput = null;
    visualiseNodeRadiusInput = null;
    visualiseNodeDefaultFillInput = null;
    visualiseLinkRadiusInput = null;
    visualiseStrokeWidthInput = null;

    HTML = "";
    saveThingButton = null;
    modal = null;
    saveCallback = null;
    options = null;
    /**
     * 
     * @param {Types} types An array of types the user can select from when creating/updating the thing.
     * @param {applicationResources} applicationResources Localisation support
     * @param {thingResources} thingResources Localisation support
     */
    constructor(applicationResources, visualiseResources) {
        this.modal = document.createElement("div");
        this.modal.setAttribute("id", "visualiseModal");
        this.modal.setAttribute("class", "modal fade");
        this.modal.setAttribute("tabindex", "-1");
        this.modal.setAttribute("role", "dialog");
        this.modal.innerHTML = `  
        <!-- The Visualise Options Modal -->
          <!-- Modal content -->
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="visualiseOptionsModal">Visualise Options</h5>
                <button id="visualiseOptionsCloseButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="row">
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="visualiseStrengthInput">Strength</label>
                            <input type="text   " class="form-control-range" id="visualiseStrengthInput">
                            <small id="visualiseStrengthHelp" class="form-text text-muted">Strength of the force applied to repel
                            nodes.</small>
                        </div>
                        <div class="form-group">
                            <label for="visualiseMaxDistanceInput">Maximum distance</label>
                            <input type="text" class="form-control" id="visualiseMaxDistanceInput">
                            <!-- <input type="range" class="form-control-range" id="visualiseMaxDistanceInput"> -->
                            <small id="visualiseMaxDistanceHelp" class="form-text text-muted">Counter-acts the Strength to set a maximum
                            distance between nodes.</small>
                        </div>
                        <div class="form-group">
                            <label for="visualiseNodeRadiusInput">Node Radius</label>
                            <input type="range" class="form-control-range" id="visualiseNodeRadiusInput">
                            <small id="visualiseNodeRadiusHelp" class="form-text text-muted">Radius of each node. Internal contents will
                            scale accordingly.</small>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group">
                            <label for="visualiseNodeDefaultFillInput">Default node background colour</label>
                            <input class="form-control-range" id="visualiseNodeDefaultFillInput" type="color">
                            <small id="visualiseNodeDefaultFillHelp" class="form-text text-muted">The default colour for filling the
                            background of each node where no colour has been specified.</small>
                        </div>
                        <div class="form-group">
                            <label for="visualiseLinkRadiusInput">Link radius</label>
                            <!-- <input type="range" class="form-control-range" id="visualiseLinkRadiusInput"> -->
                            <input type="text" class="form-control" id="visualiseLinkRadiusInput">
                            <small id="visualiseLinkRadiusHelp" class="form-text text-muted">Sets how circular the links between nodes
                            will be.</small>
                        </div>
                        <div class="form-group">
                            <label for="visualiseStrokeWidthInput">Stroke Width</label>
                            <input type="range" class="form-control-range" id="visualiseStrokeWidthInput">
                            <small id="visualiseStrokeWidthHelp" class="form-text text-muted">The thickness of the node borders and
                            paths between the nodes.</small>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" class="form-check-input" id="visualisePathLabelsInput">
                            <label class="form-check-label" for="visualisePathLabelsInput">Show path labels</label>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" class="form-check-input" id="visualiseNodeLabelsInput">
                            <label class="form-check-label" for="visualiseNodeLabelsInput">Show node labels</label>
                        </div>
                    </div>
                </div>
                  <div class="modal-footer">
                    <button id="saveOptionsButton" class="btn btn-primary" data-dismiss="modal">OK</button>
                    <button id="cancelOptionsButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                  </div>
                </fieldset>
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
    view(optionsToDisplay, saveCallback, updateForceCallback) {

        this.saveCallback = saveCallback;
        delete document.getElementById("visualiseModal").dataset.internal_id;

        if (this.saveOptionsButton == null) {
            // Set up all the links to the HTML buttons.
            this.saveOptionsButton = document.getElementById("saveOptionsButton");
            console.assert(saveOptionsButton != null, "Cannot find saveOptionsButton");
            this.saveOptionsButton.addEventListener("click", event => {
                if (saveCallback != null) {
                    this.saveCallback = saveCallback;
                    this.save();
                }
            });
        }
        if (this.visualiseStrengthInput == null) {
            this.visualiseStrengthInput = document.getElementById("visualiseStrengthInput");
            console.assert(visualiseStrengthInput != null, "Cannot find visualiseStrengthInput");
            visualiseStrengthInput.max = this.strengthMax;
            visualiseStrengthInput.min = this.strengthMin;
            this.visualiseStrengthInput.addEventListener("change", event => {
                this.visualiseStrengthInput.setAttribute("tooltip", event.currentTarget.result) 
                if (updateForceCallback != null) {
                    this.save().then(results => {
                        updateForceCallback();
                    });
                }
            });
        }
        if (this.visualiseMaxDistanceInput == null) {
            this.visualiseMaxDistanceInput = document.getElementById("visualiseMaxDistanceInput");
            console.assert(visualiseMaxDistanceInput != null, "Cannot find visualiseMaxDistanceInput");
            visualiseMaxDistanceInput.max = this.maxDistanceMax;
            visualiseMaxDistanceInput.min = this.maxDistanceMin;
            this.visualiseMaxDistanceInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save();
                    updateForceCallback();
                }
            });
        }
        if (this.visualiseNodeRadiusInput == null) {
            this.visualiseNodeRadiusInput = document.getElementById("visualiseNodeRadiusInput");
            console.assert(visualiseNodeRadiusInput != null, "Cannot find visualiseNodeRadiusInput");
            visualiseNodeRadiusInput.max = this.nodeRadiusMax;
            visualiseNodeRadiusInput.min = this.nodeRadiusMin;
            this.visualiseNodeRadiusInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save();
                    updateForceCallback();
                }
            });
        }
        if (this.visualiseNodeDefaultFillInput == null) {
            this.visualiseNodeDefaultFillInput = document.getElementById("visualiseNodeDefaultFillInput");
            console.assert(visualiseNodeDefaultFillInput != null, "Cannot find visualiseNodeDefaultFillInput");
            this.visualiseNodeDefaultFillInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save();
                    updateForceCallback();
                }
            });
        }
        if (this.visualiseLinkRadiusInput == null) {
            this.visualiseLinkRadiusInput = document.getElementById("visualiseLinkRadiusInput");
            console.assert(visualiseLinkRadiusInput != null, "Cannot find visualiseLinkRadiusInput");
            visualiseLinkRadiusInput.max = this.linkRadiusMax;
            visualiseLinkRadiusInput.min = this.linkRadiusMin;
            this.visualiseLinkRadiusInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save();
                    updateForceCallback();
                }
            });
        }
        if (this.visualiseStrokeWidthInput == null) {
            this.visualiseStrokeWidthInput = document.getElementById("visualiseStrokeWidthInput");
            console.assert(visualiseStrokeWidthInput != null, "Cannot find visualiseStrokeWidthInput");
            visualiseStrokeWidthInput.max = this.strokeWidthMax;
            visualiseStrokeWidthInput.min = this.strokeWidthMin;
            this.visualiseStrokeWidthInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save();
                    updateForceCallback();
                }
            });
        }
        if (this.visualisePathLabelsInput == null) {
            this.visualisePathLabelsInput = document.getElementById("visualisePathLabelsInput");
            console.assert(visualisePathLabelsInput != null, "Cannot find visualisePathLabelsInput");
            this.visualisePathLabelsInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save();
                    updateForceCallback();
                }
            });
        }
        if (this.visualiseNodeLabelsInput == null) {
            this.visualiseNodeLabelsInput = document.getElementById("visualiseNodeLabelsInput");
            console.assert(visualisePathLabelsInput != null, "Cannot find visualiseNodeLabelsInput");
            this.visualiseNodeLabelsInput.addEventListener("change", event => {
                if (updateForceCallback != null) {
                    this.save().then(result => {
                        updateForceCallback();
                    });
                }
            });
        }
        document.getElementById("visualiseStrengthInput").value = (optionsToDisplay == null) ? "" : optionsToDisplay.strength;
        document.getElementById("visualiseMaxDistanceInput").value = (optionsToDisplay == null) ? "" : optionsToDisplay.maxDistance;
        document.getElementById("visualiseNodeRadiusInput").value = (optionsToDisplay == null) ? "" : optionsToDisplay.nodeRadius;
        document.getElementById("visualiseNodeDefaultFillInput").value = (optionsToDisplay == null) ? "" : (optionsToDisplay.fill_colour == null) ? defaultFillColour : optionsToDisplay.fill_colour;
        document.getElementById("visualiseLinkRadiusInput").value = (optionsToDisplay == null) ? "" : optionsToDisplay.linkRadius;
        document.getElementById("visualiseStrokeWidthInput").value = (optionsToDisplay == null) ? "" : optionsToDisplay.strokeWidth;
        document.getElementById("visualisePathLabelsInput").checked = (optionsToDisplay == null) ? true : optionsToDisplay.pathLabels;
        document.getElementById("visualiseNodeLabelsInput").checked = (optionsToDisplay == null) ? true : optionsToDisplay.nodeLabels;
    }
    save() {
        var savePromise = new Promise((resolve, reject) => {
            var optionsToSave = null;
            // Get all the input elements from the modal dialog.
            var visualiseStrengthInput = document.getElementById("visualiseStrengthInput");
            var visualiseMaxDistanceInput = document.getElementById("visualiseMaxDistanceInput");
            var visualiseNodeRadiusInput = document.getElementById("visualiseNodeRadiusInput");
            var visualiseNodeDefaultFillInput = document.getElementById("visualiseNodeDefaultFillInput");
            var visualiseLinkRadiusInput = document.getElementById("visualiseLinkRadiusInput");
            var visualiseStrokeWidthInput = document.getElementById("visualiseStrokeWidthInput");
            var visualisePathLabelsInput = document.getElementById("visualisePathLabelsInput");
            var visualiseNodeLabelsInput = document.getElementById("visualiseNodeLabelsInput");

            optionsToSave = {
                strength: visualiseStrengthInput.value,
                maxDistance: visualiseMaxDistanceInput.value,
                nodeRadius: visualiseNodeRadiusInput.value,
                fill_colour: visualiseNodeDefaultFillInput.value,
                linkRadius: visualiseLinkRadiusInput.value,
                strokeWidth: visualiseStrokeWidthInput.value,
                pathLabels: visualisePathLabelsInput.checked,
                nodeLabels: visualiseNodeLabelsInput.checked,
            };
            if (this.saveCallback != null) {
                this.saveCallback(optionsToSave);
            }
            resolve(optionsToSave);
        });
        return (savePromise);
    }
}
