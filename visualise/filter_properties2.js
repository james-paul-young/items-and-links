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
        <div class="modal-dialog modal-xl" role="document">
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
							<label for="definedFiltersList">Defined Filters</label>
							<table class="table">
								<thead>
									<tr>
										<th scope="col">Name</th>
										<th scope="col">Action</th>
									</tr>
								</thead>
								<tbody id="definedFiltersList"></tbody>
							</table>
						</div>
					</div>
					<div class="row">
						<div class="col">
							<div class="row">
								<div class="col">
									<div class="form-group">
										<label for="filterIdentifierInput">Identifier</label>
										<input class="form-control" id="filterIdentifierInput" placeholder="Enter identifier&hellip;"></input>
										<small id="filterIdentifierHelp" class="form-text text-muted">The label associated with this filter.</small>
									</div>
								</div>
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
										<label for="linkTypesList">Connector types</label>
										<table class="table">
											<thead>
												<tr>
													<th scope="col">Identifier</th>
													<th scope="col">Visible</th>
													<th scope="col">Included</th>
												</tr>
											</thead>
											<tbody id="linkTypesInput"></tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
                </div>
            </div>
            <div class="modal-footer">
				<button id="saveFilterButton" class="btn btn-success">Save Filter</button>
				<button id="selectFilterButton" class="btn btn-primary" data-dismiss="modal">Select Filter</button>
                <button id="cancelFilterButton" class="btn btn-danger" data-dismiss="modal">Close</button>
            </div>
        </div>
		`;
	return modal;
}

const saveFilter = (saveCallback, linkTypes, itemTypes) => {
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

	const filterIdentifierInput = document.getElementById("filterIdentifierInput");
	if (filterIdentifierInput != null) {
		filterIdentifierInput.classList.remove("is-invalid");
		if (filterIdentifierInput.value.length == 0) {
			valid = false;
			filterIdentifierInput.classList.add("is-invalid");
		}
	}
	if (valid) {
		const filterToSave = {
			identifier: filterIdentifierInput.value,
			visible: {
				connectors: connectorsVisibleFilter,
				types: typesVisibleFilter,
			},
			included: {
				connectors: connectorsIncludedFilter,
				types: typesIncludedFilter,
			},
		};
		if (saveCallback != null) {
			saveCallback(filterToSave);
		}

	}
}
const useFilter = (useCallback, linkTypes, itemTypes) => {
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

	const filterToSave = {
		visible: {
			connectors: connectorsVisibleFilter,
			types: typesVisibleFilter,
		},
		included: {
			connectors: connectorsIncludedFilter,
			types: typesIncludedFilter,
		},
	};
	if (useCallback != null) {
		useCallback(filterToSave);
	}
}
const viewFilter = (simulation, nodes, links, linkTypes, itemTypes, displayOptions, saveCallback, filters, useCallback) => {
	const definedFilters = (displayOptions) => {
		if (filters != null) {
			// new Promise((resolve, reject) => {
			const definedFiltersHTML = filters
				.sort((a, b) => a.identifier.localeCompare(b.identifier))
				.map(filter => `
					<tr>
						<td>${filter.identifier}</td>
						<td>
							<button id="useFilterButton${filter.internal_id}" class="btn btn-info">View</button>
							<button id="deleteFilterButton${filter.internal_id}" class="btn btn-danger">Delete</button>
						</td>
				`);
			const definedFiltersList = document.getElementById("definedFiltersList");
			definedFiltersList.innerHTML = definedFiltersHTML.join("");
			// 	resolve();
			// }).then(result => {
			filters.forEach(filter => {
				const filterDeleteButton = document.getElementById(`deleteFilterButton${filter.internal_id}`);
				filterDeleteButton.addEventListener("click", event => {
					filterDB.deleteFilterFromDB(filter.internal_id);
					alert("Filter deleted.");
				});
				const useFilterButton = document.getElementById(`useFilterButton${filter.internal_id}`);
				useFilterButton.addEventListener("click", event => {
					const selectedFilter = filters.find(item => item.internal_id == filter.internal_id);
					linkTypesList(linkTypes, selectedFilter.visible.connectors, selectedFilter.included.connectors);
					itemTypesList(itemTypes, selectedFilter.visible.types, selectedFilter.included.types);
				});
			})

			// })
		}
	};
	const linkTypesList = (linkTypes, linkVisiblefilter, linkIncludedFilter) => {
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
				});

			resolve();
		});
	};
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
	const saveFilterButton = document.getElementById("saveFilterButton");
	console.assert(saveFilterButton != null, "Cannot find saveFilterButton");
	saveFilterButton.addEventListener("click", event => {
		saveFilter(saveCallback, linkTypes, itemTypes);
	});

	const selectFilterButton = document.getElementById("selectFilterButton");
	console.assert(selectFilterButton != null, "Cannot find selectFilterButton");
	selectFilterButton.addEventListener("click", event => {
		useFilter(useCallback, linkTypes, itemTypes);
	});

	const connectorsVisibleFilter = (displayOptions.visible == null) ? null : displayOptions.visible.connectors;
	const connectorsIncludedFilter = (displayOptions.included == null) ? null : displayOptions.included.connectors;
	const typesVisibleFilter = (displayOptions.visible == null) ? null : displayOptions.visible.types;
	const typesIncludedFilter = (displayOptions.included == null) ? null : displayOptions.included.types;

	definedFilters(displayOptions);
	linkTypesList(linkTypes, connectorsVisibleFilter, connectorsIncludedFilter);
	itemTypesList(itemTypes, typesVisibleFilter, typesIncludedFilter);
}