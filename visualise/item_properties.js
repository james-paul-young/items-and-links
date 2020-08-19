"use strict"
const setupItemPropertiesModal = () => {
	const modal = document.createElement("div");
	modal.setAttribute("id", "itemModal");
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
								<select class="form-control" id="itemTypeInput" placeholder=""></select>
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
						<button id="saveItemButton" class="btn btn-primary" data-dismiss="modal">Save</button>
						<button id="cancelItemButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
					</div>
				</div>
			</div>
		</div>
	`;
	return modal;

}
/**
 * @param {string} defaultFillColour The colour to display as a default selection for a item without a fill colour.
 * @param {item} item The data of the item to display to the user.
 * @param {function} saveCallback Function to invoke when the user requests to save.
*/
const viewItem = (item, parentItem, saveCallback, nodes, links, linkTypes, itemTypes, displayOptions) => {

	delete document.getElementById("itemModal").dataset.internal_id;

	// Set up all the links to the HTML buttons.
	const saveItemButton = document.getElementById("saveItemButton");
	console.assert(saveItemButton != null, "Cannot find saveItemButton");
	saveItemButton.addEventListener("click", event => {
		if (saveCallback != null) {

			saveItem(saveCallback, parentItem, nodes, links, linkTypes, itemTypes);
		}
	});
	const cancelItemButton = document.getElementById("cancelItemButton");
	console.assert(cancelItemButton != null, "Cannot find cancelItemButton");
	cancelItemButton.addEventListener("click", event => {
		// if (saveCallback != null) {
		// 	saveItem(saveCallback, parentItem, nodes, links, linkTypes, itemTypes);
		// }
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
		document.getElementById("itemModal").dataset.internal_id = item.internal_id;
	}
	document.getElementById("itemIdentifierInput").value = (item == null) ? "" : item.identifier;
	document.getElementById("itemDescriptionInput").value = (item == null) ? "" : item.description;
	document.getElementById("itemTypeInput").value = (item == null) ? "" : item.type.internal_id;
	let itemColour = "";
	let itemBackgroundColour = "";
	if (item && item.type) {
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
			.style("fill", d => (d.background_colour ? d.background_colour : d.type.background_colour))
	
		const listDescriptors = itemCells
			.append("div")
			.style("min-height", "50px")
			.text(d => d.description);
		}


}

const saveItem = (saveCallback, parentNode, nodes, links, linkTypes, itemTypes) => {
	// Get all the input elements from the modal dialog.
	const iteminternal_id = document.getElementById("itemModal").dataset.internal_id;
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