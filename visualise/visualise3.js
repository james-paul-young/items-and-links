(async () => {
	const loadConnectors = projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["connector"], 'readonly');
				var objectStore = loadTransaction.objectStore("connector");

				var loadRequest = objectStore.getAll();
				loadRequest.onsuccess = (event) => {
					resolve(event.target.result.filter(item => item.project_id == projectId));
				};
				loadRequest.onerror = (event) => {
					console.log("Error in loading.");
					reject();
				}
				loadRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				alert("Database error: " + JSON.stringify(event));
				reject();
			};
		});
	}
	const loadItemTypes = projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["type"], 'readonly');
				var objectStore = loadTransaction.objectStore("type");

				var loadRequest = objectStore.getAll();
				loadRequest.onsuccess = (event) => {
					resolve(event.target.result.filter(item => item.project_id == projectId));
				};
				loadRequest.onerror = (event) => {
					console.log("Error in loading.");
					reject();
				}
				loadRequest.oncomplete = (event) => {
					db.close();
				}
			}
			openDBRequest.onerror = (event) => {
				alert("Database error: " + JSON.stringify(event));
				reject();
			};
		});
	}

	const drag = simulation => {

		function dragstarted(d) {
			if (!d3.event.active && !currentNodeWithContextMenu) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}

		return d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended);
	}
	let deltaX = 0;
	let deltaY = 0;
	const dragHandler = d3.drag()
		.on("drag", function (d) {
			console.log(`dragging (${deltaX}, ${deltaY})`)
			d3.select(this)
				.attr("transform", "translate(" + (d3.event.x + deltaX) + ", " + (d3.event.y + deltaY) + ")");
		})
		.on("start", function () {
			let current = d3.select(this);
			//deltaX = current.attr("x") - d3.event.x;
			//deltaY = current.attr("y") - d3.event.y;
		})

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
	const connectors = await loadConnectors("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const rawlinks = await linksDB.loadConnections("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const rawNodes = await itemsDB.loadItems("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const nodeTypes = await loadItemTypes("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");

	const displayOptions = {
		showLinks: true,
		showLinkLabels: false,
		showNodes: true,
		showNodeLabels: true,
		nodeRadius: 30,
	}

	let currentNodeWithContextMenu = null;
	let nodeContextMenu = null;

	const nodes = rawNodes.map(node => {
		const type_id = node.type;
		node.type = nodeTypes.find(type => type.internal_id == type_id);
		return node;
	})

	const sortAndOrderLinks = (unsortedLinks) => {
		const nonOrphanedLinks = unsortedLinks.filter(link => (link.source != null) && (link.target != null)).map(link => { link.set = null; return link; });
		// Count the number of links in the set of links between each node.
		nonOrphanedLinks.forEach(firstlink => {
			nonOrphanedLinks.forEach(secondlink => {
				if (firstlink.set == null) { firstlink.set = 1; }
				if (secondlink.set == null) { secondlink.set = 1; }
				if (firstlink != secondlink) {
					// A new connection just has the source and target as the thing IDs. Existing ones have a D3 structure. 
					// Need to still be able to compare ids though
					// let firstlinkSource = (typeof (firstlink.source) == "string") ? firstlink.source : firstlink.source.internal_id;
					// let firstlinkTarget = (typeof (firstlink.target) == "string") ? firstlink.target : firstlink.target.internal_id;
					// let secondlinkSource = (typeof (secondlink.source) == "string") ? secondlink.source : secondlink.source.internal_id;
					// let secondlinkTarget = (typeof (secondlink.target) == "string") ? secondlink.target : secondlink.target.internal_id;
					let firstlinkSource = firstlink.source.internal_id;
					let firstlinkTarget = firstlink.target.internal_id;
					let secondlinkSource = secondlink.source.internal_id;
					let secondlinkTarget = secondlink.target.internal_id;

					if (((firstlinkSource == secondlinkSource) && (firstlinkTarget == secondlinkTarget)) || (
						(firstlinkSource == secondlinkTarget) && (firstlinkTarget == secondlinkSource))) {
						console.log("Incrementing set")
						firstlink.set++;
						secondlink.set++;
					}
				}
			});
		});
		nonOrphanedLinks.sort(function (a, b) {
			if (a.source > b.source) { return 1; }
			else if (a.source < b.source) { return -1; }
			else {
				if (a.target > b.target) { return 1; }
				if (a.target < b.target) { return -1; }
				else { return 0; }
			}
		});
		//any links with duplicate source and target get an incremented 'linknum'
		for (var i = 0; i < nonOrphanedLinks.length; i++) {
			let link = nonOrphanedLinks[i];
			let previousLink = nonOrphanedLinks[i - 1]
			link.arcDirection = 1;
			if (i != 0 && link.source == previousLink.source && link.target == previousLink.target) {
				link.linknum = previousLink.linknum + 1;
				link.arcDirection = (i % 2) == 0 ? 1 : 0;
			}
			else { link.linknum = 1; };
		};

		return nonOrphanedLinks;
	};

	const unsortedLinks = rawlinks.map(connection => {
		const source_id = connection.source;
		connection.source = nodes.find(item => item.internal_id == source_id);
		const target_id = connection.target;
		connection.target = nodes.find(item => item.internal_id == target_id);
		connection.connector = connectors.find(connector => connector.internal_id == connection.connector);
		return connection;
	});
	//	const links = sortAndOrderLinks(unsortedLinks);

	const makeid = (length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	const addLink = (links, source, target) => {
		return new Promise((resolve, reject) => {
			linksDB.saveLinkToDB({ source: source, target: target, project_id: "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY" }).then(savedLink => {
				links.push(savedLink);
				resolve(savedLink);
			})
		});
	}
	const saveNewLink = (linkToSave, links, linkTypes, items, itemTypes) => {

		if (linkToSave.internal_id && (linkToSave.internal_id != "")) {
			const linkInCollection = links.find(link => link.internal_id == linkToSave.internal_id)
			linkInCollection.identifier = linkToSave.identifier;
			linkInCollection.description = linkToSave.description;
			linkInCollection.target = linkToSave.target;
			linkInCollection.source = linkToSave.source;
			linkInCollection.connector = linkToSave.connector;
			linksDB.saveLinkToDB(linkInCollection).then(() => {
				simulation
					.nodes(nodes)
					.force("link", d3.forceLink(links).id(d => d.id))
				update(simulation, items, links, linkTypes, itemTypes, displayOptions);
				simulation.alpha(0.01).restart();
			})
		}
		console.log(linkToSave);
	}
	const deleteLink = async (link, links, linkTypes, items, itemTypes) => {
		const linkIndex = links.indexOf(link);
		if (linkIndex > -1) {
			links.splice(linkIndex, 1);
		}
		linksDB.deleteLinkFromDB(link.internal_id).then(result => {
			simulation
				.nodes(nodes)
				.force("link", d3.forceLink(links).id(d => d.id))
			update(simulation, nodes, links, linkTypes, itemTypes, displayOptions);
			simulation.alpha(0.01).restart();

		});
	}

	let itemPropertiesModal = null;
	let linkPropertiesModal = null;

	/**
	 * Adds the node and link to the force simulation, hides the context menu and adds a small amount of reheating to the layout.
	 * @param {d3.forceSimulation} simulation The force simulation
	 * @param {Array} nodes The nodes drawn on the force simulation
	 * @param {Array} links The links between nodes drawn on the force simulation
	 * @param {object} source The d3 node from which the new node will be linked to.
	 * @param {object} link The d3 link between the source node and the new node.
	 * @param {object} node The node to add.
	 */
	const addItem = async (node, parentNode, nodes, links, linkTypes, itemTypes) => {
		if (node != null) {
			const newNode = { x: parentNode.x + 15, y: parentNode.y + 15, ...node }
			newNode.project_id = "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY";
			// // Temporary until SaveItem function added here.
			// const newInternal_id = makeid(20);
			// newNode.internal_id = newInternal_id;
			// Add created/updated dates.
			const savedNode = await itemsDB.saveItemToDB(newNode);
			nodes.push(savedNode);

			linksDB.saveLinkToDB({ source: parentNode, target: savedNode, project_id: "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY" }).then(result => {
				links.push(result);
				simulation
					.nodes(nodes)
					.force("link", d3.forceLink(links).id(d => d.id))
				update(simulation, nodes, links, linkTypes, itemTypes, displayOptions);
				simulation.alpha(0.01).restart();

			});
		}
		else {
			console.log("Not adding...")
		}
	}

	const deleteItem = (node, parentNode, nodes, links, linkTypes, itemTypes) => {
		nodeContextMenu.style("visibility", "hidden")
		currentNodeWithContextMenu = null;
		const nodeIndex = nodes.indexOf(node);
		if (nodeIndex > -1) {
			nodes.splice(nodeIndex, 1);
		}
		// Find all links to/from this node.
		const linksToNode = links.filter(link => (link.source.internal_id == node.internal_id) || (link.target.internal_id == node.internal_id));
		// Remove those links from the general simulation links.
		linksToNode.forEach(async linkToNode => {
			const linkToNodeIndex = links.indexOf(linkToNode);
			if (linkToNodeIndex > -1) {
				links.splice(linkToNodeIndex, 1);
			}
			await linksDB.deleteLinkFromDB(linkToNode.internal_id);
		});
		deleteItemFromDB(node.internal_id).then(result => {
			simulation
				.nodes(nodes)
				.force("link", d3.forceLink(links).id(d => d.id))
			update(simulation, nodes, links, linkTypes, itemTypes, displayOptions);
			simulation.alpha(0.01).restart();
		});
	}
	const saveItem = async (node, parentNode, nodes, links, linkTypes, itemTypes) => {
		console.log("removing dialogue")
		document.body.removeChild(document.getElementById("itemModal"));
		if (node != null) {
			const existingNode = nodes.find(n => n.internal_id == node.internal_id);
			console.assert(existingNode != null, "Cannot find node in existing nodes.")
			existingNode.identifier = node.identifier;
			existingNode.description = node.description;
			existingNode.colour = node.colour;
			existingNode.custom_image = node.custom_image;
			existingNode.fill_colour = node.fill_colour;
			existingNode.type = node.type;
			console.log("Saving...");
			itemsDB.saveItemToDB(existingNode).then(result => {
				simulation
					.nodes(nodes)
					.force("link", d3.forceLink(links).id(d => d.id))
				update(simulation, nodes, links, linkTypes, itemTypes, displayOptions);
				simulation.alpha(0.01).restart();
			});
		}
		else {
			console.log("Not saving...")
		}
	}
	// Context menu for a node.
	const createNodeContextMenu = (simulation, nodes, links, linkTypes, itemTypes, displayOptions) => {
		const data = [
			{
				value: 1,
				action: "Properties",
				icon: "f05a",
			},
			{
				value: 1,
				action: "Delete",
				icon: "f1f8",
			},
			{
				value: 1,
				action: "Link",
				icon: "f0c1",
			},
			{
				value: 1,
				action: "Add",
				icon: "f067",
			},
		];
		const pie = d3.pie()
			.value(d => d.value.value)
		const data_ready = pie(d3.entries(data))

		// Node is expanded to twice it's size when user hovers mouse over it. Need to account for this when drawing context menu.
		const expandedNodeRadius = displayOptions.nodeRadius * 2;
		const arc1 = d3.arc()
			.innerRadius(0)
			.outerRadius(expandedNodeRadius + 30)
			.cornerRadius(1);

		const arc2 = d3.arc()
			.innerRadius(expandedNodeRadius + 5)
			.outerRadius(expandedNodeRadius + 25)
			.cornerRadius(1);
		const svg = d3.select("#drawingArea");

		const nodeContextMenu = svg.append("g")
			.attr("id", "nodeContextMenu")
			.attr("class", "nodeContextMenu")
			.style("visibility", "hidden")

		nodeContextMenu.selectAll("nodeContextMenu")
			.data(data_ready)
			.join('text')
			.attr("class", "fas icon labelName")
			.attr('d', arc2)
			.attr('transform', d => {
				let pos = arc2.centroid(d);
				pos[0] = pos[0] - 10;
				pos[1] = pos[1] + 5;
				//console.log(pos);
				return 'translate(' + pos + ')';
			})
			.text(d => {
				//console.log(d);
				return ((d.data.value.icon.length == 0) ? "" : String.fromCharCode(parseInt(d.data.value.icon, 16)));
			})
		nodeContextMenu.selectAll('nodeContextMenu')
			.data(data_ready)
			.enter()
			.append("path")
			.style("stroke", "transparent")
			.style("opacity", 0.3)
			.attr('d', arc1)
			.on("mouseout", () => {
				const pendingLink = document.querySelector(".link");
				if (!pendingLink) {
					nodeContextMenu.style("visibility", "hidden")
					currentNodeWithContextMenu = null;
				}
			})
			.on("mouseover", function () { d3.select(this).style("cursor", "pointer") })
			.on("click", function (d) {
				switch (d.data.value.action) {
					case "Delete": {
						deleteItem(currentNodeWithContextMenu, null, nodes, links, itemTypes);
						break;
					}
					case "Add": {
						const itemModal = document.getElementById("itemModal");
						if (itemModal) {
							document.body.removeChild(itemModal);
						}
						document.body.appendChild(setupItemPropertiesModal());
						viewItem(null, currentNodeWithContextMenu, addItem, nodes, links, linkTypes, itemTypes);
						$('#itemModal').modal();
						// const newInternal_id = makeid(20);
						// const newNode = { x: currentNodeWithContextMenu.x + 15, y: currentNodeWithContextMenu.y + 15, internal_id: newInternal_id, identifier: "Hello world", type: { colour: "black", background_colour: "black" } }
						// const newLink = { source: currentNodeWithContextMenu, target: newNode }

						//addItem(nodes, links, newNode);
						break;
					}
					case "Link": {
						const svg = d3.select("#drawingArea");
						svg
							.select(".line")
							.remove();
						const mouse = d3.mouse(d3.select("#chart > svg").node());
						const transform = d3.zoomTransform(d3.select("#chart > svg").node());
						const mouseWithZoom = transform.invert(mouse);
						//console.log(`line from ${currentNodeWithContextMenu.x}, ${currentNodeWithContextMenu.y} to ${mouseWithZoom[0]}, ${mouseWithZoom[1]}`)
						svg
							.append("line")
							.lower()
							.attr("x1", currentNodeWithContextMenu.x)
							.attr("y1", currentNodeWithContextMenu.y)
							.attr("x2", mouseWithZoom[0])
							.attr("y2", mouseWithZoom[1])
							.attr("class", "link")
							.on("click", d => console.log("line click"))

						break;
					}
					case "Properties": {
						const itemModal = document.getElementById("itemModal");
						if (itemModal) {
							document.body.removeChild(itemModal);
						}
						document.body.appendChild(setupItemPropertiesModal());
						viewItem(currentNodeWithContextMenu, null, saveItem, nodes, links, linkTypes, itemTypes);
						$('#itemModal').modal()
						break;
					}
				}
				// simulation
				// 	.nodes(nodes)
				// 	.force("link", d3.forceLink(links).id(d => d.id))
				// update(simulation, nodes, links, nodeTypes, displayOptions);
				// simulation.alpha(0.01).restart();
				console.log(d.data.value.action)
			})


		return nodeContextMenu;
	}
	const setupSimulation = (width, height) => {
		const parentSVG = d3.select("#chart").append("svg")
			.attr("viewBox", [0, 0, width, height - 80])
			.call(d3.zoom().on("zoom", () => {
				const svg = d3.select("#drawingArea");
				svg.attr("transform", d3.event.transform);
			}))
			.on("mousemove", function () {
				var mouse = d3.mouse(this);
				var transform = d3.zoomTransform(this);
				var xy1 = transform.invert(mouse);
				//console.log(mouse + ", " + xy1);

				const pendingLink = document.querySelector(".link");
				if (pendingLink) {
					d3.select(".link")
						.attr("x1", currentNodeWithContextMenu.x)
						.attr("y1", currentNodeWithContextMenu.y)
						.attr("x2", xy1[0])
						.attr("y2", xy1[1])
				}
			})
		// .on("click", function() {
		// 	const pendingLink = document.querySelector(".pendingLink");
		// 	if(!pendingLink) {
		// 		console.log("SVG Click!");
		// 	}
		// });
		parentSVG
			.append("g")
			.attr("id", "drawingArea");

		const simulation = d3.forceSimulation()
			.force("charge", d3.forceManyBody().strength(-10000).distanceMax(1500))
			.force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2));

		// tooltip
		d3.select("body").append("div")
			.attr("id", "tooltip")
			.style("position", "absolute")
			.style("visibility", "hidden")
			.style("background", "whitesmoke");
		return simulation;
	};

	const update = (simulation, nodes, unsortedLinks, linkTypes, itemTypes, displayOptions) => {
		simulation
			.nodes(nodes)
			.force("link", d3.forceLink(unsortedLinks).id(d => d.id))
		const svg = d3.select("#drawingArea");
		const links = sortAndOrderLinks(unsortedLinks);
		// These SVG element types need to be added in a very specific order for the user interface mechanics to work correctly.
		let text = null;
		if (displayOptions.showNodeLabels) {
			text = svg
				.selectAll(".text")
				.data(nodes)
				.join("text")
				.attr("class", "text")
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.text(d => d.identifier)
				.attr("x", function (d) {
					// Get the half-length of the text for centering on the node.
					d.xOffset = this.getBBox().width / 2;
				})
				.attr("y", function (d) {
					// Get the height of the text for positioning underneath the node.
					d.yOffset = this.getBBox().height + displayOptions.nodeRadius;
				})
		}
		let link = null;
		if (displayOptions.showLinks) {
			link = svg
				.selectAll(".path")
				.data(links)
				.join("path")
				.attr("id", d => d.internal_id)
				.lower()
				.attr("class", "path")
				.attr("stroke-width", 2)
				.attr("stroke", d => (d.connector ? d.connector.colour : "gainsboro"))
				.attr("fill", "transparent")
				.attr('marker-end', d => `url(#marker_${(d.connector ? d.connector.colour.substring(1) : "gainsboro") + (d.connector ? d.connector.marker : "")})`)
				.on("mouseenter", function (d) {
					// Fatten the line on mouse entry to better allow for link context menu.
					d3.select(this).transition(750).attr("stroke-width", "5")
				})
				.on("mouseout", function (d) {
					d3.select(this).transition(750).attr("stroke-width", "2")
					d3.select(this).style("cursor", "default");
				})
				.on("mouseover", function (d) {
					d3.select(this).style("cursor", "pointer");
				})
				.on("click", function (d) {
					if (linkPropertiesModal) {
						document.body.removeChild(linkPropertiesModal);
					}
					const linkModal = document.getElementById("linkModal");
					if (linkModal) {
						document.body.removeChild(linkModal);
					}
					document.body.appendChild(setupLinkPropertiesModal());
					viewLink(d, links, linkTypes, nodes, itemTypes, saveNewLink, deleteLink);
					$('#linkModal').modal();
				})
				.each(d => {
					if (d.connector) {
						createMarkerEnd("marker_", dashesAndEnds, d.connector.marker, d.connector.colour, "5px", "5px", displayOptions.nodeRadius + 4, 0);
					}
				})
		}

		let linkText = null;
		if (displayOptions.showLinkLabels) {
			linkText = svg
				.selectAll(".linkText")
				.data(links)
				.join("text")
				.attr("class", "linkText")
				.style("color", d => d3.select("body").attr("color"))
				.attr("dy", -5)
				.append("textPath")
				.attr("startOffset", "50%")
				.attr("text-anchor", "middle")
				.attr("href", d => "#" + d.internal_id)
				.text(d => (d.connector ? d.connector.identifier : d.identifier + ""))
		}
		// Context menu needs to be added here but it should not be added every time the diagram is updated.
		if (nodeContextMenu == null) {
			nodeContextMenu = createNodeContextMenu(simulation, nodes, unsortedLinks, linkTypes, itemTypes, displayOptions);
		}
		let node = null;
		if (displayOptions.showNodes) {
			node = svg
				.selectAll(".node")
				.data(nodes)
				.join("circle")
				// .join("g")
				.attr("class", "node")
				.attr("id", d => "circle_" + d.internal_id)
				// .append("circle")
				// .attr("class", "nodeCircle")
				.attr("stroke", d => (d.type ? d.type.colour : "transparent"))
				.attr("r", displayOptions.nodeRadius)
				.attr("fill", d => (d.type ? d.type.background_colour : "transparent"))
				.attr('filter', d => `url(#dropshadow)`)
				.call(drag(simulation))
				.on("mouseenter", function (d) {
					d3.select(this).transition(750).attr("r", displayOptions.nodeRadius * 2);
				})
				.on("mouseout", function (d) {
					d3.select(this).transition(750).attr("r", displayOptions.nodeRadius);
					d3.select(this).style("cursor", "default");
					const tooltip = d3.select("#tooltip");
					tooltip.style("visibility", "hidden")
				})
				.on("mouseover", function (d) {
					d3.select(this).style("cursor", "pointer");
					// Tooltip
					const tooltip = d3.select("#tooltip");
					tooltip.html(() => `<strong>${d.identifier} (${d.type.identifier})</strong><div>${d.description}</div>`)
						.style("visibility", "visible")
						.style("left", (d3.event.pageX + 30) + "px")
						.style("top", (d3.event.pageY - 30) + "px")
						.style("border", "solid 1px #aaa")
						.style("border-radius", "8px")
						.style("padding", "8px")

				})
				.on("click", d => {
					const pendingLink = document.querySelector(".link");
					if (pendingLink == null) {
						currentNodeWithContextMenu = d;
						nodeContextMenu
							.attr("transform", `translate(${d.x}, ${d.y})`)
							.style("visibility", "visible")
						simulation.stop();
					}
					else {
						d3.select(".link").remove();
						nodeContextMenu.style("visibility", "hidden")
						addLink(unsortedLinks, currentNodeWithContextMenu, d).then(() => {
							simulation
								.nodes(nodes)
								.force("link", d3.forceLink(unsortedLinks).id(d => d.id))
							update(simulation, nodes, unsortedLinks, linkTypes, itemTypes, displayOptions);
							simulation.alpha(0.005).restart();

						});
					}
				});
		}
		const footer = document.querySelector("footer");
		footer.innerHTML = `Items: ${nodes.length}, Links: ${links.length}.`;

		simulation.on("tick", () => {
			const linkArc = (d, i) => {
				var dr = 0;
				if (d.set != 1) { dr = 200 / d.linknum; } //linknum is defined above
				return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
			}
			const textArc = (d, i) => {
				var dr = 200 / d.linknum; //linknum is defined above
				return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
			}
			if (link != null) {
				link.attr("d", (d, i) => linkArc(d, i));
			}
			if (linkText != null) {
				linkText.attr("d", (d, i) => textArc(d, i));

			}
			if (node != null) {
				node
					.attr("cx", d => d.x)
					.attr("cy", d => d.y)
			}
			if (text != null) {
				text
					.attr("x", d => d.x)
					.attr("y", d => d.y + d.yOffset)
			}
			if (currentNodeWithContextMenu) {
				nodeContextMenu.attr("transform", `translate(${currentNodeWithContextMenu.x}, ${currentNodeWithContextMenu.y})`)
			}
		});
		const mappedConnectors = unsortedLinks.map(link => link.connector);
		const connectorsInUse = [...new Set(mappedConnectors)];

		const mappedNodeTypes = nodes.map(node => node.type);
		const nodesTypesInUse = [...new Set(mappedNodeTypes)];
		const createLegend = (connectors, itemTypes) => {
			const svg = d3.select("#chart > svg");
			const legendItemHeight = 30;
			const legendItemWidth = 90
			const legendCaptionHeight = 20;

			d3.select("#legend").remove();

			const legend = svg
				.data([0])
				.append("g")
				.attr("class", "legend")
				.attr("id", "legend")
				.attr("transform", "translate(100, 100)")
				.call(dragHandler)


			legend.append("rect")
				.attr("class", "legendContainer")
				.style("stroke-width", "2px")
				.style("stroke", "black")
				.style("fill", "WhiteSmoke")
				.attr("height", (((connectors ? connectors.length : 0) + (itemTypes ? itemTypes.length : 0)) * legendItemHeight) + legendCaptionHeight * 2 + "px")
				.attr("width", "350px")
				.attr("rx", 15)

			legend
				.append("text")
				.attr("class", "keyTitle")
				.text("Key")
				.attr("x", 15)
				.attr("y", function () {
					// Get the height of the text for positioning underneath the node.
					return this.getBBox().height;
				})

			if (connectors != null) {
				legend.selectAll(".connectors")
					.data(connectors)
					.join("line")
					.attr("class", "legendItem")
					.attr("x1", 15)
					.attr("y1", (d, i) => { return (legendItemHeight * (i + 1) + legendCaptionHeight); })
					.attr("x2", legendItemWidth - 15)
					.attr("y2", (d, i) => { return (legendItemHeight * (i + 1) + legendCaptionHeight); })
					.style("stroke", d => (d ? d.colour : "gainsboro"))
					.style("stroke-width", 4)
					.attr('marker-end', d => (d ? `url(#legendMarker_${d.colour.substring(1)}${d.marker})` : ""))
					.each(d => { if (d) { createMarkerEnd("legendMarker_", dashesAndEnds, d.marker, d.colour, "5px", "5px", 0, 0); } })

				legend.selectAll(".connector-text")
					.data(connectors)
					.join("text")
					.attr("class", "connector-text")
					.on("mouseover", (d => {

					}))
					.text(d => (d ? d.identifier : "Unspecified link type"))
					.attr("x", legendItemWidth)
					.attr("y", (d, i) => { return (legendItemHeight * (i + 1) + legendCaptionHeight + 5); })

			}

			if (itemTypes != null) {
				legend.selectAll(".item-type")
					.data(itemTypes)
					.join("circle")
					.attr("class", "item-type")
					.attr("r", 10)
					.attr("cx", legendItemWidth / 2)
					.attr("cy", (d, i) => { return (legendItemHeight * ((itemTypes ? connectors.length : 0) + i + 1) + legendCaptionHeight); })
					.style("stroke", d => (d ? d.colour : "black"))
					.style("fill", d => (d ? d.background_colour : "black"))
					.style("stroke-width", 2)

				legend.selectAll(".item-type-text")
					.data(itemTypes)
					.join("text")
					.attr("class", "item-type-text")
					.text(d => (d ? d.identifier : "No Type"))
					.attr("x", legendItemWidth)
					.attr("y", (d, i) => { return (legendItemHeight * ((itemTypes ? connectors.length : 0) + i + 1) + legendCaptionHeight + 5); })

			}
		}
		createLegend(connectorsInUse, nodesTypesInUse);

	};
	const createActionsMenu = () => {
		d3.select("#actionsMenu").remove();
		const svg = d3.select("#chart > svg");
		const svgBounds = svg.attr("viewBox").split(',');
		const actionsMenu = svg
			.data([0])
			.append("g")
			.attr("id", "actionsMenu")
			.attr("transform", `translate(${parseInt(svgBounds[2]) - 100}, ${parseInt(svgBounds[3]) - 100})`)
		actionsMenu
			.append("circle")
			.attr("r", displayOptions.nodeRadius)
			.style("stroke-width", "2px")
			.style("stroke", "black")
			.style("fill", "WhiteSmoke")
			.on("click", () => {
				Promise.allSettled([
					linksDB.loadConnections("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY"),
					itemsDB.loadItems("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY"),
					linkTypesDB.loadConnectors("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY"),
					itemTypesDB.loadTypes("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY"),
				]).then(results => {
					const exportData = {
						connections: results[0].value,
						things: results[1].value,
						connectors: results[2].value,
						types: results[3].value,
						project: JSON.parse(`{"internal_id":"qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY","identifier":"Capabilities","description":"Business Capability Model","_created":"2020-07-29T01:39:54.712Z","_updated":"2020-07-29T04:50:49.185Z","active":true}`)
					};
					console.log("Actions click!");
					const exportJSON = document.createElement("a");
					const blob = new Blob([JSON.stringify(exportData)], { type: "text/JSON; charset=utf-8;" });
					const url = URL.createObjectURL(blob);
					exportJSON.href = url;
					exportJSON.setAttribute("download", "export.JSON");
					exportJSON.click();

				})
			})

	}

	const setupFilters = () => {
		const defs = d3.select("#drawingArea").append('defs').attr("id", "defs");
		const setupDropShadowFilter = (defs) => {
			// append filter element
			const filter = defs.append('filter')
				.attr('id', 'dropshadow') /// !!! important - define id to reference it later
				.attr("x", "-20%")
				.attr("y", "-20%")
				.attr("width", "200%")
				.attr("height", "200%")

			// append gaussian blur to filter
			filter.append('feGaussianBlur')
				.attr('in', 'SourceAlpha')
				.attr('stdDeviation', 3) // !!! important parameter - blur
				.attr('result', 'blur');

			// append offset filter to result of gaussion blur filter
			filter.append('feOffset')
				.attr('in', 'blur')
				.attr('dx', 2) // !!! important parameter - x-offset
				.attr('dy', 3) // !!! important parameter - y-offset
				.attr('result', 'offsetBlur');

			// merge result with original image
			const feMerge = filter.append('feMerge');

			// first layer result of blur and offset
			feMerge.append('feMergeNode')
				.attr('in", "offsetBlur')

			// original image on top
			feMerge.append('feMergeNode')
				.attr('in', 'SourceGraphic');
		}
		setupDropShadowFilter(defs);
	}
	const setupInputEventHandlers = (simulation) => {
		const searchInput = document.getElementById("searchInput");
		searchInput.addEventListener("keyup", event => {

			console.log("change!" + event.currentTarget.value);
			d3.select("#drawingArea").selectAll(".node").data(nodes)
				.style("opacity", 1)
			d3.select("#drawingArea").selectAll(".node").data(nodes).filter(node => node.identifier.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) < 0)
				.style("opacity", 0.05)

			d3.select("#drawingArea").selectAll(".path").data(unsortedLinks)
				.style("opacity", 1)
			d3.select("#drawingArea").selectAll(".path").data(unsortedLinks).filter(item => {
				//console.log((node.identifier != null) && (node.identifier.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) < 0))
				let notFound = true;
				if (item.identifier != null) {
					notFound = (item.identifier.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) < 0);
				}
				return notFound;
			})
				.style("opacity", 0.05);

			// d3.select("#drawingArea").selectAll(".text").data(nodes)
			// 	.style("opacity", 1)
			// d3.select("#drawingArea").selectAll(".text").data(unsortedLinks).filter(item => {
			// 	//console.log((node.identifier != null) && (node.identifier.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) < 0))
			// 	let notFound = true;
			// 	if (item.identifier != null) {
			// 		notFound = (item.identifier.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) < 0);
			// 	}
			// 	return notFound;
			// })
			// 	.style("opacity", 0.05)
		})
	}

	const simulation = setupSimulation(innerWidth, innerHeight);
	setupInputEventHandlers(simulation);
	setupFilters();
	update(simulation, nodes, unsortedLinks, connectors, nodeTypes, displayOptions);
	createActionsMenu();
})();