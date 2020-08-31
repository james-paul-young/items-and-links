const projects = (async () => {
	let projects = null;
	let sortOrder = null;
	let filter = null;

	const deleteRow = (row) => {
		projectsDB.delete(row.dataset.internal_id).then(result => {
			const table = document.getElementById("projectsTable");
			table.deleteRow(row.rowIndex);
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			Promise.allSettled([
				projectsDB.load(),
			]).then(results => {
				const loadedProjects = results[0].value;
				projects = loadedProjects
					.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier))
					.map(project => {
						return project;
					});
				resolve();
			});
		});
	}
	const create = () => {
		view(null);
	};
	const exportProjects = () => {
		const mappedProjects = curatedList().map(project => {
			const newProject = project;
			// const type = projectTypes.find(type => type.internal_id == project.type);
			// project.type = (type ? type.identifier : ""); '';
			return newProject;
		});

		const projects = mappedProjects;
		const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
		const header = Object.keys(projects[0])
		let csv = projects.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
		csv.unshift(header.join(','))
		csv = csv.join('\r\n')
		const exportJSON = document.createElement("a");
		const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		exportJSON.href = url;
		exportJSON.setAttribute("download", "projects.csv");
		exportJSON.click();
	};
	const setupEventHandlers = () => {
		const tabLink = document.getElementById("projects-tab");
		console.assert(tabLink != null, "Cannot find projects-tab");
		tabLink.addEventListener("click", event => {
			load().then(result => {
				list();
			});
		});

		const createProjectButton = document.getElementById("createProjectButton");
		createProjectButton.addEventListener("click", event => create());

		const exportProjectsButton = document.getElementById("exportProjectsButton");
		exportProjectsButton.addEventListener("click", event => exportProjects());

		const identifierSortOrderAction = document.getElementById("project-identifier-sort-order");
		identifierSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const descriptionSortOrderAction = document.getElementById("project-description-sort-order");
		descriptionSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const updatedSortOrderAction = document.getElementById("project-updated-sort-order");
		updatedSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const searchInput = document.getElementById("searchInput");
		if (searchInput != null) {
			searchInput.addEventListener("keyup", event => {
				const criteria = searchInput.value.toLowerCase();
				filter = project => project.identifier.toLowerCase().indexOf(criteria) >= 0;
				list();
			})
		}

	};
	// const exportAll = project => {
	//     var exportAllPromise = new Promise((resolve, reject) => {
	//         var all = {
	//             connections: null,
	//             connectors: null,
	//             things: null,
	//             types: null
	//         };

	//         Promise.all([this.connectionViewModel.loadConnections(), this.connectorViewModel.loadConnectors(), this.thingViewModel.loadThings(), this.typesViewModel.loadTypes()]).then(result => {
	//             all.connections = this.connectionViewModel.connections.copy();
	//             all.connectors = this.connectorViewModel.connectors.copy();
	//             all.things = this.thingViewModel.things.copy();
	//             all.types = this.typesViewModel.types.copy();
	//             all.project = this.active.copy();
	//             resolve(all);
	//         })
	//     })
	//     return (exportAllPromise);
	// }

	const getRowHTML = (project) => {
		return `
			<tr data-internal_id="${project.internal_id}" data-toggle="modal" data-target="#item-modal" class="item-row">
				<td>${project.active ? "true" : ""}</td>
				<td><nobr>${project.identifier}</nobr></td>
				<td>${project.description}</td>
				<td>${((project.updated == null) ? "" : project.updated.toString().substring(4, project.updated.toString().indexOf(" G")))}</td>
			</tr>
		`
	};
	let selectedRow = null;
	const save = (data) => {
		projectsDB.save(data).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const activateProject = projectToActivate => {
		projectToActivate.active = true;
		projectsDB.activate(projectToActivate).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const deleteProject = () => {
		deleteRow(selectedRow);
	}
	const view = (id) => {
		const projectModal = document.getElementById("projectModal");
		if (projectModal) {
			document.body.removeChild(projectModal);
		}
		document.body.appendChild(projectProperties.setup());
		const project = projects.find(project => project.internal_id == id);
		projectProperties.view(project, save, deleteProject, activateProject);
		$('#projectModal').modal();
	}

	const curatedList = () => {
		let sortFunction = null;
		if (sortOrder == null) {
			sortFunction = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
		}
		else {
			sortFunction = sortOrder;
		}
		let filterFunction = null;
		if (filter == null) {
			filterFunction = project => true;
		}
		else {
			filterFunction = filter;
		}
		const projectsList = projects
			.filter(filterFunction)
			.sort(sortFunction);
		return projectsList;
	}
	const list = () => {
		const curatedProjectsList = curatedList();
		const html = curatedProjectsList
			.map(project => getRowHTML(project));
		const table = document.getElementById("projectsTable");
		table.tBodies[0].innerHTML = html.join("");
		var rows = Array.from(table.querySelectorAll(".item-row"));
		rows.forEach(row => {
			row.addEventListener("click", event => {
				view(event.currentTarget.dataset.internal_id);
				selectedRow = event.currentTarget;
			});
		});
		const infoDisplay = document.getElementById("info");
		infoDisplay.innerHTML = `${curatedProjectsList.length} projects of ${projects.length} displayed.`;

	}
	load().then(result => {
		list();
		setupEventHandlers();
	});
})();
const items = (async () => {
	let items = null, links = null, linkTypes = null, itemTypes = null, activeProject = null;
	let sortOrder = null;
	let filter = null;
	let selectedRow = null;

	const deleteRow = (row) => {
		itemsDB.delete(row.dataset.internal_id).then(result => {
			const table = document.getElementById("items-table");
			table.deleteRow(row.rowIndex);
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			projectsDB.getActive().then(project => {
				activeProject = project;
				const activeProjectNameLabel = document.getElementById("items-active-project");
				activeProjectNameLabel.innerHTML = activeProject.identifier;
				Promise.allSettled([
					itemsDB.load(project.internal_id),
					itemTypesDB.load(project.internal_id),
					linksDB.load(project.internal_id),
					linkTypesDB.load(project.internal_id),
				]).then(results => {
					itemTypes = results[1].value;
					const loadedItems = results[0].value;
					items = loadedItems
						.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier))
						.map(item => {
							const type_id = item.type;
							item.type = itemTypes.find(type => type.internal_id == type_id);
							return item;
						});

					linkTypes = results[3].value;
					const loadedLinks = results[2].value;
					links = loadedLinks.map(link => {
						const source_id = link.source;
						link.source = items.find(item => item.internal_id == source_id);
						const target_id = link.target;
						link.target = items.find(item => item.internal_id == target_id);
						link.connector = linkTypes.find(connector => connector.internal_id == link.connector);
						return link;
					});
					resolve();
				});

			});
		});
	}
	const create = () => {
		view(null);
	};
	const exportItems = () => {
		const mappedItems = curatedList().map(item => {
			const newItem = item;
			const type = itemTypes.find(type => type.internal_id == item.type);
			newItem.type = (type ? type.identifier : ""); '';
			return newItem;
		});

		const items = mappedItems;
		const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
		const header = Object.keys(items[0])
		let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
		csv.unshift(header.join(','))
		csv = csv.join('\r\n')
		const exportJSON = document.createElement("a");
		const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		exportJSON.href = url;
		exportJSON.setAttribute("download", "items.csv");
		exportJSON.click();
	};
	const setupEventHandlers = () => {
		const tabLink = document.getElementById("items-tab");
		console.assert(tabLink != null, "Cannot find items-tab");
		tabLink.addEventListener("click", event => {
			load().then(result => {
				list();
			});
		});

		const createButton = document.getElementById("createItemButton");
		createButton.addEventListener("click", event => create());

		const exportButton = document.getElementById("exportItemsButton");
		exportButton.addEventListener("click", event => exportItems());

		const typeSortOrderAction = document.getElementById("item-type-sort-order");
		typeSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.type.identifier).localeCompare(b.type.identifier);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.type.identifier).localeCompare(b.type.identifier);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});

		const identifierSortOrderAction = document.getElementById("item-identifier-sort-order");
		identifierSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const descriptionSortOrderAction = document.getElementById("item-description-sort-order");
		descriptionSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const updatedSortOrderAction = document.getElementById("item-updated-sort-order");
		updatedSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const searchInput = document.getElementById("searchInput");
		if (searchInput != null) {
			searchInput.addEventListener("keyup", event => {
				const criteria = searchInput.value.toLowerCase();
				filter = item => (item.identifier.toLowerCase().indexOf(criteria) >= 0) || (item.description.toLowerCase().indexOf(criteria) >= 0) || (item.updated.toString().toLowerCase().indexOf(criteria) >= 0) || (item.type.identifier.toLowerCase().indexOf(criteria) >= 0);
				list();
			})
		}
	};

	const getRowHTML = (item) => {
		return `
			<tr data-internal_id="${item.internal_id}" data-toggle="modal" data-target="#item-modal" class="item-row">
				<td>${(item.type == null) ? "" : item.type.identifier}</td>
				<td><nobr>${item.identifier}</nobr></td>
				<td>${item.description}</td>
				<td>${((item.updated == null) ? "" : item.updated.toString().substring(4, item.updated.toString().indexOf(" G")))}</td>
			</tr>
		`
	};
	const save = (data) => {
		data.project_id = activeProject.internal_id;
		itemsDB.save(data).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const deleteItem = () => {
		deleteRow(selectedRow);
	}
	const view = (id) => {
		const itemModal = document.getElementById("item-modal");
		if (itemModal) {
			document.body.removeChild(itemModal);
		}
		document.body.appendChild(itemProperties.setup());
		const item = items.find(item => item.internal_id == id);
		itemProperties.view(item, null, save, items, links, linkTypes, itemTypes, null, deleteItem);
		$('#item-modal').modal();
	}

	const curatedList = () => {
		let sortFunction = null;
		if (sortOrder == null) {
			sortFunction = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
		}
		else {
			sortFunction = sortOrder;
		}
		let filterFunction = null;
		if (filter == null) {
			filterFunction = item => true;
		}
		else {
			filterFunction = filter;
		}
		let itemsList = null;
		if (items != null) {
			itemsList = items
				.filter(filterFunction)
				.sort(sortFunction);
		}
		return itemsList;
	}
	const list = () => {
		const curatedItemsList = curatedList();
		if (curatedItemsList != null) {
			const html = curatedItemsList
				.map(item => getRowHTML(item));
			const table = document.getElementById("items-table");
			table.tBodies[0].innerHTML = html.join("");
			var rows = Array.from(table.querySelectorAll(".item-row"));
			rows.forEach(row => {
				row.addEventListener("click", event => {
					view(event.currentTarget.dataset.internal_id);
					selectedRow = event.currentTarget;
				});
			});
			const infoDisplay = document.getElementById("info");
			infoDisplay.innerHTML = `${curatedItemsList.length} items of ${items.length} displayed.`;
		}
	}
	setupEventHandlers();
})();

