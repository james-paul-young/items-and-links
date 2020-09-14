"use strict";
const projectProperties = {
	setup: () => {
		const modal = document.createElement("div");
		modal.setAttribute("id", "project-modal");
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
						<button id="savetoFileProjectButton" class="btn btn-primary" data-dismiss="modal">Save to file</button>
						<button id="setAsActiveProjectButton" class="btn btn-primary" data-dismiss="modal">Set as Active</button>
						<button id="deleteProjectButton" class="btn btn-primary" data-dismiss="modal">Delete</button>
						<button id="saveProjectButton" class="btn btn-success" data-dismiss="modal">Save</button>
						<button id="cancelProjectButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
					</div>
				</div>
			</div>
		`;
		return modal;
	},
	/**
 * @param {string} defaultFillColour The colour to display as a default selection for a project without a fill colour.
 * @param {project} project The data of the project to display to the user.
 * @param {function} saveCallback Function to invoke when the user requests to save.
*/
	view: (project, saveCallback, deleteCallback, activateProjectCallback, exportCallback) => {

		delete document.getElementById("project-modal").dataset.internal_id;

		// Set up all the links to the HTML buttons.
		const saveProjectButton = document.getElementById("saveProjectButton");
		console.assert(saveProjectButton != null, "Cannot find saveProjectButton");
		saveProjectButton.addEventListener("click", event => {
			if (saveCallback != null) {
				projectProperties.save(saveCallback);
			}
		});

		const deleteProjectButton = document.getElementById("deleteProjectButton");
		console.assert(deleteProjectButton != null, "Cannot find deleteProjectButton");
		deleteProjectButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback();
			}
		});
		const savetoFileProjectButton = document.getElementById("savetoFileProjectButton");
		console.assert(savetoFileProjectButton != null, "Cannot find savetoFileProjectButton");
		savetoFileProjectButton.addEventListener("click", event => {
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
			document.getElementById("project-modal").dataset.internal_id = project.internal_id;
		}
		document.getElementById("projectIdentifierInput").value = (project == null) ? "" : project.identifier;
		document.getElementById("projectDescriptionInput").value = (project == null) ? "" : project.description;
		document.getElementById("projectCreatedInput").value = (project == null) ? "" : project.created;
		document.getElementById("projectUpdatedInput").value = (project == null) ? "" : project.updated;
		document.getElementById("activeProjectInput").checked = (project == null) ? "" : project.active;

	},
	save: (saveCallback) => {
		// Get all the input elements from the modal dialog.
		const projectinternal_id = document.getElementById("project-modal").dataset.internal_id;
		const projectIdentifierInput = document.getElementById("projectIdentifierInput");
		const projectDescriptionInput = document.getElementById("projectDescriptionInput");
		const activeProjectInput = document.getElementById("activeProjectInput");
		const saveProject = {
			internal_id: projectinternal_id,
			identifier: projectIdentifierInput.value,
			description: projectDescriptionInput.value,
			active: activeProjectInput.checked,
		};
		if (saveCallback != null) {
			saveCallback(saveProject);
		}
	}
}

const itemProperties = {
	setup: () => {
		const modal = document.createElement("div");
		modal.setAttribute("id", "item-modal");
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
						<div class="row">
							<div class="col-sm-6">
							<h4 class="modal-title" id="exampleModalLabel">Details</h4>
								<div class="form-group">
									<label id="itemTypeLabel" for="itemTypeInput">Type</label>
									<select class="form-control" id="itemTypeInput" placeholder="" autofocus></select>
									<small id="itemTypeHelp" class="form-text text-muted">The type of the selected item.</small>
								</div>
								<div class="form-group">
									<label for="itemIdentifierInput">Identifier</label>
									<input class="form-control" id="itemIdentifierInput" placeholder="Enter identifier&hellip;"></input>
									<small id="itemIdentifierHelp" class="form-text text-muted">The label associated with this item.</small>
								</div>
								<div class="form-group">
									<label for="itemDescriptionInput">Description</label>
									<textarea class="form-control" id="itemDescriptionInput" placeholder="Enter description here&hellip;" rows="3"></textarea>
									<small id="itemDescriptionHelp" class="form-text text-muted">The description of this item.</small>
								</div>
								<div class="form-group">
									<label for="itemCreatedInput">Created</label>
									<input class="form-control" id="itemCreatedInput" readonly></input>
									<small id="itemCreatedHelp" class="form-text text-muted">Date when item was created.</small>
								</div>
								<div class="form-group">
									<label for="itemUpdatedInput">Updated</label>
									<input class="form-control" id="itemUpdatedInput" readonly></input>
									<small id="itemUpdatedHelp" class="form-text text-muted">Date when item was updated.</small>
								</div>
							</div>
							<div class="col-sm-6">
							<h4 class="modal-title" id="exampleModalLabel">Apperance</h4>
								<div class="form-group">
									<label for="itemBorderColourInput">Colour</label>
									<input id="itemBorderColourInput" class="form-control " type="color" placeholder="Select colour&hellip;"></input>
									<small id="itemBorderColourHelp" class="form-text text-muted">The colour to use for this node when visualising</small>
								</div>
								<div class="form-group">
									<label for="itemFillColourInput">Fill Colour</label>
									<input id="itemFillColourInput" class="form-control " type="color" placeholder="Select fill colour&hellip;"></input>
									<small id="itemFillColourHelp" class="form-text text-muted">The fill colour to use for this node when visualising.</small>
								</div>
								<div class="form-group">
									<label for="itemImageInput">Image</label>
									<div id="imageDiv"><img id="itemImage" height="100" width="100"></div>
									<label class="btn btn-primary cursor-pointer" for="itemImageInput">Browse</label>
										<input type="file" id="itemImageInput" placeholder="Select image" hidden></input>
										<label class="btn btn-primary cursor-pointer" for="clearItemImageButton">Clear</label>
									<button id="clearItemImageButton" class="btn btn-primary" hidden></button>
									<small id="itemTypeHelp" class="form-text text-muted">Image to be displayed when visualising this item.</small>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col">
							<h4 class="modal-title" id="exampleModalLabel">Linked items</h4>
	
								<div style="overflow-x: auto; max-width white-space: nowrap;">
									<table style="border-spacing: 5px; border-collapse: separate;">
										<tbody id="linkContainer"></tbody>
									</table>
								</div>
							</div>
						</div>
						<div class="modal-footer">
						<button id="deleteItemButton" class="btn btn-primary" data-dismiss="modal">Delete</button>
						<button id="saveItemButton" class="btn btn-success" data-dismiss="modal">Save</button>
						<button id="cancelItemButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
						</div>
					</div>
				</div>
			</div>
		`;
		return modal;

	},
	/**
	* @param {string} defaultFillColour The colour to display as a default selection for a item without a fill colour.
	* @param {item} item The data of the item to display to the user.
	* @param {function} saveCallback Function to invoke when the user requests to save.
   */
	view: (item, parentItem, saveCallback, nodes, links, linkTypes, itemTypes, displayOptions, deleteCallback) => {

		delete document.getElementById("item-modal").dataset.internal_id;

		// Set up all the links to the HTML buttons.
		const saveItemButton = document.getElementById("saveItemButton");
		console.assert(saveItemButton != null, "Cannot find saveItemButton");
		saveItemButton.addEventListener("click", event => {
			if (saveCallback != null) {
				itemProperties.save(saveCallback, parentItem, nodes, links, linkTypes, itemTypes);
			}
		});

		const deleteItemButton = document.getElementById("deleteItemButton");
		console.assert(deleteItemButton != null, "Cannot find deleteItemButton");
		deleteItemButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback();
			}
		});

		const cancelItemButton = document.getElementById("cancelItemButton");
		console.assert(cancelItemButton != null, "Cannot find cancelItemButton");
		cancelItemButton.addEventListener("click", event => {
		});
		const itemImageInput = document.getElementById("itemImageInput");
		console.assert(itemImageInput != null, "Cannot find itemImageInput");
		itemImageInput.addEventListener("change", event => {
			if (event.currentTarget.files != null && event.currentTarget.files[0] != null) {
				const image = document.getElementById("itemImage");
				image.src = URL.createObjectURL(event.currentTarget.files[0]);
			}
		});

		const itemFillColourInput = document.getElementById("itemFillColourInput");
		console.assert(itemFillColourInput != null, "Cannot find itemFillColourInput");
		itemFillColourInput.addEventListener("change", event => {
			background_colour = event.currentTarget.value;
		});

		const itemBorderColourInput = document.getElementById("itemBorderColourInput");
		console.assert(itemBorderColourInput != null, "Cannot find itemBorderColourInput");
		itemBorderColourInput.addEventListener("change", event => {
			colour = event.currentTarget.value;
		});

		const itemTypeInput = document.getElementById("itemTypeInput");
		const iconOption = document.createElement("option");
		itemTypeInput.appendChild(iconOption);

		if (itemTypes != null) {
			itemTypes.sort((a, b) => a.identifier.localeCompare(b.identifier)).forEach(type => {
				const typeOption = document.createElement("option");
				typeOption.value = type.internal_id;
				typeOption.innerHTML = type.identifier;
				itemTypeInput.appendChild(typeOption);
			});
		}
		const clearItemImageButton = document.getElementById("clearItemImageButton");
		console.assert(clearItemImageButton != null, "Cannot find clearItemImageButton");
		clearItemImageButton.addEventListener("click", event => {
			const imageDiv = document.getElementById("imageDiv");
			const image = document.getElementById("itemImage");
			imageDiv.removeChild(image);
			image = document.createElement("img");
			image.id = "itemImage";
			image.setAttribute("height", "100");
			image.setAttribute("width", "100");
			imageDiv.appendChild(image);
		});

		if (item != null) {
			document.getElementById("item-modal").dataset.internal_id = item.internal_id;
		}
		document.getElementById("itemIdentifierInput").value = (item == null) ? "" : item.identifier;
		document.getElementById("itemDescriptionInput").value = (item == null) ? "" : item.description;
		let itemColour = "";
		let itemBackgroundColour = "";
		if (item && item.type) {
			document.getElementById("itemTypeInput").value = item.type.internal_id;

			itemColour = item.type.colour;
			itemBackgroundColour = item.type.background_colour;
		}
		else if (item) {
			itemColour = "" + item.colour;
			itemBackgroundColour = "" + item.background_colour;
		}
		document.getElementById("itemBorderColourInput").value = itemColour;

		document.getElementById("itemFillColourInput").value = (item == null) ? "" : itemBackgroundColour;
		document.getElementById("itemCreatedInput").value = (item == null) ? "" : item.created;
		document.getElementById("itemUpdatedInput").value = (item == null) ? "" : item.updated;

		// Save for later when saving item.
		// custom_image = item.custom_image;

		if ((item != null) && (item.custom_image != null)) {
			document.getElementById("itemImage").src = "data:image/png;base64, " + btoa(item.custom_image);
		}

		if (item != null) {
			// Get all the links to this item. Use these links to get items one hop from the current node.
			const itemLinks = links.filter(link => (link.source != null) && (link.target != null) && ((link.source.internal_id == item.internal_id) || (link.target.internal_id == item.internal_id)));
			const linkedItems = itemLinks.map(link => {
				let foundItem = null;
				// Get the other end of the link as these ends are what should be displayed to the user.
				if (link.source.internal_id == item.internal_id) {
					foundItem = link.target;
				}
				else if (link.target.internal_id == item.internal_id) {
					foundItem = link.source;
				}
				else {
					console.log("Error!");
				}
				return foundItem;
			});
			console.log("linkedItems = " + linkedItems.length);
			const itemsRow = d3.select("#linkContainer").append("tr");
			const itemCells = itemsRow.selectAll("td")
				.data(linkedItems)
				.join("td")
				.style("min-width", "200px")
				.style("max-width", "250px")
				.style("min-height", "200px")
				.style("max-height", "250px")
				.style("border", "1px solid gainsboro")
				.style("border-radius", "4px")
				.style("text-align", "center")
				.style("vertical-align", "top")
			itemCells
				.append("h5")
				.text(d => d.identifier)

			itemCells
				.append("div")
				.attr("class", "")
				.append("svg")
				.attr("height", "100px")
				.attr("viewBox", [0, 0, 20, 20])
				.append("circle")
				.attr("r", 10)
				.attr("cx", 10)
				.attr("cy", 10)
				.style("fill", d => {
					let fillColour = null;
					if (d.type) {
						fillColour = d.type.background_colour;
					}
					else {
						fillColour = d.background_colour;
					}
					return fillColour;
				})

			const listDescriptors = itemCells
				.append("div")
				.style("min-height", "50px")
				.text(d => d.description);
		}
		document.getElementById("itemTypeInput").focus();

	},
	save: (saveCallback, parentNode, nodes, links, linkTypes, itemTypes) => {
		// Get all the input elements from the modal dialog.
		const iteminternal_id = document.getElementById("item-modal").dataset.internal_id;
		const itemIdentifierInput = document.getElementById("itemIdentifierInput");
		const itemDescriptionInput = document.getElementById("itemDescriptionInput");
		const itemTypeInput = document.getElementById("itemTypeInput");
		const itemFillColourInput = document.getElementById("itemFillColourInput");
		const itemImageInput = document.getElementById("itemImageInput");
		const itemImage = document.getElementById("itemImage");
		const itemBorderColourInput = document.getElementById("itemBorderColourInput")
		const imagePromise = new Promise((resolve, reject) => {
			if ((itemImageInput != null) && (itemImageInput.files.length > 0)) {
				// Get a new image.
				const fileReader = new FileReader();
				fileReader.onload = e => {
					resolve(e.currentTarget.result);
				}
				fileReader.readAsBinaryString(itemImageInput.files[0]);
			}
			else if (itemImage.src != "") {
				// Use the existing image.
				resolve(atob(itemImage.src.replace("data:image/png;base64, ", "")));
			}
			else {
				// Do not use any image.
				resolve(null);
			}
		});
		imagePromise.then(results => {
			const saveItem = {
				internal_id: iteminternal_id,
				identifier: itemIdentifierInput.value,
				description: itemDescriptionInput.value,
				type: itemTypes.find(itemType => itemType.internal_id == itemTypeInput.value),
				custom_image: results,
				fill_colour: itemFillColourInput.value,
				colour: itemBorderColourInput.value,
			};
			if (saveCallback != null) {
				saveCallback(saveItem, parentNode, nodes, links, linkTypes, itemTypes);
			}
		});
	}
}

