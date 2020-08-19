const common = new function () {
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
	}
	const makeid = (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	const setupLinkTypeList = (linkTypes, selected) => {
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
	}
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

	const createLineAndMarker = (svg, width, height, dashType) => {
		const svgWidth = width;
		const svgHeight = height;
		const strokeWidth = 2;

		const defs = d3.select("#defs");

		const lineGroup = svg.append('g')
			.attr('id', 'marker')
			.attr('transform', 'translate(' + 0 + ',' + 0 + ')');

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
				common.createMarkerEnd("selector", this.dashesAndEnds, d.dash.name, d.colour, 5, 5, 0, 0);
			})

	}
	this.drawDashesAndMarkersSelect = (inputId, linkTypes, selected, multiselect) => {
		let selectedLinkListItem = null;
		const listContainer = document.getElementById(inputId)
		// Clear out any content in the list before adding all the links.
		listContainer.innerHTML = "";

		linkTypes.forEach(linkType => {
			// Create the list item for containing the new link.
			const linkListItem = document.createElement("li");
			linkListItem.setAttribute("class", "d-flex justify-content-between align-items-center linkListItem");
			linkListItem.dataset.marker = linkType.marker;
			linkListItem.dataset.dash = linkType.dash;
			linkListItem.addEventListener("click", (event) => {
				const alllinkListItems = document.querySelectorAll(".linkListItem");
				if (!multiselect) {
					// Clear the selection indicators of all other candidate lines.
					[...alllinkListItems].forEach(linkListItem => {
						linkListItem.classList.remove("linksInputSelected");
					});
				}
				// Set the selection indicator for the current candidate line.
				event.currentTarget.classList.add("linksInputSelected");
			});
			// Create the container for the candidate line
			const linkListItemDiv = document.createElement("div");
			// Give the container a random id to uniquely identify it among other containers. Used when adding SVG.
			linkListItemDiv.id = makeid(50);
			linkListItemDiv.width = "100px";
			linkListItem.appendChild(linkListItemDiv);

			// Add the container to the list.
			listContainer.appendChild(linkListItem);

			// Add the svg for draing the line and end.
			const svg = d3.select("#" + linkListItemDiv.id).append('svg')
				.attr('width', "100")
				.attr('height', "20")
				.attr("id", "svg_" + linkListItemDiv.id);
			//const marker = data.find((datum) => datum.name == markerItem.name);
			// const candidateLineMarker = JSON.parse(JSON.stringify(markerItem));
			// candidateLineMarker.internal_id = linkType.internal_id;
			// candidateLineMarker.colour = linkType.colour;
			// candidateLineMarker.width = 5;
			// candidateLineMarker.height = 5;
			this.createLineAndMarker(svg, 100, 20, linkType.dash);
		});
		// 	console.assert(inputId != "", "No input Id to identify \"list\" element.");

		// 	// Loop through the dashes and markers to create a candidate line for a link.
		// 	dashesAndEnds.dash.forEach(dashItem => {
		// 		dashesAndEnds.end.forEach(markerItem => {
		// 			// Create the list item for containing the candidate line.
		// 			const linkListItem = document.createElement("li");
		// 			linkListItem.setAttribute("class", "d-flex justify-content-between align-items-center linkListItem");
		// 			// // Set the id so the svg can be added to this element below.
		// 			// linkListItem.id = "link-" + markerItem.name + "-" + dashItem.name;
		// 			linkListItem.dataset.marker = markerItem.name;
		// 			linkListItem.dataset.dash = dashItem.name;
		// 			// See if the current candidate line should be marked as "selected" based on parameters passed to this function.
		// 			// if ((dashItem.name == dashName) && (markerItem.name == markerName)) {
		// 			// 	selectedLinkListItem = linkListItem;
		// 			// 	linkListItem.classList.add("linksInputSelected");
		// 			// }
		// 			// Add a "click" listener to handle the current item being "selected" as the candidate line.
		// 			linkListItem.addEventListener("click", (event) => {
		// 				const alllinkListItems = document.querySelectorAll(".linkListItem");
		// 				// Clear the selection indicators of all other candidate lines.
		// 				[...alllinkListItems].forEach(linkListItem => {
		// 					linkListItem.classList.remove("linksInputSelected");
		// 				});
		// 				// Set the selection indicator for the current candidate line.
		// 				event.currentTarget.classList.toggle("linksInputSelected");
		// 			});
		// 			// Create the container for the candidate line
		// 			const linkListItemDiv = document.createElement("div");
		// 			// Give the container a random id to uniquely identify it among other containers. Used when adding SVG.
		// 			linkListItemDiv.id = common.makeid(50);
		// 			linkListItemDiv.width = "100px";
		// 			linkListItem.appendChild(linkListItemDiv);

		// 			// Add the container to the list.
		// 			listContainer.appendChild(linkListItem);

		// 			const svg = d3.select("#" + linkListItemDiv.id).append('svg')
		// 				.attr('width', "100")
		// 				.attr('height', "20")
		// 				.attr("id", "svg_" + linkListItemDiv.id);
		// 			//const marker = data.find((datum) => datum.name == markerItem.name);
		// 			const candidateLineMarker = JSON.parse(JSON.stringify(markerItem));
		// 			candidateLineMarker.internal_id = common.makeid(50);
		// 			candidateLineMarker.colour = colour;
		// 			candidateLineMarker.width = 5;
		// 			candidateLineMarker.height = 5;
		// 			common.createLineAndMarker(svg, 100, 20, candidateLineMarker, dashItem, dashesAndEnds);
		// 		});
		// 		if (selectedLinkListItem != null) {
		// 			selectedLinkListItem.scrollIntoView();
		// 		}

		// 	});

		// },
	};
}