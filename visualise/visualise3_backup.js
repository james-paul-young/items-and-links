(async () => {
	const loadConnections = projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["connection"], 'readonly');
				var objectStore = loadTransaction.objectStore("connection");

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
	const loadItems = projectId => {
		return new Promise((resolve, reject) => {
			// Get the currently active project.
			var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			var openDBRequest = indexedDB.open("thingdb", 9);
			openDBRequest.onsuccess = (event) => {
				var db = event.target.result;
				var loadTransaction = db.transaction(["thing"], 'readonly');
				var objectStore = loadTransaction.objectStore("thing");

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

	const createMarkerEnd = (defs, dashesAndEnds, end_name, colour, width, height, refX, refY) => {
		if (document.getElementById('marker_' + colour.substring(1) + end_name) == null) {
			const end = dashesAndEnds.end.find(currentEnd => currentEnd.name == end_name)
			defs
				.append('marker')
				.attr('markerUnits', 'strokeWidth')
				.attr('orient', 'auto')
				.attr('id', 'marker_' + colour.substring(1) + end_name)
				.attr('markerHeight', height)
				.attr('markerWidth', width)
				.attr('refX', 19)
				.attr('refY', 0)
				.attr('viewBox', end.viewbox)
				.append('path')
				.attr('d', end.path)
				.attr('fill', colour);
		}
	}
	const connectors = await loadConnectors("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const rawlinks = await loadConnections("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const rawNodes = await loadItems("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const nodeTypes = await loadItemTypes("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");

	let currentNodeWithContextMenu = null;
	let nodeContextMenu = null;

	const nodes = rawNodes.map(node => {
		const type_id = node.type;
		node.type = nodeTypes.find(type => type.internal_id == type_id);
		return node;
	})

	const sortAndOrderLinks = (unsortedLinks) => {
		const nonOrphanedLinks = unsortedLinks.filter(link => (link.source != null) && (link.target != null)).map(link => { link.set = null; return link; });
		console.log("unsortedLinks.length = " + unsortedLinks.length + ", nonOrphanedLinks.length = " + nonOrphanedLinks.length)
		// Count the number of links in the set of links between each node.
		nonOrphanedLinks.forEach(firstlink => {
			nonOrphanedLinks.forEach(secondlink => {
				if (firstlink.set == null) { console.log("creating set"); firstlink.set = 1; }
				if (secondlink.set == null) { console.log("creating set"); secondlink.set = 1; }
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
		const newLink = { source: source, target: target };
		links.push(newLink);
	}
	/**
	 * Adds the node and link to the force simulation, hides the context menu and adds a small amount of reheating to the layout.
	 * @param {d3.forceSimulation} simulation The force simulation
	 * @param {Array} nodes The nodes drawn on the force simulation
	 * @param {Array} links The links between nodes drawn on the force simulation
	 * @param {object} source The d3 node from which the new node will be linked to.
	 * @param {object} link The d3 link between the source node and the new node.
	 * @param {object} node The node to add.
	 */
	const addNode = (simulation, nodes, links, source, link, node) => {
		nodeContextMenu.style("visibility", "hidden")
		currentNodeWithContextMenu = null;
		const newInternal_id = makeid(20);
		nodes.push(node);
		unsortedLinks.push(link)
		d3.event.preventDefault();
		simulation
			.nodes(nodes)
			.force("link", d3.forceLink(unsortedLinks).id(d => d.id))
		update(unsortedLinks);
		simulation.alpha(0.01).restart();
	}

	const deleteNode = (simulation, nodes, links, node) => {
		nodeContextMenu.style("visibility", "hidden")
		currentNodeWithContextMenu = null;
		const nodeIndex = nodes.indexOf(node);
		if (nodeIndex > -1) {
			nodes.splice(nodeIndex, 1);
		}
		// Find all links to/from this node.
		const linksToNode = links.filter(link => (link.source.internal_id == node.internal_id) || (link.target.internal_id == node.internal_id));
		// Remove those links from the general simulation links.
		linksToNode.forEach(linkToNode => {
			const linkToNodeIndex = links.indexOf(linkToNode);
			if (linkToNodeIndex > -1) {
				links.splice(linkToNodeIndex, 1);
			}
		});
		simulation
			.nodes(nodes)
			.force("link", d3.forceLink(links).id(d => d.id))
		update();
		simulation.alpha(0.01).restart();
	}
	// Context menu for a node.
	const createNodeContextMenu = (centerX, centerY) => {
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

		const arc1 = d3.arc()
			.innerRadius(15)
			.outerRadius(15 + 30)
			.cornerRadius(1);

		const arc2 = d3.arc()
			.innerRadius(20)
			.outerRadius(20 + 20)
			.cornerRadius(1);
		const nodeContextMenu = svg.append("g")
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
						deleteNode(simulation, nodes, links, currentNodeWithContextMenu);
						break;
					}
					case "Add": {
						const newInternal_id = makeid(20);
						const newNode = { x: currentNodeWithContextMenu.x + 15, y: currentNodeWithContextMenu.y + 15, internal_id: newInternal_id, identifier: "Hello world", type: { colour: "black", background_colour: "black" } }
						const newLink = { source: currentNodeWithContextMenu, target: newNode }
						addNode(simulation, nodes, links, currentNodeWithContextMenu, newLink, newNode);
						break;
					}
					case "Link": {
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
				}
				console.log(d.data.value.action)
			})


		return nodeContextMenu;
	}
	const setupSimulation = (width, height, nodes, links) => {
		const parentSVG = d3.select("#chart").append("svg")
			.attr("viewBox", [0, 0, width, height])
			.on("mousemove", function () {
				var mouse = d3.mouse(this);
				var transform = d3.zoomTransform(this);
				var xy1 = transform.invert(mouse);
				//console.log(mouse + ", " + xy1);

				// Offset the coordinates slightly because the "click" event does not trigger for a node. The mouse coords are over part of the line.
				const pendingLink = document.querySelector(".link");
				if (pendingLink) {
					d3.select(".link")
						.attr("x1", currentNodeWithContextMenu.x - 1)
						.attr("y1", currentNodeWithContextMenu.y - 1)
						.attr("x2", xy1[0] - 1)
						.attr("y2", xy1[1] - 1)
				}
			});
		const defs = parentSVG.append('defs');
		const svg = parentSVG.append("g");
		parentSVG.call(d3.zoom().on("zoom", svg => {
			svg.attr("transform", d3.event.transform)
		}))

		const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id))
			.force("charge", d3.forceManyBody().strength(-12500).distanceMax(1500))
			.force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2));

		const tooltip = d3.select("body").append("div")
			.style("position", "absolute")
			.style("visibility", "hidden")
			.style("background", "whitesmoke");
		return ({ simulation, svg, defs, tooltip });
	};

	const update = () => {
		const links = sortAndOrderLinks(unsortedLinks);
		console.log("links.length = " + links.length)
		// These SVG element types need to be added in a very specific order for the user interface mechanics to work correctly.
		const text = svg
			.selectAll(".text")
			.data(nodes)
			.join("text")
			.attr("class", "text")
			.text(d => d.identifier)
			.attr("x", function (d) {
				// Get the half-length of the text for centering on the node.
				d.xOffset = this.getBBox().width / 2;
			})
			.attr("y", function (d) {
				// Get the height of the text for positioning underneath the node.
				d.yOffset = this.getBBox().height + 15;
			})

		const link = svg
			.selectAll(".path")
			.data(links)
			.join("path")
			.lower()
			.attr("class", "path")
			.attr("stroke-opacity", 0.6)
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
			.each(d => {
				if (d.connector) {
					createMarkerEnd(defs, dashesAndEnds, d.connector.marker, d.connector.colour, "5px", "5px", 5, 5);
				}
			})

		// Context menu needs to be added here but it should not be added every time the diagram is updated.
		if (nodeContextMenu == null) {
			nodeContextMenu = createNodeContextMenu();
		}
		const node = svg
			.selectAll("circle")
			.data(nodes)
			.join("circle")
			.attr("stroke", d => (d.type ? d.type.colour : "transparent"))
			.attr("r", 15)
			.attr("fill", d => (d.type ? d.type.background_colour : "transparent"))
			//.style("background", d => `radial-gradient(circle at 70px 70px, #5cabff, #000)`)
			.attr('filter', d => `url(#dropshadow)`)
			.call(drag(simulation))
			.on("contextmenu", parent => {
			})
			.on("mouseout", function (d) {
				d3.select(this).style("cursor", "default");
				tooltip.style("visibility", "hidden")
			})
			.on("mouseover", function (d) {
				d3.select(this).style("cursor", "pointer");
				// Tooltip
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
				}
				else {
					d3.select(".link").remove();
					nodeContextMenu.style("visibility", "hidden")
					addLink(unsortedLinks, currentNodeWithContextMenu, d);
					simulation
						.nodes(nodes)
						.force("link", d3.forceLink(unsortedLinks).id(d => d.id))
					update();
					simulation.alpha(0.01).restart();
				}
			})


		simulation.on("tick", () => {
			const linkArc = (d, i) => {
				var dr = 0;
				if (d.set != 1) { dr = 200 / d.linknum; } //linknum is defined above
				//console.log("i = " + i)
				if (i >= 142) {
					console.log(d);
					//console.log("M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y);
				}
				return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
			}
			link.attr("d", (d, i) => linkArc(d, i));
			// link
			// 	.attr("x1", d => d.source.x)
			// 	.attr("y1", d => d.source.y)
			// 	.attr("x2", d => d.target.x)
			// 	.attr("y2", d => d.target.y);

			node
				.attr("cx", d => d.x)
				.attr("cy", d => d.y)
			text
				.attr("x", d => d.x - d.xOffset)
				.attr("y", d => d.y + d.yOffset)

			if (currentNodeWithContextMenu) {
				nodeContextMenu.attr("transform", `translate(${currentNodeWithContextMenu.x}, ${currentNodeWithContextMenu.y})`)
			}
		});
	};

	const setupFilters = (defs) => {
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
	//	update(svg, simulation, nodes, links);
	const { simulation, svg, defs, tooltip } = setupSimulation(innerWidth, innerHeight, nodes, unsortedLinks);
	setupFilters(defs);
	update();
})();