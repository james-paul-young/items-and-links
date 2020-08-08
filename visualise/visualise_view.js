class VisualiseView extends ApplicationView {
	visualiseViewModel = new VisualiseViewModel();

	chartNodeCircleRadius = 0.0;
	chartNodeCircleStrokeWidth = 3;

	// chartStrength = -4000;
	// chartMaxDistance = 400;
	// chartMinDistance = 200;
	// linkRadius = 1500;
	imageWidth = 18;
	d3svg = null;
	defs = null;
	clickTracking = "none";
	nodeClicking = false;

	forceGraph = null;
	tooltip = null;
	existingNodes = null;
	existingPaths = null;
	existingTextPaths = null;
	existingTexts = null;
	textBlock = null;
	existingDescriptors = null;
	thingProperties = null;
	connectionProperties = null;
	visualiseProperties = null;
	visualiseFilter = null;

	mappedNodes = null;
	mappedLinks = null;
	chartNodeDefaultFill = "#ffffff"

	constructor() {
		super(applicationResources.visualisePageString);
		console.assert(this.visualiseViewModel != null, "Cannot initialise VisualiseViewModel. Add reference to visualise_viewmodel in HTML.")
		//this = this;
		window.addEventListener("mousemove", event => {
			// var xxx = d3.select("#drawingArea");
			// var mouseone = d3.mouse(xxx);
			// var mouse = d3.mouse(document.getElementById("drawingArea"));
			// console.log("mousemove" + mouse)

		})
		var legendTitle = document.getElementById("legendTitle");
		if (legendTitle != null) {
			legendTitle.innerHTML = visualiseResources.legendString;
		}

		document.getElementById("optionsButtonText").innerHTML = visualiseResources.optionsString;

		var nodePropertiesMenuItem = document.getElementById("nodeProperties");
		if (nodePropertiesMenuItem != null) {
			nodePropertiesMenuItem.title = visualiseResources.nodePropertiesString;
			nodePropertiesMenuItem.addEventListener("click", (event) => {
				this.toggleMenu("nodeContextMenu", "hide");
				var menu = document.getElementById("nodeContextMenu");
				if (menu != null) {
					this.viewNode(menu.dataset.internal_id);
				}
			})
		}

		var visualiseFilterMenuItem = document.getElementById("visualiseFilter");
		if (visualiseFilterMenuItem != null) {
			visualiseFilterMenuItem.title = visualiseResources.visualiseFilterString;
			visualiseFilterMenuItem.addEventListener("click", (event) => {
				this.toggleMenu("canvasContextMenu", "hide");
				var menu = document.getElementById("nodeContextMenu");
				if (menu != null) {
					this.viewFilter();
				}
			})
		}

		var nodeDeleteMenuItem = document.getElementById("nodeDelete");
		if (nodeDeleteMenuItem != null) {
			nodeDeleteMenuItem.title = visualiseResources.nodePropertiesString;
			nodeDeleteMenuItem.addEventListener("click", (event) => {
				this.toggleMenu("nodeContextMenu", "hide");
				var menu = document.getElementById("nodeContextMenu");
				if (menu != null) {
					this.deleteThing(menu.dataset.internal_id);
				}
			})
		}

		var connectionDeleteMenuItem = document.getElementById("deleteConnection");
		if (connectionDeleteMenuItem != null) {
			//connectionDeleteMenuItem.title = visualiseResources.nodePropertiesString;
			connectionDeleteMenuItem.addEventListener("click", (event) => {
				this.toggleMenu("nodeContextMenu", "hide");
				var menu = document.getElementById("nodeContextMenu");
				if (menu != null) {
					this.deleteConnection(menu.dataset.internal_id);
				}
			})
		}

		var connectionPropertiesMenuItem = document.getElementById("connectionProperties");
		if (connectionPropertiesMenuItem != null) {
			connectionPropertiesMenuItem.addEventListener("click", (event) => {
				this.toggleMenu("connectionContextMenu", "hide");
				var menu = document.getElementById("connectionContextMenu");
				if (menu != null) {
					this.viewConnection(menu.dataset.internal_id);
				}
			})
		}

		var saveConnectionButton = document.getElementById("saveConnectionButton");
		if (saveConnectionButton != null) {
			saveConnectionButton.addEventListener("click", (event) => {
				this.saveConnection();
			})
		}
		var exportButton = document.getElementById("exportButton");
		if (exportButton != null) {
			exportButton.addEventListener("click", (event) => {
				this.toggleMenu("canvasContextMenu", "hide");
				this.export();
			})
		}
		var exportAsSVGButton = document.getElementById("exportAsSVGButton");
		if (exportAsSVGButton != null) {
			exportAsSVGButton.addEventListener("click", (event) => {
				this.toggleMenu("canvasContextMenu", "hide");
				this.saveSvg(document.getElementById("chartSVG"), this.visualiseViewModel.project.identifier);
			})
		}

		// var importButton = document.getElementById("importButton");
		// if (importButton != null) {
		//     importButton.addEventListener("click", (event) => {
		//         this.import();
		//     })
		// }
		// var importJirasButton = document.getElementById("importJirasButton");
		// if (importJirasButton != null) {
		//     importJirasButton.addEventListener("click", (event) => {
		//         this.importJiras();
		//     })
		// }
		var chartOptionsButton = document.getElementById("visualiseOptionsButton");
		if (chartOptionsButton != null) {
			chartOptionsButton.addEventListener("click", (event) => {
				this.visualiseProperties.view(this.visualiseViewModel.options[0], this.visualiseViewModel.saveOptions.bind(this.visualiseViewModel), this.updateForce.bind(this));
				this.toggleMenu("canvasContextMenu", "hide");
			})
		}

		var cancelCanvasContextMenuButton = document.getElementById("cancelCanvasContextMenuButton");
		if (cancelCanvasContextMenuButton != null) {
			cancelCanvasContextMenuButton.addEventListener("click", (event) => {
				this.toggleMenu("canvasContextMenu", "hide");
			});
		}

		// var printButton = document.getElementById("printButton");
		// if (printButton != null) {
		//     printButton.addEventListener("click", (event) => {
		// var printDiv = document.body.appendChild(document.createElement("div"));
		// printDiv.id = "printDiv";
		// printDiv.innerHTML = document.getElementById("chart").innerHTML;
		// var visibleDiv = document.getElementById("visualiseMain");
		// visibleDiv.style.display = "none";
		// printDiv.style.display = "block";
		// d3.selectAll("#printDiv > defs").remove();
		// window.print();
		// document.body.removeChild(printDiv);
		// visibleDiv.style.display = "block"
		//     });
		// }

		// Setup the "thing" modal lists.
		this.visualiseViewModel.load().then(() => {
			if (this.visualiseViewModel.options[0]) {

				this.oldStrength = this.visualiseViewModel.options[0].strength;
				this.oldMaxDistance = this.visualiseViewModel.options[0].maxDistance;
			}
			this.thingProperties = new ThingProperties(applicationResources, thingResources, this.visualiseViewModel.types);
			document.body.appendChild(this.thingProperties.modal);
			this.connectionProperties = new ConnectionProperties(applicationResources, connectionResources, this.visualiseViewModel.connectors, this.visualiseViewModel.nodes, this.visualiseViewModel.types, this.visualiseViewModel.project);
			document.body.appendChild(this.connectionProperties.modal);
			this.visualiseProperties = new VisualiseProperties(applicationResources, visualiseResources, this.visualiseViewModel.options[0]);
			document.body.appendChild(this.visualiseProperties.modal);
			this.visualiseFilter = new VisualiseFilter(applicationResources, visualiseResources, this.visualiseViewModel.filters[0]);
			document.body.appendChild(this.visualiseFilter.modal);

			// Map the nodes such that the data from the chart isn't mingling with the data from the node or link.
			this.mappedNodes = this.visualiseViewModel.nodes.map(node => { return { payload: node }; });
			this.mappedLinks = this.visualiseViewModel.links.map(link => {
				return {
					payload: link,
					// D3 seems to replace the "source" and "target" with an instance of the thing it references.
					// Copy the source and target from the payload to prevent chart data mixing with payload data.
					source: link.source,
					target: link.target,
				};
			});

			this.setupSVG();
		});
	}
	deleteThing(nodeId) {
		this.visualiseViewModel.deleteThing(nodeId).then(() => {
			//this.forceGraph.stop();
			// Map the nodes such that the data from the chart isn't mingling with the data from the node or link.
			this.mappedNodes = this.visualiseViewModel.nodes.map(node => { return { payload: node }; });
			this.mappedLinks = this.visualiseViewModel.links.map(link => {
				return {
					payload: link,
					// D3 seems to replace the "source" and "target" with an instance of the thing it references.
					// Copy the source and target from the payload to prevent chart data mixing with payload data.
					source: link.source,
					target: link.target,
				};
			});
			this.updateForce();
			//this.forceGraph.alpha(0.01)
			this.forceGraph.alpha(1);
			//this.forceGraph.tick(10);
		});
	}
	deleteConnection(connectionId) {
		this.visualiseViewModel.deleteConnection(connectionId).then(() => {
			this.updateForce(this.mappedNodes, this.mappedLinks, null, null);
		});
	}

	saveThing(thingData) {
		this.visualiseViewModel.saveThing(thingData).then((results) => {
			const { identifier, description, type, custom_image } = results;

			var thingToUpdate = this.mappedNodes.find(d => d.payload.internal_id == results.thing.internal_id);

			thingToUpdate.payload.identifier = identifier;
			thingToUpdate.payload.description = description;
			thingToUpdate.payload.type = type;
			thingToUpdate.payload.custom_image = custom_image;

			this.updateForce(this.mappedNodes, this.mappedLinks, null, null);
			//            this.updateDescriptors(this.mappedNodes, null, null)
			console.log("X");
		});

		// });
	}
	sortMappedLinks(mappedLinks) {
		let newMappedLinks = mappedLinks;
		if (newMappedLinks != null) {
			// Clear up any links that may cause an error when attempting to render the chart. I.e. no source or target.
			newMappedLinks = newMappedLinks.filter(link => (link.source != null) && (link.target != null));

			// Count the number of links in the set of links between each node.
			newMappedLinks.forEach(firstlink => {
				newMappedLinks.forEach(secondlink => {
					if (firstlink.set == null) { firstlink.set = 1; }
					if (secondlink.set == null) { secondlink.set = 1; }
					if (firstlink.payload.internal_id != secondlink.payload.internal_id) {
						// A new connection just has the source and target as the thing IDs. Existing ones have a D3 structure. 
						// Need to still be able to compare ids though
						let firstlinkSource = (typeof (firstlink.source) == "string") ? firstlink.source : firstlink.source.payload.internal_id;
						let firstlinkTarget = (typeof (firstlink.target) == "string") ? firstlink.target : firstlink.target.payload.internal_id;
						let secondlinkSource = (typeof (secondlink.source) == "string") ? secondlink.source : secondlink.source.payload.internal_id;
						let secondlinkTarget = (typeof (secondlink.target) == "string") ? secondlink.target : secondlink.target.payload.internal_id;

						if (((firstlinkSource == secondlinkSource) && (firstlinkTarget == secondlinkTarget)) || (
							(firstlinkSource == secondlinkTarget) && (firstlinkTarget == secondlinkSource))) {
							firstlink.set++;
							secondlink.set++;
						}
					}
				})
			})
			newMappedLinks.sort(function (a, b) {
				if (a.source > b.source) { return 1; }
				else if (a.source < b.source) { return -1; }
				else {
					if (a.target > b.target) { return 1; }
					if (a.target < b.target) { return -1; }
					else { return 0; }
				}
			});
			//console.table(this.mappedLinks);
			//any links with duplicate source and target get an incremented 'linknum'
			for (var i = 0; i < newMappedLinks.length; i++) {
				let link = this.mappedLinks[i];
				let previousLink = newMappedLinks[i - 1]
				link.arcDirection = 1;
				if (i != 0 && link.source == previousLink.source && link.target == previousLink.target) {
					link.linknum = previousLink.linknum + 1;
					link.arcDirection = (i % 2) == 0 ? 1 : 0;
				}
				else { link.linknum = 1; };
				//console.log("i = " + i +", link.linknum = " + link.linknum + ", link.arcDirection = " + link.arcDirection);
			};
		}

		return (newMappedLinks)
	}
	saveConnection(connectionToSave) {
		this.visualiseViewModel.saveConnection(connectionToSave).then(result => {
			if (!this.mappedLinks.find(link => link.internal_id == result.internal_id)) {
				this.mappedLinks.push({ payload: result, source: result.source, target: result.target, });
			}
			this.mappedLinks = this.sortMappedLinks(this.mappedLinks);
			this.updateForce();
			// this.mappedLinks = this.visualiseViewModel.links.map(link => {
			//     return {
			//         payload: link,
			//         // D3 seems to replace the "source" and "target" with an instance of the thing it references.
			//         // Copy the source and target from the payload to prevent chart data mixing with payload data.
			//         source: link.source,
			//         target: link.target,
			//     };
			// });

			// this.newForceChartPath = this.d3svg.selectAll(".chartPath").data(this.mappedLinks, d => d.payload.internal_id).enter()
			//     .append("path")
			//     .attr("class", "chartPath")
			//     .attr("id", d => d.payload.internal_id)
			// this.existingPaths = this.newForceChartPath.merge(this.existingPaths);

			// this.existingPaths.lower()
			//     .attr("fill", "transparent")
			//     .attr("stroke-width", this.visualiseViewModel.options[0].strokeWidth + "px")
			//     .attr("stroke", d => {
			//         var connectorColour = "gainsboro";
			//         if (d.payload.connector != null) {
			//             var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
			//             //console.log(connector);
			//             if (connector != null) {
			//                 connectorColour = connector.colour;
			//             }
			//         }
			//         return (connectorColour);
			//     })
			//     .attr("stroke-dasharray", d => {
			//         var dashPattern = "1, 0";
			//         if (d.payload.connector != null) {
			//             var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
			//             if (connector != null) {
			//                 var dash = ConnectorLines.dashes.find(dash => dash.name == connector.dash);
			//                 if (dash != null) {
			//                     dashPattern = dash.on + "," + dash.off;
			//                 }
			//             }
			//         }
			//         return (dashPattern);
			//     })
			//     .attr("class", d => {
			//         var classList = "chartPath";
			//         if (d.payload.connector != null) {
			//             if (d.payload.connector.colour == null) {
			//                 //console.log("chart_colour = " + d.connector.chart_colour);
			//                 classList += " .bg-secondary"
			//             }
			//         }
			//         return classList;
			//     })
			//     .attr("marker-end", d => {
			//         var markerEnd = "";
			//         if (d.payload.connector != null) {
			//             var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
			//             if (connector != null) {
			//                 markerEnd = "url(#" + "marker_" + connector.marker_id + ")";
			//             }
			//         }
			//         return markerEnd;
			//     })
			//     .on("mouseover", d => this.pathMouseOver(d, this.tooltip))
			//     .on("mouseout", d => this.pathMouseOut(d, this.tooltip))
			//     .on("click", d => this.pathClick(d))

			const { internal_id, identifier, description, type, source, target, connector } = result;
			var connectionToUpdate = d3.selectAll(".chartPath")
				.filter(d => d.payload.internal_id == internal_id).datum();
			if (connectionToUpdate.payload != null) {
				connectionToUpdate.payload.identifier = identifier;
				connectionToUpdate.payload.description = description;
				connectionToUpdate.payload.type = type;
				connectionToUpdate.payload.target = target;
				connectionToUpdate.payload.source = source;
				connectionToUpdate.payload.connector = connector;
			}
			this.forceGraph.force('link').links(this.mappedLinks, link => link.payload.internal_id);
			this.forceGraph.alpha(0.01)
			this.forceGraph.alpha(1).restart();

			//this.updateForce(this.mappedNodes, this.mappedLinks, null, null);
			console.log("Connection saved.")
		});
	}

	viewConnection(connectionInternal_id) {
		var connection = this.visualiseViewModel.links.find((c => c.internal_id == connectionInternal_id));
		this.connectionProperties.view(connection, this.saveConnection.bind(this));
	}

	viewFilter() {
		this.visualiseFilter.view(this.visualiseViewModel.filters[0], this.visualiseViewModel.saveFilter.bind(this.visualiseViewModel), this.visualiseViewModel.types, this.visualiseViewModel.connectors);
	}
	viewNode(nodeId) {
		var thing = null;
		if (nodeId != null) {
			thing = this.mappedNodes.find((thing => thing.payload.internal_id == nodeId));
		}
		this.thingProperties.view(this.chartNodeDefaultFill, thing.payload, this.saveThing.bind(this));
	}
	setupSVG() {
		d3.selectAll("#chartSVG").remove();
		this.d3svg = d3.select("#chart")
			.append("svg")
			.call(d3.zoom().on("zoom", (() => {
				console.log({ zoom: d3.event.transform, })
				this.d3svg.attr("transform", d3.event.transform)
			})).bind(this))
			.attr("id", "chartSVG")
			.attr("class", "visual xcontent")
			.attr("width", innerWidth)
			.attr("height", innerHeight)
			.on("click", (d) => {
				d3.event.preventDefault();
				console.log({ clickTracking: this.clickTracking });
				if (!this.nodeClicked && !this.inMenu) {
					this.toggleMenu("nodeContextMenu", "hide");
					this.toggleMenu("connectionContextMenu", "hide");
					//this.toggleMenu("canvasContextMenu", "hide");
					this.canvasClicked();
					console.log("svg > click()");
				}
				this.nodeClicked = false;
			})
			.on("mousemove", function () {
				//console.log(d3.mouse(this));
				var mouse = d3.mouse(this);
				var transform = d3.zoomTransform(d3.selectAll("#drawingArea").node());
				var xy1 = transform.invert(mouse);
				//console.log(mouse + ", " +  xy1);

				// Offset the coordinates slightly because the "click" event does not trigger for a node. The mouse coords are over part of the line.
				d3.select(".line")
					.attr("x2", xy1[0] - 1)
					.attr("y2", xy1[1] - 1)
			})
		this.defs = this.d3svg.append('defs')
		this.d3svg = this.d3svg
			.append("g")
			.attr("id", "drawingArea")
			.attr("class", "drawingArea");
		// Draw all items.
		this.DrawForce("chartSVG", this.mappedNodes, this.mappedLinks, null, null);
	}
	pathClick(d) {
		this.nodeClicking = true;
		const origin = {
			left: d3.event.pageX,
			top: d3.event.pageY,
			d: d
		};
		this.toggleMenu("nodeContextMenu", "hide");
		this.toggleMenu("canvasContextMenu", "hide");
		this.setPosition("connectionContextMenu", origin);
		this.nodeClicked = true;
		d3.event.preventDefault();
		this.nodeClicking = true;
	}
	canvasClicked() {
		this.nodeClicking = true;
		const origin = {
			left: d3.event.pageX,
			top: d3.event.pageY,
		};
		this.toggleMenu("nodeContextMenu", "hide");
		this.toggleMenu("connectionContextMenu", "hide");
		if (document.getElementById("canvasContextMenu").style.display == "block") {
			this.toggleMenu("canvasContextMenu", "hide");
		} else {
			this.setPosition("canvasContextMenu", origin);
		}
		this.nodeClicked = true;
		d3.event.preventDefault();
		this.nodeClicking = true;
	}

	nodeClick(d) {
		this.clickTracking = "node";
		console.log({ clickTracking: this.clickTracking });

		this.nodeClicking = true;
		console.log("Node clicked: " + d);
		for (var i = 1; i < 4; ++i) {
			var circle = d3.selectAll("g.xxx").filter(data => data.payload.internal_id == d.payload.internal_id).append("circle")
				.lower()
				.attr("class", "ripple")
				.attr("r", this.visualiseViewModel.options[0].nodeRadius)
				.style("stroke", d => d.payload.colour)
				.style("stroke-width", 5 / (i))
				.transition()
				.delay(Math.pow(i, 2.5) * 50)
				.duration(2000)
				.ease(d3.easeQuad)
				.attr("r", 50)
				.style("stroke-opacity", 0)
				.on("end", function () {
					d3.select(this).remove();
				});
		}
		// console.log(d3.event);
		const origin = {
			left: d3.event.pageX,
			top: d3.event.pageY,
			d: d
		};
		this.toggleMenu("connectionContextMenu", "hide");
		this.toggleMenu("canvasContextMenu", "hide");
		//this.setPosition("nodeContextMenu", origin);
		this.clickTracking = "none";
		this.nodeClicked = true;
		d3.event.preventDefault();
		this.nodeClicking = true;
		if (visualiseView.connectionFrom_InternalId != null) {
			this.connectionProperties.view(null, this.saveConnection.bind(this), visualiseView.connectionFrom_InternalId, d.payload.internal_id)
			$("#connectionModal").modal();
			visualiseView.connectionFrom_InternalId = null;
			d3.select(".line").remove();
		}
	}


	updateDescriptors() {
		var rowCount = 2;
		const { strength, maxDistance, fill_colour, linkRadius, strokeWidth } = this.visualiseViewModel.options[0];
		var nodeRadius = 25;
		// Get the bottom-most element on the chart and add the descriptors just below that.
		var nodesMaxY = Math.max(...this.mappedNodes.map(node => node.y)) + nodeRadius;
		var sortedDescriptors = this.mappedNodes
			.sort((a, b) => {
				// console.log({ identifierA: a.payload.identifier, identifierB: b.payload.identifier, lessThan: a.payload.identifier < b.payload.identifier });
				return ("" + a.payload.identifier).localeCompare(b.payload.identifier);
			});
		var cellsPerRow = Math.ceil(this.mappedNodes.length / rowCount);
		var descriptorArea = null;
		if (document.getElementById("descriptorArea") == null) {
			descriptorArea = this.d3svg.append("g")
				.attr("class", "descriptorArea")
				.attr("id", "descriptorArea")
			this.dragHandler(descriptorArea)
		}
		else {
			descriptorArea = this.d3svg.select("#descriptorArea");
		}

		var existingDescriptors = descriptorArea.selectAll(".descriptor")
			.data(sortedDescriptors, d => d.payload.internal_id);

		var enteringDescriptors = existingDescriptors.enter();
		var exitingDescriptors = existingDescriptors.exit();
		var descriptorWidth = 300;
		var descriptorHeight = 200;
		var style = window.getComputedStyle(document.getElementById("drawingArea"), null).getPropertyValue('font-size');
		var fontSize = parseFloat(style);

		exitingDescriptors.remove();

		//console.log("Updating descriptors");
		var newDescriptorNodes = enteringDescriptors
			.append("g")
			.attr("id", (d, i) => "descriptor" + i)
			.attr("class", "descriptor")

		newDescriptorNodes
			.append("rect")
			.attr("width", descriptorWidth)
			.attr("height", descriptorHeight)
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("fill", "white")
			.attr("rx", 3)
			.attr("ry", 3)


		newDescriptorNodes
			.append("circle")
			.attr("transform", "translate(" + (nodeRadius + 5) + ", " + (nodeRadius + 5) + ")")
			.attr("class", "chartNode bgcolor")
			.attr("stroke", (d) => {
				var foundType = this.visualiseViewModel.types.find((item) => { return d.payload.type == item.internal_id });
				var colour = "black";
				if (foundType != null) {
					colour = foundType.colour;
					d.payload.colour = colour;
				}
				return colour;
			})
			.on("click", d => this.nodeClick(d))

		newDescriptorNodes
			.append("image")
			.attr("transform", "translate(" + (nodeRadius + 5) + ", " + (nodeRadius + 5) + ")")
			.attr("class", "cursor-pointer")
			.on("click", d => this.nodeClick(d))

		newDescriptorNodes
			.append("foreignObject")
			.attr("class", "descriptorTitle")
			.attr("transform", "translate(" + (nodeRadius * 2 + 10) + ", " + (nodeRadius + 5 + fontSize / 2) + ")")
			.attr("width", descriptorWidth - 5)
		//.attr("style", "font-weight: bold;")

		newDescriptorNodes
			.append("foreignObject")
			.attr("class", "descriptorText")
			.attr("y", (nodeRadius * 2) + 10)
			.attr("x", 5)
			.attr("width", descriptorWidth - 5)
			.attr("height", descriptorHeight)

		existingDescriptors = newDescriptorNodes.merge(existingDescriptors);

		var fixedRadius = 25;
		existingDescriptors.selectAll("image")
			.attr("href", d => "data:image/png;base64, " + btoa(d.payload.custom_image))
			.attr("x", (-fixedRadius / 2) * 1.3)
			.attr("y", (-fixedRadius / 2) * 1.3)
			.attr("width", (fixedRadius * 1.3))
			.attr("height", (fixedRadius * 1.3));

		existingDescriptors.selectAll("circle")
			.attr("r", fixedRadius)
			.attr("stroke-width", strokeWidth + "px")
			.attr("fill", d => d.payload.fill_colour == null ? fill_colour : d.payload.fill_colour);

		existingDescriptors.selectAll(".chartNode.bgcolor")
			.attr("stroke", (d) => {
				var foundType = this.visualiseViewModel.types.find((item) => { return d.payload.type == item.internal_id });
				var colour = "black";
				if (foundType != null) {
					colour = foundType.colour;
					d.payload.colour = colour;
				}
				return colour;
			});

		this.d3svg.selectAll(".descriptorArea")
			.attr("transform", (d, i) => {
				// console.log({descriptorAreaY: (nodesMaxY + 50) * i/2 });
				return ("translate(" + i * (descriptorWidth + 10) + ", " + (nodesMaxY + 50) + ")");
			});
		this.d3svg.selectAll(".descriptor")
			.attr("transform", (d, i) => {
				let transformString = "translate(" + (i % cellsPerRow) * (descriptorWidth + 10) + ", " + (descriptorHeight * Math.floor(i / cellsPerRow) + (10 * Math.floor(i / cellsPerRow))) + ")";
				//console.log(transformString);
				return (transformString);
				//                return ("translate(" + i * (descriptorWidth *  descriptorWidth + 10) + ", " + descriptorHeight * Math.floor(i/2) + ")");
			});

		existingDescriptors.selectAll(".descriptorTitle")
			.text(d => {
				//console.log({ identifier: d.payload.identifier});
				return (d.payload.identifier);
			});

		existingDescriptors.selectAll("foreignObject")
			.text(d => {
				//console.log("d.payload.description: " + d.payload.description);
				return d.payload.description;
			});

	}

	DrawForce(svgId, nodes, links, types, connectors) {

		//d3.selectAll("#" + svgId + " > *").remove();
		// set the dimensions and margins of the graph
		var el = document.getElementById(svgId);
		var rect = el.getBoundingClientRect()
		var width = rect.width;
		var height = rect.height;

		//        createFilters(this.defs)
		this.forceGraph = d3.forceSimulation()
			.force('link', d3.forceLink().id(d => d.payload.internal_id))
			.force('charge', d3.forceManyBody().strength(this.visualiseViewModel.options[0]? this.visualiseViewModel.options[0].strength : 1000).distanceMax(this.visualiseViewModel.options[0]? this.visualiseViewModel.options[0].maxDistance : 500))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.on('tick', this.ticked.bind(this))
		//.stop();
		//.on("end", this.updateDescriptors(this.mappedNodes, null, null))
		this.forceGraph.alphaTarget(0);
		//this.forceGraph.tick(300);
		//Set up the tooltip (invisible to start with)
		this.tooltip = d3.select("body").append("div")
			.attr("class", "chartTooltip")
			.style("opacity", 0)

		this.textBlock = d3.select("#drawingArea")
			.append("text")
			.attr("dy", -5)
			.attr("id", "path_text")

		// d3.select("#drawingArea")
		//     .on("mouseover", (d, i) => {
		//         console.log("mouseover")
		//         var yyy = document.getElementsByClassName("line");
		//         if ((yyy != null) && (yyy.length > 0)) {
		//             console.log("move the line!");
		//         }

		//     })

		this.updateForce();
	}

	//    updateForce(nodes, links, types, connectors, tooltip) {
	oldStrength = 0;
	oldMaxDistance = 0;
	updateForce() {
		//console.assert(this.visualiseViewModel.options[0] != null, "No default options found.");
		//const { strength, maxDistance, nodeRadius, fill_colour, linkRadius, strokeWidth } = this.visualiseViewModel.options[0];
		const strength = -10500;
		const maxDistance = 500;
		const nodeRadius = 10;
		const fill_colour = 0xfff;
		const linkRadius = 200;
		const strokeWidth = 2;

		if (this.visualiseViewModel.options[0] != null) {
			let refreshChart = (this.oldStrength != strength);
			refreshChart = refreshChart || (this.oldMaxDistance != maxDistance);
			this.forceGraph.force('charge', d3.forceManyBody().strength(strength).distanceMax(maxDistance));
			if (refreshChart) {
				this.forceGraph.alpha(0.01)
				this.forceGraph.alpha(1).restart();
			}
		}
		this.visualiseViewModel.markers.forEach(marker => {
			marker.width = "5px";
			marker.height = "5px";
		})
		// Create the markers (end point symbols) within the SVG before their used on paths.
		ConnectorLines.createMarker(this.defs, this.visualiseViewModel.markers, "", parseInt(nodeRadius) + (parseInt(strokeWidth) + 2), -1.5);

		this.createLegend("#legend", this.visualiseViewModel.linkProperties, "5px", "5px", this.tooltip);
		// console.table(nodes);
		this.mappedLinks = this.sortMappedLinks(this.mappedLinks);
		if (this.mappedLinks != null) {

			// #region Paths
			this.existingPaths = this.d3svg.selectAll(".chartPath").data(this.mappedLinks, d => d.payload.internal_id);
			var enteringPaths = this.existingPaths.enter();
			var exitingPaths = this.existingPaths.exit();

			// console.log({
			//     existing: this.existingPaths,
			//     entering: enteringPaths,
			//     exiting: exitingPaths,
			// });

			exitingPaths.remove();
			// Setup the links
			this.newForceChartPath = enteringPaths
				.append("path")
				.attr("class", "chartPath")
				.attr("id", d => d.payload.internal_id)
				.lower()
				.attr("fill", "transparent")
				.on("mouseover", d => this.pathMouseOver(d, this.tooltip))
				.on("mouseout", d => this.pathMouseOut(d, this.tooltip))
				.on("click", d => this.pathClick(d))

			this.existingPaths = this.newForceChartPath.merge(this.existingPaths);

			this.existingPaths
				.attr("stroke-width", strokeWidth + "px")
				.attr("stroke", d => {
					var connectorColour = "gainsboro";
					if (d.payload.connector != null) {
						var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
						//console.log(connector);
						if (connector != null) {
							connectorColour = connector.colour;
						}
					}
					return (connectorColour);
				})
				.attr("stroke-dasharray", d => {
					var dashPattern = "1, 0";
					if (d.payload.connector != null) {
						var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
						if (connector != null) {
							var dash = ConnectorLines.dashes.find(dash => dash.name == connector.dash);
							if (dash != null) {
								dashPattern = dash.on + "," + dash.off;
							}
						}
					}
					return (dashPattern);
				})
				.attr("class", d => {
					var classList = "chartPath";
					if (d.payload.connector != null) {
						if (d.payload.connector.colour == null) {
							//console.log("chart_colour = " + d.connector.chart_colour);
							classList += " .bg-secondary"
						}
					}
					return classList;
				})
				.attr("marker-end", d => {
					var markerEnd = "";
					if (d.payload.connector != null) {
						var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
						if (connector != null) {
							markerEnd = "url(#" + "marker_" + connector.marker_id + ")";
						}
					}
					return markerEnd;
				});

			this.existingTexts = this.textBlock.selectAll(".pathText").data(this.mappedLinks, d => d.payload.internal_id);
			var enteringTexts = this.existingTexts.enter();
			var exitingTexts = this.existingTexts.exit();

			exitingTexts.remove();

			var enteringTextTags = enteringTexts
				.append("textPath")
				.attr("class", "pathText")
				.attr("startOffset", "50%")
				.attr("text-anchor", "middle")
				.attr("href", d => "#" + d.payload.internal_id)
			this.existingTexts = enteringTextTags.merge(this.existingTexts);

			if (this.visualiseViewModel.options[0] && this.visualiseViewModel.options[0].pathLabels) {
				this.existingTexts
					.text(d => {
						let pathLabel = "";
						if (d.payload.identifier == "") {
							var connector = this.visualiseViewModel.linkProperties.find(c => c.internal_id == d.payload.connector);
							pathLabel = connector.identifier;
						}
						else {
							pathLabel = d.payload.identifier;
						}
						return (pathLabel);
					});
			}
		}
		// #endregion
		// #region Nodes
		if (this.mappedNodes != null) {
			this.existingNodes = this.d3svg.selectAll("g.xxx").data(this.mappedNodes, d => d.payload.internal_id);
			var enteringNodes = this.existingNodes.enter();
			var exitingNodes = this.existingNodes.exit();

			exitingNodes.remove();

			var newForceChartNodes = enteringNodes
				.append("g")
				.attr("class", "xxx")
				.attr("internal_id", d => d.payload.internal_id)
				.call(d3.drag()
					.on("start", () => {
						console.log("Node Dragging started...")
						this.dragging = true;
						//if (!this.inMenu) 
						return this.dragstarted.bind(this)
					})
					.on("drag", this.dragged.bind(this))
					.on("end", this.dragended.bind(this)))
				// .on("mouseout", function (d, i) {
				//     var stuff = newForceChartNodes
				//     .selectAll('.nodeMenu');
				//     stuff.remove();
				// })
				.on("mouseenter", function (d, i) {
					visualiseView.nodeMouseOver(d, visualiseView.tooltip);
					if ((visualiseView.connectionFrom_InternalId == null) && !this.dragging) {
						let x = d.x;
						let y = d.y;
						var data = [
							{
								value: 1,
								action: "Properties",
								icon: "f05a",
								nodeId: d.payload.internal_id,
							},
							{
								value: 1,
								action: "Delete",
								icon: "f1f8",
								nodeId: d.payload.internal_id,
							},
							{
								value: 1,
								action: "Link",
								icon: "f0c1",
								nodeId: d.payload.internal_id,
							},
						];
						var pie = d3.pie()
							.value(d => d.value.value)
						//.padAngle(0.005)
						var data_ready = pie(d3.entries(data))

						var arc = d3.arc()
							.innerRadius(nodeRadius + 1)
							.outerRadius(nodeRadius + 40)
							.cornerRadius(1);

						newForceChartNodes.filter(e => e.payload.internal_id == d.payload.internal_id)
							// menu
							.selectAll('.labelName')
							.data(data_ready)
							.enter()
							.append('text')
							.attr("class", "fas icon labelName")
							.attr('d', arc)
							.attr('transform', d => {
								let pos = arc.centroid(d);
								pos[0] = pos[0] - 10;
								pos[1] = pos[1] + 10;
								//console.log(pos);
								return 'translate(' + pos + ')';
							})
							.text(d => {
								//console.log(d);
								return ((d.data.value.icon.length == 0) ? "" : String.fromCharCode(parseInt(d.data.value.icon, 16)));
							})
							.on("mouseenter", (d, i) => {
								visualiseView.stillInMenu = true;
							})
							.on("mouseout", (d, i) => {
								visualiseView.stillInMenu = false;
							})
							.html(d => {
								return `<a class="fas icon labelName" href="#">${((d.data.value.icon.length == 0) ? "" : String.fromCharCode(parseInt(d.data.value.icon, 16)))}</a>`
							});
						newForceChartNodes.filter(e => e.payload.internal_id == d.payload.internal_id)
							//menu
							.selectAll('.nodeMenuItem')
							.data(data_ready)
							.enter()
							.append('path')
							.attr("class", "nodeMenuItem cursor-pointer")
							.on("click", (data, i) => {
								console.log("Clicked -->", data);
								if (data.data.value.action == "Properties") {
									$("#thingModal").modal();
									visualiseView.viewNode(data.data.value.nodeId);
								} else if (data.data.value.action == "Link") {
									d3.select("#drawingArea")
										.select(".line")
										.remove();
									// var xxx = d3.select("#drawingArea");
									var mouse = d3.mouse(document.getElementById("drawingArea"));
									// Don't update the connection start id if a connection is already being made from a node.
									if (document.getElementsByClassName("line").length == 0) {
										visualiseView.connectionFrom_InternalId = data.data.value.nodeId;
									}
									d3.select("#drawingArea")
										.append("line")
										.attr("x1", x)
										.attr("y1", y)
										.attr("x2", mouse[0])
										.attr("y2", mouse[1])
										.attr("class", "line")
										.on("click", d => console.log("line click"))
									//.attr("transform", "translate(" + 300 / 2 + ", " + 300 / 2 + ")")

								}
								visualiseView.nodeClicked = true;
							})
							.attr('d', arc)
							.style("opacity", 0.2)
							//.style("stroke-width", "2px")
							.on("mouseout", d => {
								if (!visualiseView.stillInMenu) {
									var stuff = newForceChartNodes
										.selectAll('.nodeMenuItem');
									stuff.remove();
									stuff = newForceChartNodes
										.selectAll('.labelName');
									stuff.remove();
									visualiseView.inMenu = false;
									visualiseView.nodeClicked = false;
									visualiseView.nodeMouseOut(d, visualiseView.tooltip)
								}
							})
							.on("mouseenter", d => {
								console.log("nodeMenuItem --> mouseenter")
								visualiseView.inMenu = true && !this.dragging;
							})
					}
				})

			newForceChartNodes
				.append("text")
				.attr("class", "chartText")
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.on("click", d => this.nodeClick(d))

			newForceChartNodes.append("circle")
				.attr("class", "chartNode bgcolor")
				.on("click", d => this.nodeClick(d))

			// newForceChartNodes
			//     .filter(d => d.payload.custom_image == null)
			//     .append("text")
			//     .attr("class", "fa icon")
			//     .attr("text-anchor", "middle")
			//     .attr("alignment-baseline", "middle")
			//     .on("click", d => this.nodeClick(d))
			//     .on("mouseover", d => {
			//         this.nodeMouseOver(d, tooltip)
			//     })
			//     .on("mouseout", d => {
			//         this.nodeMouseOut(d, this.tooltip);
			//     })

			this.existingNodes.selectAll("image")
				.filter(d => {
					const nodeType = this.visualiseViewModel.types.find(type => type.internal_id == d.payload.type);
					return !((d.payload.custom_image != null) || ((nodeType != null) && (nodeType.custom_image != null)));
				})
				.remove();

			newForceChartNodes
				.filter(d => {
					const nodeType = this.visualiseViewModel.types.find(type => type.internal_id == d.payload.type);
					return ((d.payload.custom_image != null) || ((nodeType != null) && (nodeType.custom_image != null)));
				})
				.append("image")
				//.attr("class", "cursor-pointer")
				.on("click", d => this.nodeClick(d))
				.on("mouseover", d => {
					this.nodeMouseOver(d, this.tooltip);

				})
				.on("mouseout", d => {
					this.nodeMouseOut(d, this.tooltip);
				})

			this.existingNodes = newForceChartNodes.merge(this.existingNodes)

			this.existingNodes.selectAll("image")
				.attr("href", d => {
					const nodeType = this.visualiseViewModel.types.find(type => type.internal_id == d.payload.type);
					let nodeImage = d.payload.custom_image;
					if ((nodeImage == null) && (nodeType != null)) {
						nodeImage = nodeType.custom_image;
					}
					// else {
					//     nodeImage = d.payload.custom_image;
					// }
					if ((nodeImage != null) && (nodeImage.length > 0)) {
						return ("data:image/png;base64, " + btoa(nodeImage));
					}
				})
				.attr("x", (-nodeRadius / 2) * 1.3)
				.attr("y", (-nodeRadius / 2) * 1.3)
				.attr("width", (nodeRadius * 1.3))
				.attr("height", (nodeRadius * 1.3))

			this.existingNodes.selectAll("g.xxx")
				.attr("data-original-title", d => d.payload.description);

			this.existingNodes.selectAll("circle")
				.attr("r", nodeRadius)
				.attr("stroke-width", strokeWidth + "px")
				.attr("fill", d => {
					const nodeType = this.visualiseViewModel.types.find(type => type.internal_id == d.payload.type);
					let fill_colour = 0;
					if ((d.payload.fill_colour == null) && (nodeType != null) && (nodeType.background_colour != null)) {
						fill_colour = nodeType.background_colour;
					}
					else {
						fill_colour = d.payload.fill_colour;
					}
					return (fill_colour);
				})

			if (this.visualiseViewModel.options[0] && this.visualiseViewModel.options[0].nodeLabels) {
				this.existingNodes.selectAll(".chartText")
					.text(d => {
						//console.log(d);
						return d.payload.identifier;
					})
					.attr("y", (1.3 * nodeRadius));
			}

			this.existingNodes.selectAll(".chartNode.bgcolor")
				.attr("stroke", (d) => {
					var foundType = this.visualiseViewModel.types.find((item) => { return d.payload.type == item.internal_id });
					var colour = "black";
					if (foundType != null) {
						//                console.log(foundType.chart_colour);
						colour = foundType.colour;
						d.payload.colour = colour;
					}
					return colour;
				})
			// this.existingNodes.selectAll(".fa.icon")
			//     .text((d) => {
			//         var foundType = this.visualiseViewModel.types.find((item) => { return d.payload.type == item.internal_id });
			//         if (foundType != null) {
			//             return String.fromCharCode(parseInt(foundType.iconCode, 16));
			//         }
			//     })
			this.forceGraph.nodes(this.mappedNodes, node => node.payload.internal_id);
			// #endregion

			if (this.mappedLinks != null) {
				this.forceGraph.force('link').links(this.mappedLinks, link => link.payload.internal_id);
			}
			//console.log("drawn");

		}
	}
	ticked() {
		//console.log("ticked")
		if (this.existingPaths != null) {
			this.existingPaths.attr("d", this.linkArc.bind(this));
		}
		if (this.existingTextPaths != null) {
			this.existingTextPaths.attr("d", this.textArc.bind(this));
		}

		if (this.existingNodes != null) {
			// Recalculate node position
			this.existingNodes.call(this.updateNode.bind(this));
		}
		//if (this.forceGraph.alpha() <= this.forceGraph.alphaMin()) {
		//this.updateDescriptors(this.mappedNodes, null, null)
		//}
		//console.log({ alpha: this.forceGraph.alpha(), alphaTarget: this.forceGraph.alphaTarget(), alphaDecay: this.forceGraph.alphaDecay() });
	}
	linkArc(d) {
		//console.log(d.set);
		var dr = 0;
		if (d.set != 1) { dr = this.visualiseViewModel.options[0].linkRadius / d.linknum; } //linknum is defined above
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
	}
	textArc(d) {
		var dr = this.visualiseViewModel.options[0].linkRadius / d.linknum; //linknum is defined above
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
	}

	linkLine(d) {
		var dr = this.visualiseViewModel.options[0].linkRadius / d.linknum; //linknum is defined above
		return "M" + d.source.x + "," + d.source.y + "A" + 0 + "," + 0 + " 0 0," + 0 + " " + d.target.x + "," + d.target.y;
	}

	nodeMouseOver(d, tooltip) {
		if (tooltip != null) {
			tooltip.transition()
				.duration(200)
				.style("opacity", 0.9);
			tooltip.html(() => {
				const nodeType = this.visualiseViewModel.types.find(type => type.internal_id == d.payload.type);
				return (`<strong>${d.payload.identifier} (${nodeType.identifier})</strong><div>${d.payload.description}</div>`);
			})
				.style("left", (d3.event.pageX + 70) + "px")
				.style("top", (d3.event.pageY - 70) + "px");
		}
		// if (document.getElementsByClassName("line").length > 0) {
		//     visualiseView.connectionFrom_InternalId = d.payload.internal_id;
		// }
	}
	nodeMouseOut(d, tooltip) {
		if (tooltip != null) {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		}

	}
	pathMouseOver(d, tooltip) {
		if (tooltip != null) {
			tooltip.transition()
				.duration(200)
				.style("opacity", 0.9);
			tooltip.html(`<strong>${d.payload.identifier}</strong><div>${d.payload.description}</div>`)
				.style("left", (d3.event.pageX + 20) + "px")
				.style("top", (d3.event.pageY - 20) + "px");
		}

	}
	pathMouseOut(d, tooltip) {
		if (tooltip != null) {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		}

	}
	fixna(x) {
		if (isFinite(x)) return x;
		return 0;
	}

	updateNode(node) {
		node
			.attr("cx", node => node.x)
			.attr("cy", node => node.y)
			.attr("transform", ((d) => {
				//console.log(d);
				return "translate(" + this.fixna(d.x) + "," + this.fixna(d.y) + ")";
			}));
	}
	createLegend(containerName, connectors, markerHeight, markerWidth, tooltip) {
		d3.selectAll(".legendArea" + " > *").remove();
		var legendArea = this.d3svg.selectAll(".legendArea").data(["nothing text"]);
		var enteringLegendArea = legendArea.enter();
		var enteringLegendAreaNode = enteringLegendArea.append("g")
			.attr("class", "legendArea")
			.attr("transform", "translate(100, 100)")
		enteringLegendAreaNode
			.append("text")
			.attr("class", "keyTitle")
			.text("Key")
		enteringLegendAreaNode.append("rect")
			.attr("class", "legendContainer")
			// .attr("width", "100px")
			// .attr("height", "100px")
			.attr("stroke-width", "2px")
			.attr("stroke", "blue");



		this.dragHandler(enteringLegendAreaNode)

		legendArea = enteringLegendAreaNode.merge(legendArea);


		if (connectors != null) {
			d3.selectAll(containerName + " > *").remove();
			var legendContainer = legendArea
				.append("svg")
				.attr("width", "250px")
				.attr("height", (connectors.length * 20) + 10 + "px")
				.attr("id", "legend_svg")

			var defs = legendContainer.append("defs");
			defs.selectAll("marker").data(this.visualiseViewModel.markers).enter()
				.append('marker')
				.attr('id', function (d) {
					return 'marker_' + d.internal_id + "legend";
				})
				.attr('markerUnits', 'strokeWidth')
				.attr('orient', 'auto')
				.attr('viewBox', function (d) { return d.viewbox })
				.append('path')
				.attr('d', (d) => d.path)
				.attr('fill', (d, i) => d.colour);

			var legendAll = legendContainer.selectAll(".legenditem").data(connectors.map(connector => {
				return ({ payload: connector });
			}));
			var legendEnter = legendAll.enter();
			var legendExit = legendAll.exit();

			var legendNodes = legendEnter.append("g")
				.attr("transform", "translate(0, 0)");

			legendNodes
				.append("line")
				.attr("class", "legendItem")
				.attr("x1", 0)
				.attr("y1", (d, i) => { return (20 * (i + 1)); })
				.attr("x2", 50)
				.attr("y2", (d, i) => { return (20 * (i + 1)); })
				.style("stroke", d => d.payload.colour)
				.style("stroke-width", 4)
				.attr("stroke-dasharray", d => {
					var dashType = ConnectorLines.dashes.find(dash => dash.name == d.payload.dash);
					if (dashType != null) {
						return dashType.on + " " + dashType.off;
					}
				})
				.attr('marker-end', (d, i) => { return "url(#marker_" + d.payload.marker_id + "legend)"; })
				.on("mouseover", d => {
					this.nodeMouseOver(d, tooltip)
				})
				.on("mouseout", d => {
					this.nodeMouseOut(d, this.tooltip);
				})

			legendNodes.append("text")
				.attr("class", "chartText")
				.text((d) => d.payload.identifier)
				.attr("x", 70)
				.attr("y", (d, i) => { return (20 * (i + 1) + 5); })
				.on("mouseover", d => {
					this.nodeMouseOver(d, tooltip)
				})
				.on("mouseout", d => {
					this.nodeMouseOut(d, this.tooltip);
				})

			legendExit.remove();
		}
	}
	createLegend2(containerName, connectors, markerHeight, markerWidth, tooltip) {
		if (connectors != null) {
			d3.selectAll(containerName + " > *").remove();
			var legendContainer = d3.selectAll(containerName)
				.append("svg")
				.attr("width", "250px")
				.attr("height", (connectors.length * 20) + 10 + "px")
				.attr("id", "legend_svg")

			var defs = legendContainer.append("defs");
			defs.selectAll("marker").data(this.visualiseViewModel.markers).enter()
				.append('marker')
				.attr('id', function (d) {
					return 'marker_' + d.internal_id + "legend";
				})
				.attr('markerUnits', 'strokeWidth')
				.attr('orient', 'auto')
				.attr('viewBox', function (d) { return d.viewbox })
				.append('path')
				.attr('d', (d) => d.path)
				.attr('fill', (d, i) => d.colour);

			var legendAll = legendContainer.selectAll(".legenditem").data(connectors.map(connector => {
				return ({ payload: connector });
			}));
			var legendEnter = legendAll.enter();
			var legendExit = legendAll.exit();

			var legendNodes = legendEnter.append("g")
				.attr("transform", "translate(0, 0)");

			legendNodes
				.append("line")
				.attr("class", "legendItem")
				.attr("x1", 0)
				.attr("y1", (d, i) => { return (20 * (i + 1)); })
				.attr("x2", 50)
				.attr("y2", (d, i) => { return (20 * (i + 1)); })
				.style("stroke", d => d.payload.colour)
				.style("stroke-width", 4)
				.attr("stroke-dasharray", d => {
					var dashType = ConnectorLines.dashes.find(dash => dash.name == d.payload.dash);
					if (dashType != null) {
						return dashType.on + " " + dashType.off;
					}
				})
				.attr('marker-end', (d, i) => { return "url(#marker_" + d.payload.marker_id + "legend)"; })
				.on("mouseover", d => {
					this.nodeMouseOver(d, tooltip)
				})
				.on("mouseout", d => {
					this.nodeMouseOut(d, this.tooltip);
				})

			legendNodes.append("text")
				.attr("class", "chartText")
				.text((d) => d.payload.identifier)
				.attr("x", 70)
				.attr("y", (d, i) => { return (20 * (i + 1) + 5); })
				.on("mouseover", d => {
					this.nodeMouseOver(d, tooltip)
				})
				.on("mouseout", d => {
					this.nodeMouseOut(d, this.tooltip);
				})

			legendExit.remove();
		}
	}
	startX = 0;
	startY = 0;
	dragHandler = d3.drag()
		.on("start", function () {
			var current = d3.select(this);
			// self.deltaX = current.attr("transform"). - d3.event.x;
			// self.deltaY = current.attr("y") - d3.event.y;

			self.startX = d3.event.x;
			self.startY = d3.event.y;
		})
		.on("drag", function () {
			console.log("draghandler drag");
			d3.select(this)
				.attr("transform", "translate(" + (d3.event.x) + ", " + (d3.event.y) + ")");
			// .attr("x", d3.event.x)
			// .attr("y", d3.event.y);
		});
	dragstarted(d) {
		console.log("dragstarted")
		this.dragging = true;
		var stuff = newForceChartNodes
			.selectAll('.nodeMenuItem');
		stuff.remove();
		stuff = newForceChartNodes
			.selectAll('.labelName');
		stuff.remove();
		console.log("draghandler started");
		d3.event.sourceEvent.stopPropagation();
		if (!d3.event.active) this.forceGraph.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
		// console.log("dragging");
	}

	dragended(d) {
		if (!d3.event.active) this.forceGraph.alphaTarget(0);
		d.fx = null;
		d.fy = null;
		this.dragging = false;
	}
	menuVisible = false;

	toggleMenu(menuName, visibility) {
		var menu = document.getElementById(menuName);
		menu.style.display = visibility === "show" ? "block" : "none";
		this.menuVisible = !this.menuVisible;
	};

	setPosition(menuName, position) {
		var menu = document.getElementById(menuName);
		menu.style.left = `${position.left}px`;
		menu.style.top = `${position.top}px`;
		if (position.d != null) {
			menu.dataset.internal_id = position.d.payload.internal_id;
		}
		this.toggleMenu(menuName, "show");
	};
	export() {
		this.visualiseViewModel.exportAll().then(results => {
			var exportJSON = document.createElement("a");
			var blob = new Blob([JSON.stringify(results)], { type: "text/JSON; charset=utf-8;" });
			var url = URL.createObjectURL(blob);
			exportJSON.href = url;
			exportJSON.setAttribute("download", "export.JSON");
			exportJSON.click();
		});
	}
	// importJiras() {
	//     var inputFileDialog = document.createElement("input");
	//     inputFileDialog.type = "file";
	//     inputFileDialog.addEventListener("change", event => {
	//         console.log(event);
	//         var importFile = event.target.files[0];
	//         if (importFile != null) {
	//             var fileReader = new FileReader();
	//             fileReader.onload = e => {
	//                 this.visualiseViewModel.importJiras(e.target.result).then(items => {
	//                     this.setupSVG();
	//                     // Create the markers (end point symbols) within the SVG before their used on paths.
	//                     ConnectorLines.createMarker(this.defs, this.visualiseViewModel.markers, "", 21, -1.5);
	//                     this.DrawForce("chartSVG", this.mappedNodes, this.mappedLinks, null, null);
	//                 });
	//             }
	//             fileReader.readAsText(importFile);
	//         }
	//     });
	//     inputFileDialog.click();
	// }
	// import() {
	//     var inputFileDialog = document.createElement("input");
	//     inputFileDialog.type = "file";
	//     inputFileDialog.addEventListener("change", event => {
	//         console.log(event);
	//         var importFile = event.target.files[0];
	//         if (importFile != null) {
	//             var fileReader = new FileReader();
	//             fileReader.onload = e => {
	//                 this.visualiseViewModel.importAll(e.target.result).then(results => {
	//                     this.setupSVG();
	//                     // Create the markers (end point symbols) within the SVG before their used on paths.
	//                     ConnectorLines.createMarker(this.defs, this.visualiseViewModel.markers, "", 21, -1.5);
	//                     // Map the nodes such that the data from the chart isn't mingling with the data from the node or link.
	//                     this.mappedNodes = this.visualiseViewModel.nodes.map(node => { return { payload: node }; });
	//                     this.mappedLinks = this.visualiseViewModel.links.map(link => {
	//                         return {
	//                             payload: link,
	//                             // D3 seems to replace the "source" and "target" with an instance of the thing it references.
	//                             // Copy the source and target from the payload to prevent chart data mixing with payload data.
	//                             source: link.source,
	//                             target: link.target,
	//                         };
	//                     });
	//                     //this.DrawForce("chartSVG", this.visualiseViewModel.nodes, this.visualiseViewModel.links, this.visualiseViewModel.types, this.visualiseViewModel.connectors);
	//                     this.updateForce();
	//                 });
	//             }
	//             fileReader.readAsText(importFile);
	//         }
	//     });
	//     inputFileDialog.click();
	// }
	saveSvg(svgEl, name) {
		svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		var svgData = svgEl.outerHTML;
		var preface = '<?xml version="1.0" standalone="no"?>\r\n';
		var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
		var svgUrl = URL.createObjectURL(svgBlob);
		var downloadLink = document.createElement("a");
		downloadLink.href = svgUrl;
		downloadLink.download = name;
		// document.body.appendChild(downloadLink);
		downloadLink.click();
		// document.body.removeChild(downloadLink);
	}

}
var visualiseView = null;
window.onload = () => {
	visualiseView = new VisualiseView();
}
