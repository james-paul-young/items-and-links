"use strict";
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
	const connections = await loadConnections("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const items = await loadItems("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");

	let links = null;

	const mappedConnections = connections.map(connection => {
		const source_id = connection.source;
		connection.source = items.find(item => item.internal_id == source_id);
		const target_id = connection.target;
		connection.target = items.find(item => item.internal_id == target_id);
		return connection;
	})

	const updateCanvas = (canvas, items, links) => {
		let allItems = canvas.selectAll("g.item").data(items, item => item.internal_id);
		const enteringItems = allItems.enter();
		const exitingItems = allItems.exit();

		exitingItems.remove();

		const drawnItems = enteringItems
			.append("g")
			.attr("class", "itemContainer")
			.attr("internal_id", d => d.internal_id)

		drawnItems
			.append("text")
			.attr("class", "item-text")
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "middle")

		drawnItems.append("circle")
			.attr("class", "item")
			.attr("stroke-width", 2 + "px")

		allItems = drawnItems.merge(allItems);

		drawnItems.selectAll("text")
			.text(d => d.identifier);

		drawnItems.selectAll("circle")
			.attr("r", 10)

		let allPaths = canvas.selectAll(".link").data(links, link => link.internal_id);
		const enteringPaths = allPaths.enter();
		const exitingPaths = allPaths.exit();

		const drawnPaths = enteringPaths
			.append("path")
			.attr("class", "link")
			.attr("id", d => d.internal_id)
			.lower()
			.attr("fill", "transparent")

			allPaths = drawnPaths.merge(allPaths);
		return { drawnItems: allItems, drawnPaths: allPaths };
	}

	const setupCanvas = () => {
		d3.selectAll("#canvas").remove();
		return d3.select("#chart")
			.append("svg")
			.attr("id", "canvas")
			.attr("class", "canvas")
			.attr("viewBox", [0, 0, innerWidth, innerHeight]);	}
	const fixna = x => {
		return isFinite(x) ? x : 0;
	}

	const linkArc = (d, linkRadius) => {
		var dr = 0;
		if (d.set != 1) { dr = linkRadius / d.linknum; } //linknum is defined above
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
	}
	const textArc = (d, linkRadius) => {
		var dr = linkRadius / d.linknum; //linknum is defined above
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
	}
	const repositionNodes = (nodes) => {
		console.log("Repositioning...")
		nodes
			.attr("cx", n => n.x)
			.attr("cy", n => n.y)
			// .attr("transform", ((d) => {
			// 	return "translate(" + (isFinite(d.x) ? d.x : 0) + "," + (isFinite(d.y) ? d.y : 0) + ")";
			// }));
	}

	const ticked = (allNodes, allPaths, allTextPaths, linkRadius) => {
		console.log("ticked")
		allPaths
			.attr("x1", d => {
				return d.source.x; }
				)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y)
		repositionNodes(allNodes);
	}

	const canvas = setupCanvas();
	const simulation = d3.forceSimulation()
		.force('charge', d3.forceManyBody())
		.force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
		.force("link", d3.forceLink().id(link => {
			return link.internal_id; 
		}))
		.nodes(items)
		//.force("link").links(mappedConnections)

	const { drawnItems, drawnPaths } = updateCanvas(canvas, items, mappedConnections);
	simulation.force("link", d3.forceLink(mappedConnections).id(link => link.internal_id));
	simulation
		.on("tick", ticked(drawnItems, drawnPaths, null, 100));

})();