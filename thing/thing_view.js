(async () => {
	let items = null, links = null, linkTypes = null, itemTypes = null, activeProject = null;
	let sortOrder = null;
	let filter = null;
	let selectedRow = null;

	const deleteRow = (row) => {
		itemsDB.deleteItemFromDB(row.dataset.internal_id).then(result => {
			const table = document.getElementById("thingsTable");
			table.deleteRow(row.rowIndex);
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			projectsDB.getActiveProject().then(project => {
				activeProject = project;
				const activeProjectNameLabel = document.getElementById("activeProjectNameLabel");
				activeProjectNameLabel.innerHTML = activeProject.identifier;
				Promise.allSettled([
					itemsDB.loadItems(project.internal_id),
					itemTypesDB.loadTypes(project.internal_id),
					linksDB.loadConnections(project.internal_id),
					linkTypesDB.loadConnectors(project.internal_id),
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
		const createthingButton = document.getElementById("createThingButton");
		console.assert(createthingButton != null, "Cannot find createthingButton");
		createthingButton.addEventListener("click", event => create());

		const exportThingsButton = document.getElementById("exportThingsButton");
		console.assert(exportThingsButton != null, "Cannot find exportThingsButton");
		exportThingsButton.addEventListener("click", event => exportItems());

		const typeSortOrderAction = document.getElementById("typeSortOrder");
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

		const identifierSortOrderAction = document.getElementById("identifierSortOrder");
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
		const descriptionSortOrderAction = document.getElementById("descriptionSortOrder");
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
		const updatedSortOrderAction = document.getElementById("updatedSortOrder");
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
			<tr data-internal_id="${item.internal_id}" data-toggle="modal" data-target="#thingModal" class="item-row">
				<td>${(item.type == null) ? "" : item.type.identifier}</td>
				<td><nobr>${item.identifier}</nobr></td>
				<td>${item.description}</td>
				<td>${((item.updated == null) ? "" : item.updated.toString().substring(4, item.updated.toString().indexOf(" G")))}</td>
			</tr>
		`
	};
	const save = (data) => {
		data.project_id = activeProject.internal_id;
		itemsDB.saveItemToDB(data).then(result => {
			load().then(result => {
				list();
			});
		});
	}
	const deleteItem = () => {
		deleteRow(selectedRow);
	}
	const view = (id) => {
		const itemModal = document.getElementById("itemModal");
		if (itemModal) {
			document.body.removeChild(itemModal);
		}
		document.body.appendChild(setupItemPropertiesModal());
		const item = items.find(item => item.internal_id == id);
		viewItem(item, null, save, items, links, linkTypes, itemTypes, null, deleteItem);
		$('#itemModal').modal();
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
		const itemsList = items
			.filter(filterFunction)
			.sort(sortFunction);
		return itemsList;
	}
	const list = () => {
		const curatedItemsList = curatedList();
		const thingHTML = curatedItemsList
			.map(item => getRowHTML(item));
		const table = document.getElementById("thingsTable");
		table.tBodies[0].innerHTML = thingHTML.join("");
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
	load().then(result => {
		list();
		setupEventHandlers();
	});
})();

document.onkeyup = (event) => {
	switch (event.code) {
		case "F2":
			{
				const createThingButton = document.getElementById("createThingButton");
				console.assert(createThingButton != null, "Cannot find create button.");
				createThingButton.click();
			}
			break;
		case "keyS":
			{
				if (event.ctrlKey) {
					const saveThingButton = document.getElementById("saveThingButton");
					console.assert(saveThingButton != null, "Cannot find save button.");
					saveThingButton.click();
				}
			}
			break;
	}
}
