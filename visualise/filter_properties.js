"use strict";

const setupFilterModal = () => {
	const modal = document.createElement("div");
	modal.setAttribute("id", "filterModal");
	modal.setAttribute("class", "modal fade");
	modal.setAttribute("tabindex", "-1");
	modal.setAttribute("role", "dialog");
	modal.innerHTML = `  
        <!-- The Visualise Filter Modal -->
        <!-- Modal content -->
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="">Visualise Filter</h5>
                    <button id="visualiseFilterCloseButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label for="itemTypesList">Item types</label>
                            <select id="itemTypesList" multiple="" class="form-control tallList"></select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label for="linkTypesList">Connector types</label>
                            <select id="linkTypesList" multiple="" class="form-control tallList"></select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="saveFilterButton" class="btn btn-primary" data-dismiss="modal">OK</button>
                <button id="cancelFilterButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
            </div>
        </div>
		`;
	return modal;
}

const saveFilter = saveCallback => {
	var filterToSave = null;
	var typesList = document.getElementById("itemTypesList");
	var connectorsList = document.getElementById("linkTypesList");

	var typesFilterItems = [...typesList.options].filter(option => option.selected);
	var typesFilter = typesFilterItems.map(filterItem => filterItem.value);

	var connectorsFilterItems = [...connectorsList.options].filter(option => option.selected);
	var connectorsFilter = connectorsFilterItems.map(filterItem => filterItem.value);

	filterToSave = {
		connectors: connectorsFilter,
		types: typesFilter,
	};
	if (saveCallback != null) {
		saveCallback(filterToSave);
	}
}
const viewFilter = (simulation, nodes, links, linkTypes, itemTypes, displayOptions, saveCallback) => {
	const linkTypesList = (linkTypes, linkfilter) => {
		return new Promise((resolve, reject) => {
			const input = document.getElementById("linkTypesList");
			const optionsArray = linkTypes
				.sort((a, b) => a.identifier.localeCompare(b.identifier))
				.map(linkType => {
					let selected = "";
					if((linkfilter != null) && (linkfilter.filter(filterLink => filterLink == linkType.internal_id).length > 0)) {
						selected = "selected";
					}
					return `<option value="${linkType.internal_id}" ${selected}>${linkType.identifier}</option>`
				});

			input.innerHTML = optionsArray.join("");
			resolve();
		});
	}
	const itemTypesList = (itemTypes, itemfilter) => {
		return new Promise((resolve, reject) => {
			const input = document.getElementById("itemTypesList");
			const optionsArray = itemTypes
				.sort((a, b) => a.identifier.localeCompare(b.identifier))
				.map(itemType => {
					let selected = "";
					if((itemfilter != null) && (itemfilter.filter(filterItem => filterItem == itemType.internal_id).length > 0)) {
						selected = "selected";
					}
					return `<option value="${itemType.internal_id}" ${selected}>${itemType.identifier}</option>`
				});

			input.innerHTML = optionsArray.join("");
			resolve();
		});
	}

	// Set up all the links to the HTML buttons.
	const saveFilterButton = document.getElementById("saveFilterButton");
	console.assert(saveFilterButton != null, "Cannot find saveFilterButton");
	saveFilterButton.addEventListener("click", event => {
		saveFilter(saveCallback);
	});
	
	const connectorsFilter = (displayOptions.visible == null)? null : displayOptions.visible.connectors;
	const typesFilter = (displayOptions.visible == null)? null : displayOptions.visible.types;
	linkTypesList(linkTypes, connectorsFilter);
	itemTypesList(itemTypes, typesFilter);

}