const itemTypeProperties = {
	setup: () => {
		const modal = document.createElement("div");
		modal.setAttribute("id", "item-type-modal");
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
						<div class="row">
							<div class="col-sm-6">
							<h4 class="modal-title" id="exampleModalLabel">Details</h4>
								<div class="form-group">
									<label for="item-type-identifier">Identifier</label>
									<input class="form-control" id="item-type-identifier" placeholder="Enter identifier&hellip;"></input>
									<small id="item-type-identifier-help" class="form-text text-muted">The label associated with this Item Type.</small>
								</div>
								<div class="form-group">
									<label for="item-type-description">Description</label>
									<textarea class="form-control" id="item-type-description" placeholder="Enter description here&hellip;" rows="3"></textarea>
									<small id="item-type-description-help" class="form-text text-muted">The description of this Item Type.</small>
								</div>
								<div class="form-group">
									<label for="item-type-created">Created</label>
									<input class="form-control" id="item-type-created" readonly></input>
									<small id="item-type-created-help" class="form-text text-muted">Date when Item Type was created.</small>
								</div>
								<div class="form-group">
									<label for="item-type-updated">Updated</label>
									<input class="form-control" id="item-type-updated" readonly></input>
									<small id="item-type-updated-help" class="form-text text-muted">Date when Item Type was updated.</small>
								</div>
							</div>
							<div class="col-sm-6">
								<h4 class="modal-title">Apperance</h4>
								<div class="form-group">
									<label for="item-type-border-colour">Colour</label>
									<input id="item-type-border-colour" class="form-control " type="color" placeholder="Select colour&hellip;"></input>
									<small id="item-type-border-colour-help" class="form-text text-muted">The colour to use for this Item Type when visualising.</small>
								</div>
								<div class="form-group">
									<label for="item-type-fill-colour">Fill Colour</label>
									<input id="item-type-fill-colour" class="form-control " type="color" placeholder="Select fill colour&hellip;"></input>
									<small id="item-type-fill-colour-help" class="form-text text-muted">The fill colour to use for this Item Type when visualising.</small>
								</div>
								<div class="form-group">
									<label for="item-type-image">Image</label>
									<div id="item-type-image-div"><img id="item-type-image" height="100" width="100"></div>
									<label class="btn btn-primary cursor-pointer" for="item-type-image">Browse</label>
									<input type="file" id="item-type-image-name" placeholder="Select image" hidden></input>
									<label class="btn btn-primary cursor-pointer" for="item-type-clear-image">Clear</label>
									<button id="item-type-clear-image" class="btn btn-primary" hidden></button>
									<small id="itemTypeHelp" class="form-text text-muted">Image to be displayed when visualising this item.</small>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col">
<!--
								<h4 class="modal-title">Linked items</h4>
								<div style="overflow-x: auto; max-width white-space: nowrap;">
									<table style="border-spacing: 5px; border-collapse: separate;">
										<tbody id="item-"></tbody>
									</table>
								</div>
-->
							</div>
						</div>
						<div class="modal-footer">
						<button id="item-type-delete" class="btn btn-primary" data-dismiss="modal">Delete</button>
						<button id="item-type-save" class="btn btn-success" data-dismiss="modal">Save</button>
						<button id="item-type-cancel" class="btn btn-danger" data-dismiss="modal">Cancel</button>
						</div>
					</div>
				</div>
			</div>
		`;
		return modal;

	},
	/**
	* @param {string} defaultFillColour The colour to display as a default selection for a item without a fill colour.
	* @param {item} item The data of the item to display to the user.
	* @param {function} saveCallback Function to invoke when the user requests to save.
   */
	view: (itemType, parentItem, saveCallback, nodes, links, linkTypes, itemTypes, displayOptions, deleteCallback) => {

		delete document.getElementById("item-type-modal").dataset.internal_id;

		// Set up all the links to the HTML buttons.
		const saveButton = document.getElementById("item-type-save");
		saveButton.addEventListener("click", event => {
			if (saveCallback != null) {
				itemTypeProperties.save(saveCallback, parentItem, nodes, links, linkTypes, itemTypes);
			}
		});

		const deleteButton = document.getElementById("item-type-delete");
		deleteButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback();
			}
		});

		const cancelButton = document.getElementById("item-type-cancel");
		cancelButton.addEventListener("click", event => {
		});
		const imageInput = document.getElementById("item-type-image-name");
		imageInput.addEventListener("change", event => {
			if (event.currentTarget.files != null && event.currentTarget.files[0] != null) {
				const image = document.getElementById("item-type-image");
				image.src = URL.createObjectURL(event.currentTarget.files[0]);
			}
		});

		const fillColourInput = document.getElementById("item-type-fill-colour");
		//    fillColourInput.addEventListener("change", event => {
		// 	   background_colour = event.currentTarget.value;
		//    });

		const borderColourInput = document.getElementById("item-type-border-colour");
		//    borderColourInput.addEventListener("change", event => {
		// 	   colour = event.currentTarget.value;
		//    });

		const clearImageButton = document.getElementById("item-type-clear-image");
		clearImageButton.addEventListener("click", event => {
			const imageDiv = document.getElementById("item-type-image-div");
			const image = document.getElementById("item-type-image");
			imageDiv.removeChild(image);
			image = document.createElement("img");
			image.id = "item-type-image";
			image.setAttribute("height", "100");
			image.setAttribute("width", "100");
			imageDiv.appendChild(image);
		});

		if (itemType != null) {
			document.getElementById("item-type-modal").dataset.internal_id = itemType.internal_id;
		}
		document.getElementById("item-type-identifier").value = (itemType == null) ? "" : itemType.identifier;
		document.getElementById("item-type-description").value = (itemType == null) ? "" : itemType.description;
		document.getElementById("item-type-border-colour").value = (itemType == null) ? "" : ("" + itemType.colour);

		document.getElementById("item-type-fill-colour").value = (itemType == null) ? "" : ("" + itemType.fill_colour);
		document.getElementById("item-type-created").value = (itemType == null) ? "" : itemType.created;
		document.getElementById("item-type-updated").value = (itemType == null) ? "" : itemType.updated;

		// Save for later when saving item.
		// custom_image = item.custom_image;

		if ((itemType != null) && (itemType.custom_image != null)) {
			document.getElementById("item-type-image").src = "data:image/png;base64, " + btoa(itemType.custom_image);
		}

		document.getElementById("item-type-identifier").focus();
	},
	save: (saveCallback, parentNode, nodes, links, linkTypes, itemTypes) => {
		// Get all the input elements from the modal dialog.
		const iteminternal_id = document.getElementById("item-type-modal").dataset.internal_id;
		const itemIdentifierInput = document.getElementById("item-type-identifier");
		const itemDescriptionInput = document.getElementById("item-type-description");
		const itemFillColourInput = document.getElementById("item-type-fill-colour");
		const itemImageInput = document.getElementById("item-type-image-name");
		const itemImage = document.getElementById("item-type-image");
		const itemBorderColourInput = document.getElementById("item-type-border-colour")
		const imagePromise = new Promise((resolve, reject) => {
			if ((itemImageInput != null) && (itemImageInput.files.length > 0)) {
				// Get a new image.
				const fileReader = new FileReader();
				fileReader.onload = e => {
					resolve(e.currentTarget.result);
				}
				fileReader.readAsBinaryString(itemImageInput.files[0]);
			}
			else if (itemImage.src != "") {
				// Use the existing image.
				resolve(atob(itemImage.src.replace("data:image/png;base64, ", "")));
			}
			else {
				// Do not use any image.
				resolve(null);
			}
		});
		imagePromise.then(results => {
			const saveItem = {
				internal_id: iteminternal_id,
				identifier: itemIdentifierInput.value,
				description: itemDescriptionInput.value,
				custom_image: results,
				fill_colour: itemFillColourInput.value,
				colour: itemBorderColourInput.value,
			};
			if (saveCallback != null) {
				saveCallback(saveItem, parentNode, nodes, links, linkTypes, itemTypes);
			}
		});
	}
}

const linkProperties = {
	setup: () => {
		const modal = document.createElement("div");
		modal.setAttribute("id", "link-modal");
		modal.setAttribute("class", "modal fade");
		modal.setAttribute("tabindex", "-1");
		modal.setAttribute("role", "dialog");
		modal.innerHTML = `    
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
						<label for="link-identifier">Identifier</label>
						<input class="form-control" id="link-identifier" placeholder="Enter identifier"></input>
						<small id="link-identifier-help" class="form-text text-muted">Text displayed on visual
						representations.</small>
		
						<label for="link-description">Description</label>
						<textarea id="link-description" class="form-control " placeholder="Enter description"
						rows="3"></textarea>
						<small id="link-description-help" class="form-text text-muted">The description of this link.</small>
		
						<label for="link-source">Source</label>
						<select class="form-control" id="link-source" placeholder="Source"></select>
						<small id="link-source-help" class="form-text text-muted">The beginning of the
						link.</small>
		
						<label for="link-type">Link</label>
						<ul id="link-type" class="list-group linksInput">
						</ul>

						<label for="link-target">Target</label>
						<select class="form-control" id="link-target" placeholder="Target"></select>
						<small id="link-target-help" class="form-text text-muted">The end of the link.</small>
		
						<label for="linkCreatedInput">Created</label>
						<input class="form-control" id="linkCreatedInput" placeholder="" readonly=""></input>
						<small id="link-created-help" class="form-text text-muted">The date and time the link was created.</small>

						<label for="linkUpdatedInput">Updated</label>
						<input class="form-control" id="linkUpdatedInput" placeholder="" readonly=""></input>
						<small id="link-updated-help" class="form-text text-muted">The date and time the link was updated.</small>
		
						<div class="modal-footer">
						<button id="swap-source-and-target" class="btn btn-primary">Source <--> Target</button>
						<button id="link-delete" class="btn btn-warning" data-dismiss="modal">Delete</button>
						<button id="link-save" class="btn btn-primary" data-dismiss="modal">Save</button>
						<button id="link-cancel" class="btn btn-danger" data-dismiss="modal">Cancel</button>
						</div>
					</fieldset>
				</div>
			</div>
		</div>
	</div>
	`
		return modal;
	},
	dashesAndEnds: {
		end: [
			{ id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-5 -5 10 10' }
			, { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' }
			, { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' }
			, { id: 3, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
		],
		dash: [
			{ name: "short dash", on: 3, off: 3 },
			{ name: "solid", on: 1, off: 0 },
			{ name: "dash", on: 7, off: 7 }
		]
	},

	createMarkerEnd: (idPrefix, dashesAndEnds, end_name, colour, width, height, refX, refY) => {
		const defs = d3.select("#defs");
		if (document.getElementById(idPrefix + colour.substring(1) + end_name) == null) {
			const end = linkProperties.dashesAndEnds.end.find(currentEnd => currentEnd.name == end_name)
			defs
				.append('marker')
				.attr('markerUnits', 'strokeWidth')
				.attr('orient', 'auto')
				.attr('id', idPrefix + colour.substring(1) + end_name)
				.attr('markerHeight', height)
				.attr('markerWidth', width)
				.attr('refX', refX) // 19
				.attr('refY', refY) // 0
				.attr('viewBox', end.viewbox)
				.append('path')
				.attr('d', end.path)
				.attr('fill', colour);
		}
	},

	createLineAndMarker: (svg, width, height, markerData, dashType) => {
		const svgWidth = width;
		const svgHeight = height;
		const strokeWidth = 2;

		const defs = d3.select("#defs");

		const lineGroup = svg.append('g')
			.attr('id', 'marker')
			.attr('transform', 'translate(' + 0 + ',' + 0 + ')');

		const path = lineGroup.selectAll('line')
			.data([linkProperties.dashesAndEnds.end])
			.enter()
			.append('line')
			.attr('x1', d => d.width + strokeWidth + 1)
			.attr('y1', Math.floor(svgHeight / 2))
			.attr('x2', d => svgWidth - d.width - strokeWidth - 2)
			.attr('y2', Math.floor(svgHeight / 2))
			.attr('stroke', (d, i) => { return d.colour; })
			.attr('stroke-width', strokeWidth)
			.attr('stroke-linecap', 'round')
			.attr("stroke-dasharray", dashType.on + " " + dashType.off)
			.attr('marker-end', (d, i) => { return 'url(#marker_' + d.internal_id + ")"; })
			.each(d => {
				linkProperties.createMarkerEnd("selector", linkProperties.linkProperties.dashesAndEnds, d.dash.name, d.colour, 5, 5, 0, 0);
			})

	},

	drawDashesAndMarkersSelect: (inputId, colour, dashName, markerName) => {
		console.assert(inputId != "", "No input Id to identify \"list\" element.");
		let selectedLinkListItem = null;
		const listContainer = document.getElementById(inputId)

		// Clear out any content in the list before adding all the links.
		listContainer.innerHTML = "";
		// Loop through the dashes and markers to create a candidate line for a link.
		LinkLines.dashes.forEach(dashItem => {
			LinkLines.data.forEach(markerItem => {
				// Create the list item for containing the candidate line.
				const linkListItem = document.createElement("li");
				linkListItem.setAttribute("class", "d-flex justify-content-between align-items-center linkListItem");
				// // Set the id so the svg can be added to this element below.
				// linkListItem.id = "link-" + markerItem.name + "-" + dashItem.name;
				linkListItem.dataset.marker = markerItem.name;
				linkListItem.dataset.dash = dashItem.name;
				// See if the current candidate line should be marked as "selected" based on parameters passed to this function.
				if ((dashItem.name == dashName) && (markerItem.name == markerName)) {
					selectedLinkListItem = linkListItem;
					linkListItem.classList.add("linksInputSelected");
				}
				// Add a "click" listener to handle the current item being "selected" as the candidate line.
				linkListItem.addEventListener("click", (event) => {
					const alllinkListItems = document.querySelectorAll(".linkListItem");
					// Clear the selection indicators of all other candidate lines.
					[...alllinkListItems].forEach(linkListItem => {
						linkListItem.classList.remove("linksInputSelected");
					});
					// Set the selection indicator for the current candidate line.
					event.currentTarget.classList.toggle("linksInputSelected");
				});
				// Create the container for the candidate line
				const linkListItemDiv = document.createElement("div");
				// Give the container a random id to uniquely identify it among other containers. Used when adding SVG.
				linkListItemDiv.id = utils.makeid(50);
				linkListItemDiv.width = "100px";
				linkListItem.appendChild(linkListItemDiv);

				// Add the container to the list.
				listContainer.appendChild(linkListItem);

				const svg = d3.select("#" + linkListItemDiv.id).append('svg')
					.attr('width', "100")
					.attr('height', "20")
					.attr("id", "svg_" + linkListItemDiv.id);
				//const marker = data.find((datum) => datum.name == markerItem.name);
				const candidateLineMarker = JSON.parse(JSON.stringify(markerItem));
				candidateLineMarker.internal_id = utils.makeid(50);
				candidateLineMarker.colour = colour;
				candidateLineMarker.width = 5;
				candidateLineMarker.height = 5;
				LinkLines.createLineAndMarker(svg, 100, 20, candidateLineMarker, dashItem);
			});
			if (selectedLinkListItem != null) {
				selectedLinkListItem.scrollIntoView();
			}

		});

	},

	/**
	* @param {Link} link The data of the item to display to the user.
	* @param {function} saveCallback Function to invoke when the user requests to save.
	*/
	view: (link, links, linkTypes, items, itemTypes, saveCallback, deleteCallback) => {

		delete document.getElementById("link-modal").dataset.internal_id;

		const swapSourceAndTarget = document.getElementById("swap-source-and-target");
		swapSourceAndTarget.addEventListener("click", event => {
			const sourceValue = document.getElementById("link-source").value;
			const targetValue = document.getElementById("link-target").value;

			document.getElementById("link-source").value = targetValue;
			document.getElementById("link-target").value = sourceValue;
		});

		// Set up all the links to the HTML buttons.
		const deleteButton = document.getElementById("link-delete");
		deleteButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback(link, links, linkTypes, items, itemTypes);
			}
		});

		const saveButton = document.getElementById("link-save");
		saveButton.addEventListener("click", event => {
			if (saveCallback != null) {
				linkProperties.save(saveCallback, null, items, links, linkTypes, itemTypes);
			}
		});

		const sourceInput = document.getElementById("link-source");
		const targetInput = document.getElementById("link-target");
		targetInput.innerHTML = "";
		sourceInput.innerHTML = "";
		sourceInput.value = "";
		targetInput.value = "";
		const blankOption = document.createElement("option");
		sourceInput.appendChild(blankOption);

		targetInput.appendChild(blankOption.cloneNode());
		items.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier));

		items.forEach(item => {
			const itemOption = document.createElement("option");
			itemOption.innerHTML = item.identifier;
			if (item.type != null) {
				itemOption.innerHTML = itemOption.innerHTML + " (" + item.type.identifier + ")";
			}
			itemOption.value = item.internal_id;
			sourceInput.appendChild(itemOption);
			const targetItemOption = itemOption.cloneNode();
			targetItemOption.innerHTML = item.identifier;
			if (item.type != null) {
				targetItemOption.innerHTML = targetItemOption.innerHTML + " (" + item.type.identifier + ")";
			}
			targetInput.appendChild(targetItemOption);
		});
		const linkList = document.getElementById("link-type");
		linkList.setAttribute("class", "linkTypeList")
		linkList.innerHTML = "";

		const linkTypeList = d3.select("#link-type")
		const linkTypeListItems = linkTypeList.selectAll(".linkListItem")
			.data(linkTypes)
			.join("li")
			.attr("id", d => "availableLinkType" + d.internal_id)
			.attr("data-internal-id", d => d.internal_id)
			.on("click", function (d) {
				const allSelectedLinkTypeListItems = document.querySelectorAll(".connectorListSelectedItem");
				allSelectedLinkTypeListItems.forEach(linkType => {
					linkType.classList.remove("connectorListSelectedItem")
				});
				const listTypeItem = d3.select(this);
				const listTypeItemClass = (listTypeItem.attr("class") != null) ? listTypeItem.attr("class") : "";
				listTypeItem.attr("class", listTypeItemClass + " connectorListSelectedItem");
			})
			.append("div")
			.on("mouseover", function () {
				d3.select(this).style("cursor", "pointer");
			})

		const linkTypeListItemsSVG = linkTypeListItems
			.append("span")
			.style("padding-right", "5px")
			.append("svg")
			.attr('width', 100)
			.attr('height', 20)
		linkTypeListItemsSVG.append("defs")
			.attr("id", d => "defs" + d.internal_id)
		linkTypeListItemsSVG
			.append("line")
			.attr("x1", 0)
			.attr("y1", 10)
			.attr("x2", 80)
			.attr("y2", 10)
			.style("stroke", d => d.colour)
			.style("stroke-width", 2)
			.attr("marker-end", d => `url(#linkListTypeMarker${d.internal_id})`)
			.each(d => {
				const defs = d3.select("#defs" + d.internal_id);
				const end = linkProperties.dashesAndEnds.end.find(end => end.name == d.marker);
				defs
					.append("marker")
					.attr('markerUnits', 'strokeWidth')
					.attr('orient', 'auto')
					.attr('id', "linkListTypeMarker" + d.internal_id)
					.attr('markerHeight', 5)
					.attr('markerWidth', 5)
					.attr('refX', 4)
					.attr('refY', 0)
					.attr('viewBox', d => end.viewbox)
					.append('path')
					.attr('d', end.path)
					.attr('fill', d.colour);
			});

		linkTypeListItems
			.append("span")
			.text(d => d.identifier)

		if (link != null) {
			document.getElementById("link-source").value = (link.source == null) ? "" : link.source.internal_id;
			document.getElementById("link-target").value = (link.target == null) ? "" : link.target.internal_id;
			document.getElementById("link-identifier").value = (link.identifier == null) ? "" : link.identifier;
			document.getElementById("link-description").value = (link.description == null) ? "" : link.description;
			if (link.internal_id != null) {
				document.getElementById("link-modal").dataset.internal_id = link.internal_id;
			}
			document.getElementById("linkCreatedInput").value = (link.created == null) ? "" : link.created;
			document.getElementById("linkUpdatedInput").value = (link.updated == null) ? "" : link.updated;
			if (link.connector != null) {
				const selectedLink = document.getElementById("availableLinkType" + link.connector.internal_id);
				if (selectedLink != null) {
					selectedLink.classList.toggle("connectorListSelectedItem");
				}
			}
		}

	},
	save: (saveCallback, parent, items, links, linkTypes, itemTypes) => {
		// Get all the input elements from the modal dialog.
		const linkInternal_id = document.getElementById("link-modal").dataset.internal_id == null ? null : document.getElementById("link-modal").dataset.internal_id;
		const linkIdentifier = document.getElementById("link-identifier");
		const linkDescription = document.getElementById("link-description");
		const linkSource = document.getElementById("link-source");
		const linkTarget = document.getElementById("link-target");
		const linkListSelectedItem = document.querySelectorAll(".connectorListSelectedItem");
		let selectedConnector = null;
		if ((linkListSelectedItem != null) && (linkListSelectedItem.length > 0)) {
			selectedConnector = linkListSelectedItem[0].dataset.internalId;
		}
		const linkToSave = {
			internal_id: linkInternal_id,
			identifier: linkIdentifier.value,
			description: linkDescription.value,
			source: items.find(item => item.internal_id == linkSource.value),
			target: items.find(item => item.internal_id == linkTarget.value),
			connector: linkTypes.find(connector => connector.internal_id == selectedConnector),
		}
		if (saveCallback != null) {
			saveCallback(linkToSave, links, linkTypes, items, itemTypes);
		}
	},
}

const linkTypeProperties = {
	dashesAndEnds: {
		end: [
			{ id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-5 -5 10 10' }
			, { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' }
			, { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' }
			, { id: 3, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
		],
		dash: [
			{ name: "short dash", on: 3, off: 3 },
			{ name: "solid", on: 1, off: 0 },
			{ name: "dash", on: 7, off: 7 }
		]
	},
	makeid: (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},

	setup: () => {
		const modal = document.createElement("div");
		modal.setAttribute("id", "link-type-modal");
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
						<div class="row">
							<div class="col-sm-6">
							<h4 class="modal-title" id="exampleModalLabel">Details</h4>
								<div class="form-group">
									<label for="link-type-identifier">Identifier</label>
									<input class="form-control" id="link-type-identifier" placeholder="Enter identifier&hellip;"></input>
									<small id="link-type-identifier-help" class="form-text text-muted">The label associated with this Link Type.</small>
								</div>
								<div class="form-group">
									<label for="link-type-description">Description</label>
									<textarea class="form-control" id="link-type-description" placeholder="Enter description here&hellip;" rows="3"></textarea>
									<small id="link-type-description-help" class="form-text text-muted">The description of this Link Type.</small>
								</div>
								<div class="form-group">
									<label for="link-type-created">Created</label>
									<input class="form-control" id="link-type-created" readonly></input>
									<small id="link-type-created-help" class="form-text text-muted">Date when Link Type was created.</small>
								</div>
								<div class="form-group">
									<label for="link-type-updated">Updated</label>
									<input class="form-control" id="link-type-updated" readonly></input>
									<small id="link-type-updated-help" class="form-text text-muted">Date when Link Type was updated.</small>
								</div>
							</div>
							<div class="col-sm-6">
								<h4 class="modal-title">Appearance</h4>
								<div class="form-group">
									<label for="link-type-border-colour">Colour</label>
									<input id="link-type-border-colour" class="form-control " type="color" placeholder="Select colour&hellip;"></input>
									<small id="link-type-border-colour-help" class="form-text text-muted">The colour to use for this Link Type when visualising.</small>
								</div>
								<div class="form-group">
									<label for="connectorMarkerInput">Style</label>
									<ul id="connectorMarkerInput" class="border rounded connectorsInput" style="height: 270px; max-height: 270px; overflow-y:scroll;">
									</ul>
									<small id="link-type-style-help" class="form-text text-muted">A visualisation of the link type.</small>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col">
							</div>
						</div>
						<div class="modal-footer">
						<button id="link-type-delete" class="btn btn-primary" data-dismiss="modal">Delete</button>
						<button id="link-type-save" class="btn btn-success" data-dismiss="modal">Save</button>
						<button id="link-type-cancel" class="btn btn-danger" data-dismiss="modal">Cancel</button>
						</div>
					</div>
				</div>
			</div>
		`;
		return modal;

	},
	createMarkerEnd: (id, colour, markerEnd, width, height, refX, refY) => {
		const svg = d3.select("#" + id);

		const defs = svg.append("defs");
		//const defs = d3.select("defs");
		const end = linkTypeProperties.dashesAndEnds.end.find(currentEnd => currentEnd.name == markerEnd)
		defs
			.append('marker')
			.attr('markerUnits', 'strokeWidth')
			.attr('orient', 'auto')
			.attr('id', "linkType_" + id)
			.attr('markerHeight', height + "px")
			.attr('markerWidth', width + "px")
			.attr('refX', refX) // 19
			.attr('refY', refY) // 0
			.attr('viewBox', end.viewbox)
			.append('path')
			.attr('d', end.path)
			.attr('fill', colour);
	},

	createLineAndMarker: (id, colour, markerEnd, width, height, dashType) => {
		const svgWidth = width;
		const svgHeight = height;
		const strokeWidth = 2;
		const svg = d3.select("#" + id);

		svg.selectAll('line')
			.data([dashType])
			.enter()
			.append('line')
			.attr('x1', d => strokeWidth + 1)
			.attr('y1', Math.floor(svgHeight / 2))
			.attr('x2', d => svgWidth - strokeWidth - 2)
			.attr('y2', Math.floor(svgHeight / 2))
			.attr('stroke', colour)
			.attr('stroke-width', strokeWidth)
			.attr('stroke-linecap', 'round')
			.attr("stroke-dasharray", d => {
				const dash = linkProperties.dashesAndEnds.dash.find(dash => d == dash.name);
				return dash.on + " " + dash.off;
			})
			.attr('marker-end', 'url(#linkType_' + id + ")")
			.each(d => {
				linkTypeProperties.createMarkerEnd(id, colour, markerEnd, 5, 5, 0, 0);
			})

	},
	/**
 * 
 * @param {string} inputId ID of the list UI element
 * @param {string} colour Colour value to use for each connector line
 * @param {*} dashName The name of the dash to be selected (in combination with the marker name)
 * @param {*} markerName The name of the marker to be selected (in combination with the dash name)
 */
	drawDashesAndMarkersSelect: (inputId, colour, dashName, markerName) => {
		console.assert(inputId != "", "No input Id to identify \"list\" element.");
		let selectedConnectorListItem = null;
		const listContainer = document.getElementById(inputId)

		// Clear out any content in the list before adding all the connectors.
		listContainer.innerHTML = "";
		// Loop through the dashes and markers to create a candidate line for a connector.
		linkTypeProperties.dashesAndEnds.dash.forEach(dashItem => {
			linkTypeProperties.dashesAndEnds.end.forEach(markerItem => {
				// Create the list item for containing the candidate line.
				const connectorListItem = document.createElement("li");
				connectorListItem.setAttribute("class", "d-flex justify-content-between align-items-center connectorListItem");
				// // Set the id so the svg can be added to this element below.
				// connectorListItem.id = "connector-" + markerItem.name + "-" + dashItem.name;
				connectorListItem.dataset.marker = markerItem.name;
				connectorListItem.dataset.dash = dashItem.name;
				// See if the current candidate line should be marked as "selected" based on parameters passed to this function.
				if ((dashItem.name == dashName) && (markerItem.name == markerName)) {
					selectedConnectorListItem = connectorListItem;
					connectorListItem.classList.add("connectorListSelectedItem");
				}
				// Add a "click" listener to handle the current item being "selected" as the candidate line.
				connectorListItem.addEventListener("click", (event) => {
					const allconnectorListItems = document.querySelectorAll(".connectorListItem");
					// Clear the selection indicators of all other candidate lines.
					[...allconnectorListItems].forEach(connectorListItem => {
						connectorListItem.classList.remove("connectorListSelectedItem");
					});
					// Set the selection indicator for the current candidate line.
					event.currentTarget.classList.toggle("connectorListSelectedItem");
				});
				// Create the container for the candidate line
				const connectorListItemDiv = document.createElement("div");
				// Give the container a random id to uniquely identify it among other containers. Used when adding SVG.
				connectorListItemDiv.id = linkTypeProperties.makeid(50);
				//connectorListItemDiv.width = "100px";
				connectorListItem.appendChild(connectorListItemDiv);

				// Add the container to the list.
				listContainer.appendChild(connectorListItem);

				const svg = d3.select("#" + connectorListItemDiv.id).append('svg')
					.attr('width', connectorListItemDiv.width)
					.attr('height', "20")
					.attr("id", "svg_" + connectorListItemDiv.id);
				linkTypeProperties.createLineAndMarker(svg.attr("id"), colour, markerItem.name, 100, 20, dashItem.name);
			});
			if (selectedConnectorListItem != null) {
				selectedConnectorListItem.scrollIntoView();
			}

		});

	},

	/**
	* @param {string} defaultFillColour The colour to display as a default selection for a link without a fill colour.
	* @param {link} link The data of the link to display to the user.
	* @param {function} saveCallback Function to invoke when the user requests to save.
   */
	view: (linkType, parentLink, saveCallback, nodes, links, linkTypes, itemTypes, displayOptions, deleteCallback) => {
		delete document.getElementById("link-type-modal").dataset.internal_id;

		// Set up all the links to the HTML buttons.
		const saveButton = document.getElementById("link-type-save");
		saveButton.addEventListener("click", event => {
			if (saveCallback != null) {
				linkTypeProperties.save(saveCallback, parentLink, nodes, links, linkTypes, linkTypes);
			}
		});

		const deleteButton = document.getElementById("link-type-delete");
		deleteButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback();
			}
		});

		const colorInput = document.getElementById("link-type-border-colour");
		colorInput.addEventListener("change", event => {
			let dash = "";
			let marker = "";
			if (linkType != null) {
				marker = linkType.marker;
				dash = linkType.dash;
			}
			else {
				// get the currently selected dash and marker (if one is selected)
				const allconnectorListItems = document.querySelectorAll(".connectorListSelectedItem");
				// Should only be one connector selected...
				marker = allconnectorListItems[0].dataset.marker;
				dash = allconnectorListItems[0].dataset.dash;
			}
			linkTypeProperties.drawDashesAndMarkersSelect("connectorMarkerInput", event.currentTarget.value, dash, marker);
		});
		const cancelButton = document.getElementById("link-type-cancel");
		cancelButton.addEventListener("click", event => {
		});
		if (linkType != null) {
			document.getElementById("link-type-modal").dataset.internal_id = linkType.internal_id;
		}
		document.getElementById("link-type-identifier").value = (linkType == null) ? "" : linkType.identifier;
		document.getElementById("link-type-description").value = (linkType == null) ? "" : linkType.description;
		document.getElementById("link-type-border-colour").value = (linkType == null) ? "" : ("" + linkType.colour);

		document.getElementById("link-type-created").value = (linkType == null) ? "" : linkType.created;
		document.getElementById("link-type-updated").value = (linkType == null) ? "" : linkType.updated;

		linkTypeProperties.drawDashesAndMarkersSelect("connectorMarkerInput", (linkType == null) ? "black" : linkType.colour, (linkType == null) ? "" : linkType.dash, (linkType == null) ? "" : linkType.marker);

		//$('#link-type-identifier').focus()
		//document.getElementById("link-type-identifier").focus();
	},
	save: (saveCallback, parentNode, nodes, links, linkTypes, itemTypes) => {
		// Get all the input elements from the modal dialog.
		const linkinternal_id = document.getElementById("link-type-modal").dataset.internal_id;
		const linkIdentifierInput = document.getElementById("link-type-identifier");
		const linkDescriptionInput = document.getElementById("link-type-description");
		const linkBorderColourInput = document.getElementById("link-type-border-colour");

		const allconnectorListItems = document.querySelectorAll(".connectorListSelectedItem");
		// Should only be one connector selected...
		const marker = allconnectorListItems[0].dataset.marker;
		const dash = allconnectorListItems[0].dataset.dash;
		const saveLinkType = {
			internal_id: linkinternal_id,
			identifier: linkIdentifierInput.value,
			description: linkDescriptionInput.value,
			colour: linkBorderColourInput.value,
			marker: marker,
			dash: dash,
		};
		if (saveCallback != null) {
			saveCallback(saveLinkType, parentNode, nodes, links, linkTypes, itemTypes);
		}
	}
}
const filterProperties = {
	setup: () => {
		const modal = document.createElement("div");
		modal.setAttribute("id", "filter-modal");
		modal.setAttribute("class", "modal fade");
		modal.setAttribute("tabindex", "-1");
		modal.setAttribute("role", "dialog");
		modal.innerHTML = `  
        <!-- The Visualise Filter Modal -->
        <!-- Modal content -->
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="">Visualise Filter</h5>
                    <button id="visualiseFilterCloseButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
                    	<span aria-hidden="true">&times;</span>
                    </button>
                </div>
            <div class="modal-body">
				<div class="form-group">
					<label for="filter-identifier">Identifier</label>
					<input class="form-control" id="filter-identifier" placeholder="Enter identifier&hellip;"></input>
					<small id="filter-identifier-help" class="form-text text-muted">The label associated with this filter.</small>
				</div>
				<div class="form-group">
					<label for="filter-description">Description</label>
					<input class="form-control" id="filter-description" placeholder="Enter description&hellip;"></input>
					<small id="filter-description-help" class="form-text text-muted">The description for this filter.</small>
				</div>
				<div class="row">
					<div class="col">
						<div class="form-group">
							<label for="itemTypesList">Item types</label>
							<table class="table">
								<thead>
									<tr>
										<th scope="col">Identifier</th>
										<th scope="col">Visible</th>
										<th scope="col">Included</th>
									</tr>
								</thead>
								<tbody id="itemTypesInput"></tbody>
							</table>
						</div>
					</div>
					<div class="col">
						<div class="form-group">
							<label for="linkTypesList">Link types</label>
							<table class="table">
								<thead>
									<tr>
										<th scope="col">Identifier</th>
										<th scope="col">Visible</th>
										<th scope="col">Included</th>
										<th scope="col">Generate Heat</th>
									</tr>
								</thead>
								<tbody id="linkTypesInput"></tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="form-group">
					<label for="filter-created">Created</label>
					<input class="form-control" id="filter-created" readonly></input>
					<small id="filter-created-help" class="form-text text-muted">Date when the filter was created.</small>
				</div>
				<div class="form-group">
					<label for="filter-updated">Updated</label>
					<input class="form-control" id="filter-updated" readonly></input>
					<small id="filter-updated-help" class="form-text text-muted">Date when filter was updated.</small>
				</div>
			</div>
            <div class="modal-footer">
				<button id="delete-filter" class="btn btn-primary" data-dismiss="modal">Delete</button>
				<button id="save-filter" class="btn btn-success" data-dismiss="modal">Save</button>
				<button id="cancelFilterButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
            </div>
        </div>
		`;
		return modal;
	},

	save: (saveCallback, linkTypes, itemTypes) => {
		let valid = true;
		const connectorsVisibleFilter = linkTypes
			.filter(linkType => {
				const toggleVisible = document.getElementById("toggleLinkVisible" + linkType.internal_id);
				return toggleVisible.checked;
			})
			.map(linkType => linkType.internal_id);
		const connectorsIncludedFilter = linkTypes
			.filter(linkType => {
				const toggleVisible = document.getElementById("toggleLinkIncluded" + linkType.internal_id);
				return toggleVisible.checked;
			})
			.map(linkType => linkType.internal_id);

		const connectorsHeatFilter = linkTypes
			.filter(linkType => {
				const toggleVisible = document.getElementById("toggleLinkHeat" + linkType.internal_id);
				return toggleVisible.checked;
			})
			.map(linkType => linkType.internal_id);

		const typesVisibleFilter = itemTypes
			.filter(itemType => {
				const toggleVisible = document.getElementById("toggleItemVisible" + itemType.internal_id);
				return toggleVisible.checked;
			})
			.map(itemType => itemType.internal_id);
		const typesIncludedFilter = itemTypes
			.filter(itemType => {
				const toggleVisible = document.getElementById("toggleItemIncluded" + itemType.internal_id);
				return toggleVisible.checked;
			})
			.map(itemType => itemType.internal_id);

		const filterIdentifierInput = document.getElementById("filter-identifier");
		if (filterIdentifierInput != null) {
			filterIdentifierInput.classList.remove("is-invalid");
			if (filterIdentifierInput.value.length == 0) {
				valid = false;
				filterIdentifierInput.classList.add("is-invalid");
			}
		}
		if (valid) {
			const filterToSave = {
				internal_id: document.getElementById("filter-modal").dataset.internal_id ? document.getElementById("filter-modal").dataset.internal_id : null,
				identifier: filterIdentifierInput.value,
				description: document.getElementById("filter-description").value,
				visible: {
					connectors: connectorsVisibleFilter,
					types: typesVisibleFilter,
				},
				included: {
					connectors: connectorsIncludedFilter,
					types: typesIncludedFilter,
				},
				heat: {
					connectors: connectorsHeatFilter,
				},
			};
			if (saveCallback != null) {
				saveCallback(filterToSave);
			}
		}
	},
	view: (filter, linkTypes, itemTypes, saveCallback, deleteCallback) => {
		delete document.getElementById("filter-modal").dataset.internal_id;

		const linkTypesList = (linkTypes, linkVisiblefilter, linkIncludedFilter, linkHeatFilter) => {
			return new Promise((resolve, reject) => {
				const linkTypesHTML = linkTypes
					.sort((a, b) => a.identifier.localeCompare(b.identifier))
					.map(linkType => `
					<tr>
						<td>${linkType.identifier}</td>
						<td>
							<div class="form-group">
								<div class="custom-control custom-switch">
									<input type="checkbox" class="custom-control-input" id="toggleLinkVisible${linkType.internal_id}" name="example1">
									<label class="custom-control-label" for="toggleLinkVisible${linkType.internal_id}"></label>
								</div>
							</div>
						</td>
						<td>
							<div class="form-group">
								<div class="custom-control custom-switch">
									<input type="checkbox" class="custom-control-input" id="toggleLinkIncluded${linkType.internal_id}" name="example1">
									<label class="custom-control-label" for="toggleLinkIncluded${linkType.internal_id}"></label>
								</div>
							</div>
						</td>
						<td>
							<div class="form-group">
								<div class="custom-control custom-switch">
									<input type="checkbox" class="custom-control-input" id="toggleLinkHeat${linkType.internal_id}" name="example1">
									<label class="custom-control-label" for="toggleLinkHeat${linkType.internal_id}"></label>
								</div>
							</div>
						</td>
					</tr>
				`);
				const input = document.getElementById("linkTypesInput");
				input.innerHTML = linkTypesHTML.join("");

				linkTypes
					.sort((a, b) => a.identifier.localeCompare(b.identifier))
					.forEach(linkType => {
						if ((linkVisiblefilter != null) && (linkVisiblefilter.filter(filterLink => filterLink == linkType.internal_id).length > 0)) {
							const toggleVisible = document.getElementById("toggleLinkVisible" + linkType.internal_id);
							toggleVisible.checked = true;
						}
						if ((linkIncludedFilter != null) && (linkIncludedFilter.filter(filteritem => filteritem == linkType.internal_id).length > 0)) {
							const toggleIncluded = document.getElementById("toggleLinkIncluded" + linkType.internal_id);
							toggleIncluded.checked = true;
						}
						if ((linkHeatFilter != null) && (linkHeatFilter.filter(filteritem => filteritem == linkType.internal_id).length > 0)) {
							const toggleHeat = document.getElementById("toggleLinkHeat" + linkType.internal_id);
							toggleHeat.checked = true;
						}
					});

				resolve();
			});
		}
		const itemTypesList = (itemTypes, itemVisibleFilter, itemIncludedFilter) => {
			return new Promise((resolve, reject) => {
				const itemTypesHTML = itemTypes
					.sort((a, b) => a.identifier.localeCompare(b.identifier))
					.map(itemType => `
					<tr>
						<td>${itemType.identifier}</td>
						<td>
							<div class="form-group">
								<div class="custom-control custom-switch">
									<input type="checkbox" class="custom-control-input" id="toggleItemVisible${itemType.internal_id}" name="example1">
									<label class="custom-control-label" for="toggleItemVisible${itemType.internal_id}"></label>
								</div>
							</div>
						</td>
						<td>
							<div class="form-group">
								<div class="custom-control custom-switch">
									<input type="checkbox" class="custom-control-input" id="toggleItemIncluded${itemType.internal_id}" name="example1">
									<label class="custom-control-label" for="toggleItemIncluded${itemType.internal_id}"></label>
								</div>
							</div>
						</td>
					</tr>
				`);
				const input = document.getElementById("itemTypesInput");
				input.innerHTML = itemTypesHTML.join("");

				itemTypes
					.sort((a, b) => a.identifier.localeCompare(b.identifier))
					.forEach(itemType => {
						if ((itemVisibleFilter != null) && (itemVisibleFilter.filter(filteritem => filteritem == itemType.internal_id).length > 0)) {
							const toggleVisible = document.getElementById("toggleItemVisible" + itemType.internal_id);
							toggleVisible.checked = true;
						}
						if ((itemIncludedFilter != null) && (itemIncludedFilter.filter(filteritem => filteritem == itemType.internal_id).length > 0)) {
							const toggleIncluded = document.getElementById("toggleItemIncluded" + itemType.internal_id);
							toggleIncluded.checked = true;
						}
					});

				resolve();
			});
		};

		// Set up all the links to the HTML buttons.
		const saveFilterButton = document.getElementById("save-filter");
		saveFilterButton.addEventListener("click", event => {
			if (saveCallback != null) {
				filterProperties.save(saveCallback, linkTypes, itemTypes);
			}
		});

		const deleteFilterButton = document.getElementById("delete-filter");
		deleteFilterButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback();
			}
		});

		let connectorsVisibleFilter = null;
		let connectorsIncludedFilter = null;
		let connectorsHeatFilter = null;

		let typesVisibleFilter = null;
		let typesIncludedFilter = null;


		if (filter != null) {
			document.getElementById("filter-modal").dataset.internal_id = filter.internal_id;

			connectorsVisibleFilter = (filter && filter.visible == null) ? null : filter.visible.connectors;
			connectorsIncludedFilter = (filter && filter.included == null) ? null : filter.included.connectors;
			connectorsHeatFilter = (filter && filter.heat == null) ? null : filter.heat.connectors;

			typesVisibleFilter = (filter && filter.visible == null) ? null : filter.visible.types;
			typesIncludedFilter = (filter && filter.included == null) ? null : filter.included.types;
		}
		linkTypesList(linkTypes, connectorsVisibleFilter, connectorsIncludedFilter, connectorsHeatFilter);
		itemTypesList(itemTypes, typesVisibleFilter, typesIncludedFilter);

		document.getElementById("filter-identifier").value = (filter == null) ? "" : filter.identifier;
		document.getElementById("filter-description").value = (filter == null) ? "" : filter.description;

		document.getElementById("filter-created").value = (filter == null) ? "" : filter.created;
		document.getElementById("filter-updated").value = (filter == null) ? "" : filter.updated;
	}
}