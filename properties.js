"use strict"
const setupProjectPropertiesModal = () => {
	const modal = document.createElement("div");
	modal.setAttribute("id", "projectModal");
	modal.setAttribute("class", "modal fade");
	modal.setAttribute("tabindex", "-1");
	modal.setAttribute("role", "dialog");
	modal.innerHTML = `  
		<div class="modal-dialog modal-xl" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title" id="exampleModalLabel">Properties</h3>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<h4 class="modal-title" id="exampleModalLabel">Details</h4>
					<div class="form-group">
						<label for="projectIdentifierInput">Identifier</label>
						<input class="form-control" id="projectIdentifierInput" placeholder="Enter identifier&hellip;"></input>
						<small id="projectIdentifierHelp" class="form-text text-muted">The label associated with this project.</small>
					</div>
					<div class="form-group">
						<label for="projectDescriptionInput">Description</label>
						<textarea class="form-control" id="projectDescriptionInput" placeholder="Enter description here&hellip;" rows="3"></textarea>
						<small id="projectDescriptionHelp" class="form-text text-muted">The description of this project.</small>
					</div>
					<div class="form-group">
						<div class="custom-control custom-checkbox">
							<input type="checkbox" class="custom-control-input" id="activeProjectInput" disabled="">
							<label class="custom-control-label" for="activeProjectInput">Active project</label>
				  		</div>
					 </div>
					<div class="form-group">
						<label for="projectCreatedInput">Created</label>
						<input class="form-control" id="projectCreatedInput" readonly></input>
						<small id="projectCreatedHelp" class="form-text text-muted">Date when project was created.</small>
					</div>
					<div class="form-group">
						<label for="projectUpdatedInput">Updated</label>
						<input class="form-control" id="projectUpdatedInput" readonly></input>
						<small id="projectUpdatedHelp" class="form-text text-muted">Date when project was updated.</small>
					</div>
				</div>
				<div class="modal-footer">
					<button id="exportProjectButton" class="btn btn-primary" data-dismiss="modal">Export</button>
					<button id="setAsActiveProjectButton" class="btn btn-primary" data-dismiss="modal">Set as Active</button>
					<button id="deleteProjectButton" class="btn btn-primary" data-dismiss="modal">Delete</button>
					<button id="saveProjectButton" class="btn btn-success" data-dismiss="modal">Save</button>
					<button id="cancelProjectButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	`;
	return modal;

}
/**
 * @param {string} defaultFillColour The colour to display as a default selection for a project without a fill colour.
 * @param {project} project The data of the project to display to the user.
 * @param {function} saveCallback Function to invoke when the user requests to save.
*/
const viewProject = (project, saveCallback, deleteCallback, activateProjectCallback, exportCallback) => {

	delete document.getElementById("projectModal").dataset.internal_id;

	// Set up all the links to the HTML buttons.
	const saveProjectButton = document.getElementById("saveProjectButton");
	console.assert(saveProjectButton != null, "Cannot find saveProjectButton");
	saveProjectButton.addEventListener("click", event => {
		if (saveCallback != null) {
			saveProject(saveCallback);
		}
	});

	const deleteProjectButton = document.getElementById("deleteProjectButton");
	console.assert(deleteProjectButton != null, "Cannot find deleteProjectButton");
	deleteProjectButton.addEventListener("click", event => {
		if (deleteCallback != null) {
			deleteCallback();
		}
	});
	const exportProjectButton = document.getElementById("exportProjectButton");
	console.assert(exportProjectButton != null, "Cannot find exportProjectButton");
	exportProjectButton.addEventListener("click", event => {
		if (exportCallback != null) {
			exportCallback(project);
		}
	});

	const setAsActiveProjectButton = document.getElementById("setAsActiveProjectButton");
	console.assert(setAsActiveProjectButton != null, "Cannot find setAsActiveProjectButton");
	setAsActiveProjectButton.addEventListener("click", event => {
		if (activateProjectCallback != null) {
			activateProjectCallback(project);
		}
	});

	if (project != null) {
		document.getElementById("projectModal").dataset.internal_id = project.internal_id;
	}
	document.getElementById("projectIdentifierInput").value = (project == null) ? "" : project.identifier;
	document.getElementById("projectDescriptionInput").value = (project == null) ? "" : project.description;
	document.getElementById("projectCreatedInput").value = (project == null) ? "" : project.created;
	document.getElementById("projectUpdatedInput").value = (project == null) ? "" : project.updated;
	document.getElementById("activeProjectInput").checked = (project == null) ? "" : project.active;
	
}

const saveProject = (saveCallback) => {
	// Get all the input elements from the modal dialog.
	const projectinternal_id = document.getElementById("projectModal").dataset.internal_id;
	const projectIdentifierInput = document.getElementById("projectIdentifierInput");
	const projectDescriptionInput = document.getElementById("projectDescriptionInput");
	const activeProjectInput = document.getElementById("activeProjectInput");
	const saveProject = {
		internal_id: projectinternal_id,
		identifier: projectIdentifierInput.value,
		description: projectDescriptionInput.value,
		active: activeProjectInput.value,
	};
	if (saveCallback != null) {
		saveCallback(saveProject);
	}
}