const itemTypes = (async () => {
	let items = null, links = null, linkTypes = null, itemTypes = null, activeProject = null;
	let sortOrder = null;
	let filter = null;
	let selectedRow = null;

	const deleteRow = (row) => {
		itemTypesDB.delete(row.dataset.internal_id).then(result => {
			const table = document.getElementById("item-types-table");
			table.deleteRow(row.rowIndex);
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			projectsDB.getActive().then(project => {
				activeProject = project;
				const activeProjectNameLabel = document.getElementById("item-types-active-project");
				activeProjectNameLabel.innerHTML = activeProject.identifier;
				Promise.allSettled([
					itemTypesDB.load(project.internal_id),
				]).then(results => {
					itemTypes = results[0].value;
					resolve();
				});
			});
		});
	}
	const create = () => {
		view(null);
	};
	const exportItems = () => {
		const mappedItemTypes = curatedList().map(itemType => {
			const newItemType = itemType;
			return newItemType;
		});

		const itemTypes = mappedItemTypes;
		const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
		const header = Object.keys(itemTypes[0])
		let csv = itemTypes.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
		csv.unshift(header.join(','))
		csv = csv.join('\r\n')
		const exportJSON = document.createElement("a");
		const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		exportJSON.href = url;
		exportJSON.setAttribute("download", "item-types.csv");
		exportJSON.click();
	};
	const setupEventHandlers = () => {
		const tabLink = document.getElementById("item-types-tab");
		console.assert(tabLink != null, "Cannot find item-types-tab");
		tabLink.addEventListener("click", event => {
			load().then(result => {
				list();
			});
		});

		const createButton = document.getElementById("create-item-type");
		console.assert(createButton != null, "Cannot find create-item-type");
		createButton.addEventListener("click", event => create());

		const exportButton = document.getElementById("export-item-types");
		exportButton.addEventListener("click", event => exportItems());

		const identifierSortOrderAction = document.getElementById("item-type-identifier-sort-order");
		identifierSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const descriptionSortOrderAction = document.getElementById("item-type-description-sort-order");
		descriptionSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const updatedSortOrderAction = document.getElementById("item-type-updated-sort-order");
		updatedSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const searchInput = document.getElementById("searchInput");
		if (searchInput != null) {
			searchInput.addEventListener("keyup", event => {
				const criteria = searchInput.value.toLowerCase();
				filter = itemType => (itemType.identifier.toLowerCase().indexOf(criteria) >= 0) || (itemType.description.toLowerCase().indexOf(criteria) >= 0) || (itemType.updated.toString().toLowerCase().indexOf(criteria) >= 0) || (itemType.type.identifier.toLowerCase().indexOf(criteria) >= 0);
				list();
			})
		}
	};

	const getRowHTML = (itemType) => {
		return `
			<tr data-internal_id="${itemType.internal_id}" data-toggle="modal" data-target="#item-type-modal" class="item-row">
				<td><nobr>${itemType.identifier}</nobr></td>
				<td>${itemType.description}</td>
				<td>${((itemType.updated == null) ? "" : itemType.updated.toString().substring(4, itemType.updated.toString().indexOf(" G")))}</td>
			</tr>
		`
	};
	const save = (data) => {
		data.project_id = activeProject.internal_id;
		itemTypesDB.save(data).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const deleteItemType = () => {
		deleteRow(selectedRow);
	}
	const view = (id) => {
		const modal = document.getElementById("item-type-modal");
		if (modal) {
			document.body.removeChild(modal);
		}
		document.body.appendChild(itemTypeProperties.setup());
		const itemType = itemTypes.find(itemType => itemType.internal_id == id);
		itemTypeProperties.view(itemType, null, save, items, links, linkTypes, itemTypes, null, deleteItemType);
		$('#item-type-modal').modal();
	}

	const curatedList = () => {
		let sortFunction = null;
		if (sortOrder == null) {
			sortFunction = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
		}
		else {
			sortFunction = sortOrder;
		}
		let filterFunction = null;
		if (filter == null) {
			filterFunction = item => true;
		}
		else {
			filterFunction = filter;
		}
		let itemTypesList = null;
		if (itemTypes != null) {
			itemTypesList = itemTypes
				.filter(filterFunction)
				.sort(sortFunction);
		}
		return itemTypesList;
	}
	const list = () => {
		const curatedItemTypesList = curatedList();
		if (curatedItemTypesList != null) {
			const html = curatedItemTypesList
				.map(itemType => getRowHTML(itemType));
			const table = document.getElementById("item-types-table");
			table.tBodies[0].innerHTML = html.join("");
			var rows = Array.from(table.querySelectorAll(".item-row"));
			rows.forEach(row => {
				row.addEventListener("click", event => {
					view(event.currentTarget.dataset.internal_id);
					selectedRow = event.currentTarget;
				});
			});
			const infoDisplay = document.getElementById("info");
			infoDisplay.innerHTML = `${curatedItemTypesList.length} items of ${itemTypes.length} displayed.`;
		}
	}
	setupEventHandlers();
})();

const links = (async () => {
	let items = null, links = null, linkTypes = null, itemTypes = null, activeProject = null;
	let sortOrder = null;
	let filter = null;
	let selectedRow = null;

	const deleteRow = (row) => {
		linksDB.delete(row.dataset.internal_id).then(result => {
			const table = document.getElementById("links-table");
			table.deleteRow(row.rowIndex);
			load().then(result => {
				list();
			});
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			projectsDB.getActive().then(project => {
				activeProject = project;
				const activeProjectNameLabel = document.getElementById("links-active-project");
				activeProjectNameLabel.innerHTML = activeProject.identifier;
				Promise.allSettled([
					itemsDB.load(project.internal_id),
					itemTypesDB.load(project.internal_id),
					linksDB.load(project.internal_id),
					linkTypesDB.load(project.internal_id),
				]).then(results => {
					itemTypes = results[1].value;
					const loadedItems = results[0].value;
					items = loadedItems
						.sort((a, b) => ('' + a.identifier).localeCompare(b.identifier))
						.map(item => {
							const type_id = item.type;
							item.type = itemTypes.find(type => type.internal_id == type_id);
							return item;
						});

					linkTypes = results[3].value;
					const loadedLinks = results[2].value;
					links = loadedLinks.map(link => {
						const source_id = link.source;
						link.source = items.find(item => item.internal_id == source_id);
						const target_id = link.target;
						link.target = items.find(item => item.internal_id == target_id);
						link.type = linkTypes.find(connector => connector.internal_id == link.connector);
						return link;
					});
					resolve();
				});
			});
		});
	}
	const create = () => {
		view(null);
	};
	const exportLinks = () => {
		const mappedLinks = curatedList().map(link => {
			const newLink = link;
			const linkType = linkTypes.find(type => type.internal_id == link.type);
			newLink.type = (type ? type.identifier : ""); '';
			return newLink;
		});

		const items = mappedLinks;
		const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
		const header = Object.keys(items[0])
		let csv = links.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
		csv.unshift(header.join(','))
		csv = csv.join('\r\n')
		const exportJSON = document.createElement("a");
		const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		exportJSON.href = url;
		exportJSON.setAttribute("download", "links.csv");
		exportJSON.click();
	};
	const setupEventHandlers = () => {
		const tabLink = document.getElementById("links-tab");
		console.assert(tabLink != null, "Cannot find links-tab");
		tabLink.addEventListener("click", event => {
			load().then(result => {
				list();
			});
		});

		const createButton = document.getElementById("create-link");
		createButton.addEventListener("click", event => create());

		const exportButton = document.getElementById("export-links");
		exportButton.addEventListener("click", event => exportItems());

		const typeSortOrderAction = document.getElementById("link-type-sort-order");
		typeSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => {
					const typeIdentifierA = a.type ? a.type.identifier : "";
					const typeIdentifierB = b.type ? b.type.identifier : "";
					return typeIdentifierA.localeCompare(typeIdentifierB);
				}
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => {
					const typeIdentifierA = a.type ? a.type.identifier : "";
					const typeIdentifierB = b.type ? b.type.identifier : "";
					return typeIdentifierA.localeCompare(typeIdentifierB);
				}
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});

		const sourceSortOrderAction = document.getElementById("link-source-sort-order");
		sourceSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => {
					const sourceIdentifierA = a.source ? a.source.identifier : "";
					const sourceIdentifierB = b.source ? b.source.identifier : "";
					return sourceIdentifierA.localeCompare(sourceIdentifierB);
				}
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => {
					const sourceIdentifierA = a.source ? a.source.identifier : "";
					const sourceIdentifierB = b.source ? b.source.identifier : "";
					return sourceIdentifierA.localeCompare(sourceIdentifierB);
				}
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});

		const targetSortOrderAction = document.getElementById("link-target-sort-order");
		targetSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => {
					const targetIdentifierA = a.target ? a.target.identifier : "";
					const targetIdentifierB = b.target ? b.target.identifier : "";
					return targetIdentifierA.localeCompare(targetIdentifierB);
				}
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => {
					const targetIdentifierA = a.target ? a.target.identifier : "";
					const targetIdentifierB = b.target ? b.target.identifier : "";
					return targetIdentifierA.localeCompare(targetIdentifierB);
				}
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});

		const identifierSortOrderAction = document.getElementById("link-identifier-sort-order");
		identifierSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => {
					const identifierA = a.type ? a.type.identifier : "";
					const identifierB = b.type ? b.type.identifier : "";
					return identifierA.localeCompare(identifierB);
				}
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => {
					const identifierA = a.type ? a.type.identifier : "";
					const identifierB = b.type ? b.type.identifier : "";
					return identifierA.localeCompare(identifierB);
				}
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const descriptionSortOrderAction = document.getElementById("link-description-sort-order");
		descriptionSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const updatedSortOrderAction = document.getElementById("link-updated-sort-order");
		updatedSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const searchInput = document.getElementById("searchInput");
		if (searchInput != null) {
			searchInput.addEventListener("keyup", event => {
				const criteria = searchInput.value.toLowerCase();
				filter = link => {
					return (("" + link.identifier).toLowerCase().indexOf(criteria) >= 0)
					|| (("" + link.description).toLowerCase().indexOf(criteria) >= 0)
					|| (("" + link.updated).toString().toLowerCase().indexOf(criteria) >= 0)
					|| (("" + (link.type? link.type.identifier : "")).toLowerCase().indexOf(criteria) >= 0)
					|| (("" + (link.source? link.source.identifier : "")).toLowerCase().indexOf(criteria) >= 0)
					|| (("" + (link.target? link.target.identifier : "")).toLowerCase().indexOf(criteria) >= 0)
				}
				list();
			})
		}
	};

	const getRowHTML = (link) => {
		return `
			<tr data-internal_id="${link.internal_id}" data-toggle="modal" data-target="#link-modal" class="item-row">
				<td><nobr>${link.identifier}</nobr></td>
				<td>${link.description}</td>
				<td>${link.source ? link.source.identifier : ""}</td>
				<td>${link.type ? link.type.identifier : ""}</td>
				<td>${link.target ? link.target.identifier : ""}</td>
				<td>${((link.updated == null) ? "" : link.updated.toString().substring(4, link.updated.toString().indexOf(" G")))}</td>
			</tr>
		`;
	};
	const save = (data) => {
		data.project_id = activeProject.internal_id;
		linksDB.save(data).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const deleteLink = () => {
		deleteRow(selectedRow);
	}
	const view = (id) => {
		const linkModal = document.getElementById("link-modal");
		if (linkModal) {
			document.body.removeChild(linkModal);
		}
		document.body.appendChild(linkProperties.setup());
		const link = links.find(link => link.internal_id == id);
		linkProperties.view(link, links, linkTypes, items, itemTypes, save, deleteLink);
		$('#link-modal').modal();
	}

	const curatedList = () => {
		let sortFunction = null;
		if (sortOrder == null) {
			sortFunction = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
		}
		else {
			sortFunction = sortOrder;
		}
		let filterFunction = null;
		if (filter == null) {
			filterFunction = item => true;
		}
		else {
			filterFunction = filter;
		}
		let linksList = null;
		if (links != null) {
			linksList = links
				.filter(filterFunction)
				.sort(sortFunction);
		}
		return linksList;
	}
	const list = () => {
		const curatedLinksList = curatedList();
		if (curatedLinksList != null) {
			const html = curatedLinksList
				.map(link => getRowHTML(link));
			const table = document.getElementById("links-table");
			table.tBodies[0].innerHTML = html.join("");
			var rows = Array.from(table.querySelectorAll(".item-row"));
			rows.forEach(row => {
				row.addEventListener("click", event => {
					view(event.currentTarget.dataset.internal_id);
					selectedRow = event.currentTarget;
				});
			});
			const infoDisplay = document.getElementById("info");
			infoDisplay.innerHTML = `${curatedLinksList.length} links of ${links.length} displayed.`;
		}
	}
	setupEventHandlers();
})();
const linkTypes = (async () => {
	let items = null, links = null, linkTypes = null, itemTypes = null, activeProject = null;
	let sortOrder = null;
	let filter = null;
	let selectedRow = null;

	const deleteRow = (row) => {
		linkTypesDB.delete(row.dataset.internal_id).then(result => {
			const table = document.getElementById("link-types-table");
			table.deleteRow(row.rowIndex);
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			projectsDB.getActive().then(project => {
				activeProject = project;
				const activeProjectNameLabel = document.getElementById("link-types-active-project");
				activeProjectNameLabel.innerHTML = activeProject.identifier;
				Promise.allSettled([
					linkTypesDB.load(project.internal_id),
				]).then(results => {
					linkTypes = results[0].value;
					resolve();
				});
			});
		});
	}
	const create = () => {
		view(null);
	};
	const exportItems = () => {
		const mappedLinkTypes = curatedList().map(linkType => {
			const newLinkType = linkType;
			return newLinkType;
		});

		const linkTypes = mappedlinkTypes;
		const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
		const header = Object.keys(linkTypes[0])
		let csv = itemTypes.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
		csv.unshift(header.join(','))
		csv = csv.join('\r\n')
		const exportJSON = document.createElement("a");
		const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		exportJSON.href = url;
		exportJSON.setAttribute("download", "link-types.csv");
		exportJSON.click();
	};
	const setupEventHandlers = () => {
		const tabLink = document.getElementById("link-types-tab");
		console.assert(tabLink != null, "Cannot find link-types-tab");
		tabLink.addEventListener("click", event => {
			load().then(result => {
				list();
			});
		});

		const createButton = document.getElementById("create-link-type");
		console.assert(createButton != null, "Cannot find create-link-type");
		createButton.addEventListener("click", event => create());

		const exportButton = document.getElementById("export-link-types");
		exportButton.addEventListener("click", event => exportItems());

		const identifierSortOrderAction = document.getElementById("link-type-identifier-sort-order");
		identifierSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const descriptionSortOrderAction = document.getElementById("link-type-description-sort-order");
		descriptionSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => ('' + a.description).localeCompare(b.description);
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const updatedSortOrderAction = document.getElementById("link-type-updated-sort-order");
		updatedSortOrderAction.addEventListener("click", event => {
			if (event.currentTarget.dataset.sortOrder == "ascending") {
				sortOrder = (b, a) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "descending";
			}
			else {
				sortOrder = (a, b) => a.updated - b.updated;
				event.currentTarget.dataset.sortOrder = "ascending";
			}
			list();
		});
		const searchInput = document.getElementById("searchInput");
		if (searchInput != null) {
			searchInput.addEventListener("keyup", event => {
				const criteria = searchInput.value.toLowerCase();
				filter = linkType => (linkType.identifier.toLowerCase().indexOf(criteria) >= 0) || (linkType.description.toLowerCase().indexOf(criteria) >= 0) || (linkType.updated.toString().toLowerCase().indexOf(criteria) >= 0);
				list();
			})
		}
	};

	const getRowHTML = (linkType) => {
		return `
			<tr data-internal_id="${linkType.internal_id}" data-toggle="modal" data-target="#link-type-modal" class="item-row">
				<td><nobr>${linkType.identifier}</nobr></td>
				<td>${linkType.description}</td>
				<td>${((linkType.updated == null) ? "" : linkType.updated.toString().substring(4, linkType.updated.toString().indexOf(" G")))}</td>
			</tr>
		`
	};
	const save = (data) => {
		data.project_id = activeProject.internal_id;
		linkTypesDB.save(data).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const deleteItemType = () => {
		deleteRow(selectedRow);
	}
	const view = (id) => {
		const modal = document.getElementById("item-type-modal");
		if (modal) {
			document.body.removeChild(modal);
		}
		document.body.appendChild(linkTypeProperties.setup());
		const linkType = linkTypes.find(linkType => linkType.internal_id == id);
		linkTypeProperties.view(linkType, null, save, items, links, linkTypes, itemTypes, null, deleteLinkType);
		$('#link-type-modal').modal();
	}

	const curatedList = () => {
		let sortFunction = null;
		if (sortOrder == null) {
			sortFunction = (a, b) => ('' + a.identifier).localeCompare(b.identifier);
		}
		else {
			sortFunction = sortOrder;
		}
		let filterFunction = null;
		if (filter == null) {
			filterFunction = item => true;
		}
		else {
			filterFunction = filter;
		}
		let linkTypesList = null;
		if (linkTypes != null) {
			linkTypesList = linkTypes
				.filter(filterFunction)
				.sort(sortFunction);
		}
		return linkTypesList;
	}
	const list = () => {
		const curatedLinkTypesList = curatedList();
		if (curatedLinkTypesList != null) {
			const html = curatedLinkTypesList
				.map(linkType => getRowHTML(linkType));
			const table = document.getElementById("link-types-table");
			table.tBodies[0].innerHTML = html.join("");
			var rows = Array.from(table.querySelectorAll(".item-row"));
			rows.forEach(row => {
				row.addEventListener("click", event => {
					view(event.currentTarget.dataset.internal_id);
					selectedRow = event.currentTarget;
				});
			});
			const infoDisplay = document.getElementById("info");
			infoDisplay.innerHTML = `${curatedLinkTypesList.length} types of ${linkTypes.length} displayed.`;
		}
	}
	setupEventHandlers();
})();

let visualise = (async () => {
	let links = null, unmappedLinks = null, linkTypes = null, items = null, itemTypes = null, displayOptions = null, simulation = null;;
	let currentItemWithContextMenu = null;
	let itemContextMenu = null;
	let deltaX = 0;
	let deltaY = 0;

	const load = () => {
		return new Promise((resolve, reject) => {
			projectsDB.getActive().then(async project => {
				activeProject = project;
				linkTypes = await linkTypesDB.load(activeProject.internal_id);
				links = await linksDB.load(activeProject.internal_id);
				itemTypes = await itemTypesDB.load(activeProject.internal_id);
				const rawItems = await itemsDB.load(activeProject.internal_id);
				items = rawItems.map(item => {
					const type_id = item.type;
					item.type = itemTypes.find(type => type.internal_id == type_id);
					return item;
				})
				unmappedLinks = links.map(connection => {
					const source_id = connection.source;
					connection.source = items.find(item => item.internal_id == source_id);
					const target_id = connection.target;
					connection.target = items.find(item => item.internal_id == target_id);
					connection.connector = linkTypes.find(connector => connector.internal_id == connection.connector);
					return connection;
				});
				resolve();
			});
		});
	};
	const dragHandler = d3.drag()
		.on("drag", function (d) {
			console.log(`dragging (${deltaX}, ${deltaY})`);
			d3.select(this)
				.attr("transform", "translate(" + (d3.event.x + deltaX) + ", " + (d3.event.y + deltaY) + ")");
		})
		.on("start", function () {
			let current = d3.select(this);
			//deltaX = current.attr("x") - d3.event.x;
			//deltaY = current.attr("y") - d3.event.y;
		})




	const drag = simulation => {

		function dragstarted(d) {
			if (!d3.event.active && !currentItemWithContextMenu) simulation.alphaTarget(0.3).restart();
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
	displayOptions = {
		showLinks: true,
		showLinkLabels: false,
		showItems: true,
		showItemLabels: true,
		itemRadius: 30,
		partialNameCriteria: "",
	}


	const sortAndOrderLinks = (unsortedLinks) => {
		const nonOrphanedLinks = unsortedLinks.filter(link => (link.source != null) && (link.target != null)).map(link => { link.set = null; return link; });
		// Count the number of links in the set of links between each item.
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

	const addLink = (source, target) => {
		return new Promise((resolve, reject) => {
			linksDB.saveLinkToDB({ source: source, target: target, project_id: "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY" }).then(savedLink => {
				links.push(savedLink);
				resolve(savedLink);
			})
		});
	}
	const saveNewLink = (linkToSave) => {

		if (linkToSave.internal_id && (linkToSave.internal_id != "")) {
			const linkInCollection = links.find(link => link.internal_id == linkToSave.internal_id)
			linkInCollection.identifier = linkToSave.identifier;
			linkInCollection.description = linkToSave.description;
			linkInCollection.target = linkToSave.target;
			linkInCollection.source = linkToSave.source;
			linkInCollection.connector = linkToSave.connector;
			linksDB.saveLinkToDB(linkInCollection).then(() => {
				// simulation
				// 	.items(items)
				// 	.force("link", d3.forceLink(links).id(d => d.id))
				update();
				simulation.alpha(0.01).restart();
			})
		}
		console.log(linkToSave);
	}
	const deleteLink = async (link) => {
		const linkIndex = links.indexOf(link);
		if (linkIndex > -1) {
			links.splice(linkIndex, 1);
		}
		linksDB.deleteLinkFromDB(link.internal_id).then(result => {
			// simulation
			// 	.items(items)
			// 	.force("link", d3.forceLink(links).id(d => d.id))
			update();
			simulation.alpha(0.01).restart();

		});
	}

	/**
	 * Adds the item and link to the force simulation, hides the context menu and adds a small amount of reheating to the layout.
	 * @param {d3.forceSimulation} simulation The force simulation
	 * @param {Array} items The items drawn on the force simulation
	 * @param {Array} links The links between items drawn on the force simulation
	 * @param {object} source The d3 item from which the new item will be linked to.
	 * @param {object} link The d3 link between the source item and the new item.
	 * @param {object} item The item to add.
	 */
	const addItem = async (item, parentItem) => {
		if (item != null) {
			const newItem = { x: parentItem.x + 15, y: parentItem.y + 15, ...item }
			newItem.project_id = "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY";
			// // Temporary until SaveItem function added here.
			// const newInternal_id = makeid(20);
			// newItem.internal_id = newInternal_id;
			// Add created/updated dates.
			const savedItem = await itemsDB.saveItemToDB(newItem);
			items.push(savedItem);

			linksDB.saveLinkToDB({ source: parentItem, target: savedItem, project_id: "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY" }).then(result => {
				links.push(result);
				// simulation
				// 	.items(items)
				// 	.force("link", d3.forceLink(links).id(d => d.id))
				update();
				simulation.alpha(0.01).restart();

			});
		}
		else {
			console.log("Not adding...")
		}
	}

	const deleteItem = (item, parentItem) => {
		itemContextMenu.style("visibility", "hidden")
		currentItemWithContextMenu = null;
		const itemIndex = items.indexOf(item);
		if (itemIndex > -1) {
			items.splice(itemIndex, 1);
		}
		// Find all links to/from this item.
		const linksToItem = links.filter(link => {
			return ((link.source? link.source.internal_id : "") == item.internal_id) || ((link.target? link.target.internal_id : "") == item.internal_id);
		});
		// Remove those links from the general simulation links.
		linksToItem.forEach(async linkToItem => {
			const linkToItemIndex = links.indexOf(linkToItem);
			if (linkToItemIndex > -1) {
				links.splice(linkToItemIndex, 1);
			}
			await linksDB.delete(linkToItem.internal_id);
		});
		itemsDB.delete(item.internal_id).then(result => {
			// simulation
			// 	.items(items)
			// 	.force("link", d3.forceLink(links).id(d => d.id))
			update();
			simulation.alpha(0.01).restart();
		});
	}
	const saveItem = async (item, parentItem, items, links, linkTypes, itemTypes) => {
		console.log("removing dialogue")
		document.body.removeChild(document.getElementById("itemModal"));
		if (item != null) {
			const existingItem = items.find(n => n.internal_id == item.internal_id);
			console.assert(existingItem != null, "Cannot find item in existing items.")
			existingItem.identifier = item.identifier;
			existingItem.description = item.description;
			existingItem.colour = item.colour;
			existingItem.custom_image = item.custom_image;
			existingItem.fill_colour = item.fill_colour;
			existingItem.type = item.type;
			console.log("Saving...");
			itemsDB.saveItemToDB(existingItem).then(result => {
				update();
				simulation.alpha(0.01).restart();
			});
		}
		else {
			console.log("Not saving...")
		}
	}
	const exportAsJSON = () => {
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

	}
	const exportasCSV = () => {
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
			const mappedConnections = exportData.connections.map(connection => {
				const connector = linkTypes.find(connector => connector.internal_id == connection.connector);
				const source = exportData.things.find(thing => thing.internal_id == connection.source);
				const target = exportData.things.find(thing => thing.internal_id == connection.target);
				connection.connector = (connector ? connector.identifier : ""); ''
				connection.source = (source ? source.identifier : "");
				connection.target = (target ? target.identifier : "");
				return connection
			});
			console.log("Actions click!");
			const items = mappedConnections;
			const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
			const header = Object.keys(items[0])
			let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
			csv.unshift(header.join(','))
			csv = csv.join('\r\n')
			const exportJSON = document.createElement("a");
			const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			exportJSON.href = url;
			exportJSON.setAttribute("download", "export.csv");
			exportJSON.click();

			console.log(csv)
			// const exportJSON = document.createElement("a");
			// const blob = new Blob([JSON.stringify(exportData)], { type: "text/JSON; charset=utf-8;" });
			// const url = URL.createObjectURL(blob);
			// exportJSON.href = url;
			// exportJSON.setAttribute("download", "export.JSON");
			// exportJSON.click();

		})
	}

	const setupFilterDefaults = () => {
		displayOptions.filter = {
			visible: {
				connectors: linkTypes.map(linkType => linkType.internal_id),
				types: itemTypes.map(itemType => itemType.internal_id),
			},
			included: {
				connectors: linkTypes.map(linkType => linkType.internal_id),
				types: itemTypes.map(itemType => itemType.internal_id),
			}
		};
		const filters = filterDB.load(activeProject.internal_id);
		filters.then(result => {
			const definedFiltersHTML = result
				.sort((a, b) => a.identifier.localeCompare(b.identifier))
				.map(filter => `<option value="${filter.internal_id}">${filter.identifier}</option>`);
			const predefinedfilters = document.getElementById("predefinedfilters");
			predefinedfilters.innerHTML = `<option value = "">All</option>` + definedFiltersHTML.join("");
			predefinedfilters.addEventListener("change", event => {
				if (event.currentTarget.value.length == 0) {
					displayOptions.filter = {
						visible: {
							connectors: linkTypes.map(linkType => linkType.internal_id),
							types: itemTypes.map(itemType => itemType.internal_id),
						},
						included: {
							connectors: linkTypes.map(linkType => linkType.internal_id),
							types: itemTypes.map(itemType => itemType.internal_id),
						}
					};
				}
				else {
					displayOptions.filter = result.find(item => item.internal_id == event.currentTarget.value);
				}
				update();
				simulation.alpha(0.01).restart();
			});

		})
	}
	const saveFilterOptions = (filterOptions) => {
		filterOptions.project_id = "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY";
		displayOptions.filter = filterOptions;
		console.log(filterOptions);
		filterDB.saveFilterToDB(filterOptions)
		update();
		simulation.alpha(0.01).restart();
	}
	const useFilterOptions = (filterOptions) => {
		filterOptions.project_id = "qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY";
		displayOptions.filter = filterOptions;
		console.log(filterOptions);
		update();
		simulation.alpha(0.01).restart();
	}
	const filter = (simulation, items, links, linkTypes, itemTypes, displayOptions) => {
		const filterModal = document.getElementById("filterModal");
		if (filterModal) {
			document.body.removeChild(filterModal);
		}
		document.body.appendChild(setupFilterModal());
		filterDB.loadFilters("qwVoefqcTGxZBWyYxgWrBikLCeyYsgOeIIgNMRxIDlEktmpuXY").then(filters => {
			viewFilter(simulation, items, links, linkTypes, itemTypes, displayOptions.filter, saveFilterOptions, filters, useFilterOptions);
			$('#filterModal').modal();
		});
	}
	const createActionsMenu = (simulation, items, links, linkTypes, itemTypes, displayOptions) => {
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
			.attr("r", 30)
			.style("stroke-width", "2px")
			.style("stroke", "black")
			.style("fill", "WhiteSmoke")

		const data = [
			{
				value: 1,
				action: "Export as CSV",
				icon: "f6dd",
			},
			{
				value: 1,
				action: "Export as JSON",
				icon: "f019",
			},
			{
				value: 1,
				action: "Filter",
				icon: "f0b0",
			},
		];
		const pie = d3.pie()
			.value(d => d.value.value)
		const data_ready = pie(d3.entries(data))

		// Item is expanded to twice it's size when user hovers mouse over it. Need to account for this when drawing context menu.
		const expandedItemRadius = 30 * 2;
		const arc1 = d3.arc()
			.innerRadius(0)
			.outerRadius(100)
			.cornerRadius(1);

		const arc2 = d3.arc()
			.innerRadius(50)
			.outerRadius(100)
			.cornerRadius(1);

		actionsMenu.selectAll(".actionsMenu")
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
			.append("title")
			.text(d => d.data.value.action)
		actionsMenu.selectAll('.actionsMenu')
			.data(data_ready)
			.enter()
			.append("path")
			.style("stroke", "transparent")
			.style("opacity", 0.3)
			.attr('d', arc1)
			.on("click", d => {
				switch (d.data.value.action.toLowerCase()) {
					case "export as json": {
						exportAsJSON();
						break;
					}
					case "export as csv": {
						exportasCSV();
						break;
					}
					case "filter": {
						filter(simulation, items, links, linkTypes, itemTypes, displayOptions);
						break;
					}
				}
			})
			.append("title")
			.text(d => d.data.value.action)
		// .on("mouseout", () => {
		// 	const pendingLink = document.querySelector(".link");
		// 	if (!pendingLink) {
		// 		itemContextMenu.style("visibility", "hidden")
		// 	}
		// })

	}
	// Context menu for a item.
	const createItemContextMenu = () => {
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

		// Item is expanded to twice it's size when user hovers mouse over it. Need to account for this when drawing context menu.
		const expandedItemRadius = displayOptions.itemRadius * 2;
		const arc1 = d3.arc()
			.innerRadius(0)
			.outerRadius(expandedItemRadius + 40)
			.cornerRadius(1);

		const arc2 = d3.arc()
			.innerRadius(expandedItemRadius + 5)
			.outerRadius(expandedItemRadius + 30)
			.cornerRadius(1);
		const svg = d3.select("#drawingArea");

		const itemContextMenu = svg.append("g")
			.attr("id", "itemContextMenu")
			.attr("class", "itemContextMenu")
			.style("visibility", "hidden")

		itemContextMenu.selectAll("itemContextMenu")
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
		itemContextMenu.selectAll('itemContextMenu')
			.data(data_ready)
			.enter()
			.append("path")
			.style("stroke", "transparent")
			.style("opacity", 0.3)
			.attr('d', arc1)
			.on("mouseout", () => {
				const pendingLink = document.querySelector(".link");
				if (!pendingLink) {
					itemContextMenu.style("visibility", "hidden")
					currentItemWithContextMenu = null;
				}
			})
			.on("mouseover", function () { d3.select(this).style("cursor", "pointer") })
			.on("click", function (d) {
				switch (d.data.value.action) {
					case "Delete": {
						deleteItem(currentItemWithContextMenu, null, items, links, itemTypes);
						break;
					}
					case "Add": {
						const itemModal = document.getElementById("itemModal");
						if (itemModal) {
							document.body.removeChild(itemModal);
						}
						document.body.appendChild(setupItemPropertiesModal());
						viewItem(null, currentItemWithContextMenu, addItem, items, links, linkTypes, itemTypes, displayOptions);
						$('#item-modal').modal();
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
						//console.log(`line from ${currentItemWithContextMenu.x}, ${currentItemWithContextMenu.y} to ${mouseWithZoom[0]}, ${mouseWithZoom[1]}`)
						svg
							.append("line")
							.lower()
							.attr("x1", currentItemWithContextMenu.x)
							.attr("y1", currentItemWithContextMenu.y)
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
						document.body.appendChild(itemProperties.setup());
						itemProperties.view(currentItemWithContextMenu, null, saveItem, items, links, linkTypes, itemTypes);
						$('#item-modal').modal()
						break;
					}
				}
				console.log(d.data.value.action)
			})


		return itemContextMenu;
	}
	const setupSimulation = (width, height) => {
		const parentSVG = d3.select("#chart").append("svg")
			.attr("viewBox", [0, 0, width, height - 110])
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
						.attr("x1", currentItemWithContextMenu.x)
						.attr("y1", currentItemWithContextMenu.y)
						.attr("x2", xy1[0])
						.attr("y2", xy1[1])
				}
			})
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

	const filterLinks = (filteredItems, unfilteredLinks) => {
		const linksWithoutNodes = unfilteredLinks.filter(link => {
			let sourceFound = false;
			let targetFound = false;
			if (link.target != null) {
				targetFound = (link.target != null) && filteredItems.some(item => item.internal_id == link.target.internal_id);
			}
			if (link.source != null) {
				sourceFound = (link.target != null) && filteredItems.some(item => item.internal_id == link.source.internal_id);
			}
			return targetFound && sourceFound;
		})
		const linksNotIncluded = linksWithoutNodes.filter(link => {
			let included = false;
			if (link.connector != null) {
				included = displayOptions.filter.included.connectors.find(includedLink => includedLink == link.connector.internal_id);
			}
			else {
				included = true;
			}
			return included;
		})
		return linksNotIncluded;
	}
	const filterItems = (items) => {
		let filteredItems = items.filter(item => {
			let include = false;
			if (item.type != null) {
				include = displayOptions.filter.included.types.find(includedType => includedType == item.type.internal_id);
			}
			else {
				include = true;
			}
			return include;
		});
		return filteredItems;
	}
	const update = () => {
		const filteredItems = filterItems(items);
		const sortedLinks = sortAndOrderLinks(filterLinks(filteredItems, links));
		simulation
			.nodes(filteredItems)
			.force("link", d3.forceLink(sortedLinks).id(d => d.id))
		const svg = d3.select("#drawingArea");
		// These SVG element types need to be added in a very specific order for the user interface mechanics to work correctly.
		let text = null;
		if (displayOptions.showItemLabels) {
			text = svg
				.selectAll(".text")
				.data(filteredItems)
				.join("text")
				.attr("class", "text")
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.text(d => d.identifier)
				.attr("x", function (d) {
					// Get the half-length of the text for centering on the item.
					d.xOffset = this.getBBox().width / 2;
				})
				.attr("y", function (d) {
					// Get the height of the text for positioning underneath the item.
					d.yOffset = this.getBBox().height + displayOptions.itemRadius;
				})
				.style("opacity", d => {
					let opacity = "0.05";
					if (displayOptions.partialNameCriteria.length > 0) {
						if ((d.identifier != null) && (d.identifier.toLowerCase().indexOf(displayOptions.partialNameCriteria.toLowerCase()) >= 0)) {
							opacity = "1";
						}
					}
					else {
						opacity = "1";
					}
					return opacity;
				})
				.style("visibility", d => {
					let visibility = "hidden";
					if (displayOptions.filter.visible != null) {
						if (displayOptions.filter.visible.types.filter(item => (d.type != null) && (item == d.type.internal_id)).length > 0) {
							visibility = "visible";
						}
					}
					return visibility;
				})


		}
		let link = null;
		if (displayOptions.showLinks) {
			console.log("sortedLinks.length = " + sortedLinks.length)
			link = svg
				.selectAll(".path")
				.data(sortedLinks)
				.join("path")
				.attr("id", d => d.internal_id)
				.lower()
				.attr("class", "path")
				.attr("stroke-width", 2)
				.attr("stroke", d => (d.connector ? d.connector.colour : "gainsboro"))
				.attr("fill", "transparent")
				.attr('marker-end', d => `url(#marker_${(d.connector ? d.connector.colour.substring(1) : "gainsboro") + (d.connector ? d.connector.marker : "")})`)
				.style("visibility", d => {
					let visibility = "hidden";
					if (displayOptions.filter.visible != null) {
						if (displayOptions.filter.visible.connectors.filter(item => (d.connector != null) && (item == d.connector.internal_id)).length > 0) {
							visibility = "visible";
						}
						else if (d.connector == null) {
							visibility = "visible";
						}
					}
					return visibility;
				})
				.style("opacity", d => {
					let opacity = "0.05";
					if (displayOptions.partialNameCriteria.length > 0) {
						if ((d.identifier != null) && (d.identifier.toLowerCase().indexOf(displayOptions.partialNameCriteria.toLowerCase()) >= 0)) {
							opacity = "1";
						}
					}
					else {
						opacity = "1";
					}
					return opacity;
				})
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
					const linkModal = document.getElementById("linkModal");
					if (linkModal) {
						document.body.removeChild(linkModal);
					}
					document.body.appendChild(setupLinkPropertiesModal());
					viewLink(d, links, linkTypes, items, itemTypes, saveNewLink, deleteLink);
					$('#linkModal').modal();
				})
				.each(d => {
					if (d.connector) {
						createMarkerEnd("marker_", dashesAndEnds, d.connector.marker, d.connector.colour, "5px", "5px", displayOptions.itemRadius + 4, 0);
					}
				})
		}

		let linkText = null;
		if (displayOptions.showLinkLabels) {
			linkText = svg
				.selectAll(".linkText")
				.data(sortedLinks)
				.join("text")
				.attr("class", "linkText")
				.style("color", d => d3.select("body").attr("color"))
				.attr("dy", -5)
				.append("textPath")
				.attr("startOffset", "50%")
				.attr("text-anchor", "middle")
				.attr("href", d => "#" + d.internal_id)
				.text(d => (d.connector ? d.connector.identifier : d.identifier + ""))
				.style("opacity", d => {
					let opacity = "0.05";
					if (displayOptions.partialNameCriteria.length > 0) {
						if ((d.identifier != null) && (d.identifier.toLowerCase().indexOf(displayOptions.partialNameCriteria.toLowerCase()) >= 0)) {
							opacity = "1";
						}
					}
					else {
						opacity = "1";
					}
					return opacity;
				})
				.style("visibility", d => {
					let visibility = "hidden";
					if (displayOptions.filter.visible != null) {
						if (displayOptions.filter.visible.connectors.filter(item => (d.connector != null) && (item == d.connector.internal_id)).length > 0) {
							visibility = "visible";
						}
					}
					return visibility;
				})


		}
		// Context menu needs to be added here but it should not be added every time the diagram is updated.
		if (itemContextMenu == null) {
			itemContextMenu = createItemContextMenu();
		}
		let item = null;
		if (displayOptions.showItems) {
			item = svg
				.selectAll(".item")
				.data(filteredItems)
				.join("circle")
				// .join("g")
				.attr("class", "item")
				.attr("id", d => "circle_" + d.internal_id)
				// .append("circle")
				// .attr("class", "itemCircle")
				.attr("stroke", d => (d.type ? d.type.colour : "transparent"))
				.attr("r", displayOptions.itemRadius)
				.attr("fill", d => (d.type ? d.type.background_colour : "transparent"))
				.style("opacity", d => {
					let opacity = "0.05";
					if (displayOptions.partialNameCriteria.length > 0) {
						if ((d.identifier != null) && (d.identifier.toLowerCase().indexOf(displayOptions.partialNameCriteria.toLowerCase()) >= 0)) {
							opacity = "1";
						}
					}
					else {
						opacity = "1";
					}
					return opacity;
				})
				.style("visibility", d => {
					let visibility = "hidden";
					if (displayOptions.filter.visible != null) {
						if (displayOptions.filter.visible.types.filter(item => (d.type != null) && (item == d.type.internal_id)).length > 0) {
							visibility = "visible";
						}
					}
					return visibility;
				})
				.call(drag(simulation))
				.on("mouseenter", function (d) {
					d3.select(this).transition(750).attr("r", displayOptions.itemRadius * 2);
				})
				.on("mouseout", function (d) {
					d3.select(this).transition(750).attr("r", displayOptions.itemRadius);
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
						currentItemWithContextMenu = d;
						itemContextMenu
							.attr("transform", `translate(${d.x}, ${d.y})`)
							.style("visibility", "visible")
						simulation.stop();
					}
					else {
						d3.select(".link").remove();
						itemContextMenu.style("visibility", "hidden")
						addLink(currentItemWithContextMenu, d).then(() => {
							// simulation
							// 	.items(items)
							// 	.force("link", d3.forceLink(links).id(d => d.id))
							update();
							simulation.alpha(0.005).restart();

						});
					}
				})
				.each(d => {
					setupRadialGradientFilter(`radialGradient_${d.type.internal_id}`, d.type.background_colour);
				});
		}
		const infoDisplay = document.getElementById("info");
		infoDisplay.innerHTML = `Items: ${items.length}, Links: ${links.length}.`;

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
			if (item != null) {
				item
					.attr("cx", d => d.x)
					.attr("cy", d => d.y)
			}
			if (text != null) {
				text
					.attr("x", d => d.x)
					.attr("y", d => d.y + d.yOffset)
			}
			if (currentItemWithContextMenu) {
				itemContextMenu.attr("transform", `translate(${currentItemWithContextMenu.x}, ${currentItemWithContextMenu.y})`)
			}
		});
		const mappedLinks = sortedLinks.map(link => link.connector)
			.sort((a, b) => {
				let result = 0;
				if ((a && b) && (a.identifier != null) && (b.identifier != null)) {
					result = a.identifier.localeCompare(b.identifier);
				}
				return result;
			})
		const linkTypesInUse = [...new Set(mappedLinks)];

		const mappedItemTypes = filteredItems
			.map(item => item.type)
			.sort((a, b) => a.identifier.localeCompare(b.identifier));
		const itemsTypesInUse = [...new Set(mappedItemTypes)];
		const createLegend = (linkTypesInUse, itemsTypesInUse) => {
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
				.attr("height", (((linkTypesInUse ? linkTypesInUse.length : 0) + (itemsTypesInUse ? itemsTypesInUse.length : 0)) * legendItemHeight) + legendCaptionHeight * 2 + "px")
				.attr("width", "350px")
				.attr("rx", 15)

			legend
				.append("text")
				.attr("class", "keyTitle")
				.text("Key")
				.attr("x", 15)
				.attr("y", function () {
					// Get the height of the text for positioning underneath the item.
					return this.getBBox().height;
				})

			if (linkTypesInUse != null) {
				const legendConnectorItems = legend.selectAll("g.connector")
					.data(linkTypesInUse)
					.join("g")
					.attr("class", "connector")
				// .on("mouseenter", (d => {
				// 	if (d) {
				// 		highlighedType = d.internal_id;
				// 		console.log("Setting type for " + d.internal_id)
				// 		update(simulation, items, unmappedLinks, linkTypes, itemTypes, displayOptions);
				// 	}
				// }))
				// .on("mouseleave", d => {
				// 	highlighedType = null;
				// 	console.log("Resetting type............................")
				// 	update(simulation, items, unmappedLinks, linkTypes, itemTypes, displayOptions);
				// })
				legendConnectorItems
					.append("line")
					.attr("class", "legendItem")
					.attr("x1", 15)
					.attr("y1", (d, i) => { return (legendItemHeight * (i + 1) + legendCaptionHeight); })
					.attr("x2", legendItemWidth - 15)
					.attr("y2", (d, i) => { return (legendItemHeight * (i + 1) + legendCaptionHeight); })
					.style("stroke", d => (d ? d.colour : "gainsboro"))
					.style("stroke-width", 4)
					.attr('marker-end', d => (d ? `url(#legendMarker_${d.colour.substring(1)}${d.marker})` : ""))
					.each(d => { if (d) { createMarkerEnd("legendMarker_", dashesAndEnds, d.marker, d.colour, "5px", "5px", 0, 0); } })

				legendConnectorItems
					.append("text")
					.attr("class", "connector-text")
					.text(d => (d ? d.identifier : "Unspecified link type"))
					.attr("x", legendItemWidth)
					.attr("y", (d, i) => { return (legendItemHeight * (i + 1) + legendCaptionHeight + 5); })

			}

			if (itemsTypesInUse != null) {
				const legendItem = legend.selectAll("g.type")
					.data(itemsTypesInUse)
					.join("g")
					.attr("class", "type")
					.on("mouseover", function (d) {
						console.log(d.identifier)
					})
				legendItem
					.append("circle")
					.attr("class", "item-type")
					.attr("r", 10)
					.attr("cx", legendItemWidth / 2)
					.attr("cy", (d, i) => { return (legendItemHeight * ((itemsTypesInUse ? linkTypesInUse.length : 0) + i + 1) + legendCaptionHeight); })
					.style("stroke", d => (d ? d.colour : "black"))
					.style("fill", d => (d ? d.background_colour : "black"))
					.style("stroke-width", 2);

				legendItem
					.append("text")
					.attr("class", "item-type-text")
					.text(d => (d ? d.identifier : "No Type"))
					.attr("x", legendItemWidth)
					.attr("y", (d, i) => { return (legendItemHeight * ((itemsTypesInUse ? linkTypesInUse.length : 0) + i + 1) + legendCaptionHeight + 5); })
			}
		}
		createLegend(linkTypesInUse, itemsTypesInUse);
	};
	const searchInputEventHandler = (event) => {
		simulation.stop();
		console.log("change!" + event.currentTarget.value);
		displayOptions.partialNameCriteria = event.currentTarget.value;
		update();
		simulation.alpha(0.005).restart();
	}
	const setupInputEventHandlers = () => {
		const searchInput = document.getElementById("searchInput");
		console.log("setting up keyup handler.")
		searchInput.addEventListener("keyup", event => searchInputEventHandler(event))
	}


	const setupEffects = () => {
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
			feMerge.append('feMergeItem')
				.attr('in", "offsetBlur')

			// original image on top
			feMerge.append('feMergeItem')
				.attr('in', 'SourceGraphic');
		}
		setupDropShadowFilter(defs);
	}
	const setupRadialGradientFilter = (id, colour) => {
		const defs = d3.select("#defs");
		// append gaussian blur to filter
		const radialGradient = defs.append('radialGradient')
			.attr('id', id) /// !!! important - define id to reference it later
			.attr('fx', '0.5')
			.attr('fy', "0.5") // !!! important parameter - blur
			.attr('r', '1');
		radialGradient.append("stop")
			.attr("stop-opacity", "1")
			.attr("offset", "0%")
			.attr("stop-colour", colour);
		radialGradient.append("stop")
			.attr("stop-opacity", "0")
			.attr("offset", "60%")
			.attr("stop-colour", "#ffffff");


	}
	load().then(result => {
		simulation = setupSimulation(innerWidth, innerHeight);
		// setupInputEventHandlers(simulation);
		setupEffects();
		setupInputEventHandlers();
		setupFilterDefaults();
		update(simulation, items, unmappedLinks, linkTypes, itemTypes, displayOptions);
		createActionsMenu(simulation, items, unmappedLinks, linkTypes, itemTypes, displayOptions);
	
	});
})();