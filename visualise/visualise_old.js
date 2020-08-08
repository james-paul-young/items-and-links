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
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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

	const connectors = await loadConnectors("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const rawlinks = await loadConnections("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const rawNodes = await loadItems("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");
	const nodeTypes = await loadItemTypes("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY");

	const nodes = rawNodes.map(node => {
		const type_id = node.type;
		node.type = nodeTypes.find(type => type.internal_id == type_id);
		return node;
	})

	const links = rawlinks.map(connection => {
		const source_id = connection.source;
		connection.source = nodes.find(item => item.internal_id == source_id);
		const target_id = connection.target;
		connection.target = nodes.find(item => item.internal_id == target_id);
		connection.connector = connectors.find(connector => connector.internal_id == connection.connector);
		return connection;
	})

	const simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id))
		.force("charge", d3.forceManyBody().strength(-12500).distanceMax(1500))
		.force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2));

	const svg = d3.select("#chart").append("svg")
		.attr("viewBox", [0, 0, innerWidth, innerHeight])
		.call(d3.zoom().on("zoom", () => {
			svg.attr("transform", d3.event.transform)
		}))
		.append("g");

	const link = svg.append("g")
		.attr("stroke-opacity", 0.6)
		.attr("class", "link")
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke", d => (d.connector ? d.connector.colour : "gainsboro"))

	const node = svg.append("g")
		.attr("class", "node")
		.selectAll("circle")
		.data(nodes)
		.join("circle")
		.attr("stroke", d => (d.type ? d.type.colour : "transparent"))
		.attr("r", 15)
		.attr("fill", d => (d.type ? d.type.background_colour : "transparent"))
		.call(drag(simulation))

	const text = svg.append("g")
		.attr("class", "node")
		.selectAll("text")
		.data(nodes)
		.join("text")
		.text(d => d.identifier)

	simulation.on("tick", () => {
		link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

		node
			.attr("cx", d => d.x)
			.attr("cy", d => d.y)
		text
			.attr("x", d => d.x)
			.attr("y", d => d.y + 15 + 15)
	});
})();