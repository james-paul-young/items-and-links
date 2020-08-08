"use strict";
const setupLinkPropertiesModal = () => {
	const modal = document.createElement("div");
	modal.setAttribute("id", "linkModal");
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
						<label for="linkIdentifierInput">Identifier</label>
						<input class="form-control" id="linkIdentifierInput" placeholder="Enter identifier"></input>
						<small id="linkIdentifierHelp" class="form-text text-muted">Text displayed on visual
						representations.</small>
		
						<label for="linkDescriptionInput">Description</label>
						<textarea id="linkDescriptionInput" class="form-control " placeholder="Enter description"
						rows="3"></textarea>
		
						<label for="linkSourceInput">Source</label>
						<select class="form-control" id="linkSourceInput" placeholder="Source"></select>
						<small id="linkSourceHelp" class="form-text text-muted">The beginning of the
						link.</small>
		
						<label for="linkTypeInput">Link</label>
						<ul id="linkTypeInput" class="list-group linksInput">
						</ul>

						<label for="linkTargetInput">Target</label>
						<select class="form-control" id="linkTargetInput" placeholder="Target"></select>
						<small id="linkTargetHelp" class="form-text text-muted">The end of the link.</small>
		
						<label for="linkCreatedInput">Created</label>
						<input class="form-control" id="linkCreatedInput" placeholder="" readonly=""></input>
						<small id="linkCreatedHelp" class="form-text text-muted">The date and time the link was created.</small>

						<label for="linkUpdatedInput">Updated</label>
						<input class="form-control" id="linkUpdatedInput" placeholder="" readonly=""></input>
						<small id="linkUpdatedHelp" class="form-text text-muted">The date and time the link was updated.</small>
		
						<div class="modal-footer">
						<button id="flipLinkButton" class="btn btn-primary">Source <--> Target</button>
						<button id="deleteLinkButton" class="btn btn-warning" data-dismiss="modal">Delete</button>
						<button id="saveLinkButton" class="btn btn-primary" data-dismiss="modal">Save</button>
						<button id="cancelLinkButton" class="btn btn-danger" data-dismiss="modal">Cancel</button>
						</div>
					</fieldset>
				</div>
			</div>
		</div>
	</div>
	`
	return modal;
}
const dashesAndEnds = {
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
};

const createMarkerEnd = (idPrefix, dashesAndEnds, end_name, colour, width, height, refX, refY) => {
	const defs = d3.select("#defs");
	if (document.getElementById(idPrefix + colour.substring(1) + end_name) == null) {
		const end = dashesAndEnds.end.find(currentEnd => currentEnd.name == end_name)
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
}

const createLineAndMarker = (svg, width, height, markerData, dashType) => {
	const svgWidth = width;
	const svgHeight = height;
	const strokeWidth = 2;

	const defs = d3.select("#defs");

	const lineGroup = svg.append('g')
		.attr('id', 'marker')
		.attr('transform', 'translate(' + 0 + ',' + 0 + ')');

	//createMarkerEnd("linkProperties", dashesAndEnds,markerData,  "", 0, 0);
	const path = lineGroup.selectAll('line')
		.data([dashesAndEnds.end])
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
			createMarkerEnd("selector", dashesAndEnds, d.dash.name, d.colour, 5, 5, 0, 0);
		})

}

const drawDashesAndMarkersSelect = (inputId, colour, dashName, markerName) => {
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

}

/**
* @param {Link} link The data of the item to display to the user.
* @param {function} saveCallback Function to invoke when the user requests to save.
*/
const viewLink = (link, links, linkTypes, items, itemTypes, saveCallback, deleteCallback) => {

	delete document.getElementById("linkModal").dataset.internal_id;

	const flipLinkButton = document.getElementById("flipLinkButton");
	console.assert(flipLinkButton != null, "Cannot find flipLinkButton");
	flipLinkButton.addEventListener("click", event => {
		const sourceValue = document.getElementById("linkSourceInput").value;
		const targetValue = document.getElementById("linkTargetInput").value;

		document.getElementById("linkSourceInput").value = targetValue;
		document.getElementById("linkTargetInput").value = sourceValue;
	});

	// Set up all the links to the HTML buttons.
		const deleteLinkButton = document.getElementById("deleteLinkButton");
		console.assert(deleteLinkButton != null, "Cannot find deleteLinkButton");
		deleteLinkButton.addEventListener("click", event => {
			if (deleteCallback != null) {
				deleteCallback(link, links, linkTypes, items, itemTypes);
			}
		});

		const saveLinkButton = document.getElementById("saveLinkButton");
		console.assert(saveLinkButton != null, "Cannot find saveLinkButton");
		saveLinkButton.addEventListener("click", event => {
			if (saveCallback != null) {
				saveLink(saveCallback, null, items, links, linkTypes, itemTypes);
			}
		});
	
		const sourceInput = document.getElementById("linkSourceInput");
	const targetInput = document.getElementById("linkTargetInput");
	targetInput.innerHTML = "";
	sourceInput.innerHTML = "";
	sourceInput.value = "";
	targetInput.value = "";
	const blankOption = document.createElement("option");
	sourceInput.appendChild(blankOption);

	// const projectOption = document.createElement("option");
	// projectOption.innerHTML = "<strong>" + activeProject.identifier + " (Project)</strong>";
	// projectOption.value = activeProject.internal_id;
	// sourceInput.appendChild(projectOption);

	targetInput.appendChild(blankOption.cloneNode());
	items.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier));
	// d3.select("#linkSourceInput")
	// 	.data(items)
	// 	.join("option")
	// 	.attr("value", d => d.internal_id)
	// 	.text(d => `${d.identifier} <strong>${d.type.identifier}</strong>`)

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

	document.getElementById("linkSourceInput").value = (link.source == null) ? "" : link.source.internal_id;
	document.getElementById("linkTargetInput").value = (link.target == null) ? "" : link.target.internal_id;
	document.getElementById("linkIdentifierInput").value = (link.identifier == null) ? "" : link.identifier;
	document.getElementById("linkDescriptionInput").value = (link.description == null) ? "" : link.description;
	if (link.internal_id != null) {
		document.getElementById("linkModal").dataset.internal_id = link.internal_id;
	}
	document.getElementById("linkCreatedInput").value = (link.created == null) ? "" : link.created;
	document.getElementById("linkUpdatedInput").value = (link.updated == null) ? "" : link.updated;

	const linkList = document.getElementById("linkTypeInput");
	linkList.setAttribute("class", "linkTypeList")
	linkList.innerHTML = "";

	const linkTypeList = d3.select("#linkTypeInput")
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
		.on("mouseover", function() {
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
			const end = dashesAndEnds.end.find(end => end.name == d.marker);
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

	if (link.connector != null) {
		const selectedLink = document.getElementById("availableLinkType" + link.connector.internal_id);
		if (selectedLink != null) {
			selectedLink.classList.toggle("connectorListSelectedItem");
		}
	}
}
const saveLink = (saveCallback, parent, items, links, linkTypes, itemTypes) => {
	// Get all the input elements from the modal dialog.
	const linkInternal_id = document.getElementById("linkModal").dataset.internal_id == null ? null : document.getElementById("linkModal").dataset.internal_id;
	const linkIdentifierInput = document.getElementById("linkIdentifierInput");
	const linkDescriptionInput = document.getElementById("linkDescriptionInput");
	const linkSourceInput = document.getElementById("linkSourceInput");
	const linkTargetInput = document.getElementById("linkTargetInput");
	const linkListSelectedItem = document.querySelectorAll(".connectorListSelectedItem");
	let selectedConnector = null;
	if ((linkListSelectedItem != null) && (linkListSelectedItem.length > 0)) {
		selectedConnector = linkListSelectedItem[0].dataset.internalId;
	}
	const linkToSave = {
		internal_id: linkInternal_id,
		identifier: linkIdentifierInput.value,
		description: linkDescriptionInput.value,
		source: items.find(item => item.internal_id == linkSourceInput.value),
		target: items.find(item => item.internal_id == linkTargetInput.value),
		connector: linkTypes.find(connector => connector.internal_id == selectedConnector),
	}
	if (saveCallback != null) {
		saveCallback(linkToSave, links, linkTypes, items, itemTypes);
	}
}

