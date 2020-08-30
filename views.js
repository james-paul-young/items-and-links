(async () => {
	let projects = null;
	let sortOrder = null;
	let filter = null;

	const deleteRow = (row) => {
		projectsDB.deleteProjectFromDB(row.dataset.internal_id).then(result => {
			const table = document.getElementById("projectsTable");
			table.deleteRow(row.rowIndex);
		});
	};
	const load = () => {
		return new Promise((resolve, reject) => {
			Promise.allSettled([
				projectsDB.loadProjects(),
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
		const createProjectButton = document.getElementById("createProjectButton");
		console.assert(createProjectButton != null, "Cannot find createProjectButton");
		createProjectButton.addEventListener("click", event => create());

		const exportProjectsButton = document.getElementById("exportProjectsButton");
		console.assert(exportProjectsButton != null, "Cannot find exportProjectsButton");
		exportProjectsButton.addEventListener("click", event => exportProjects());

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
			<tr data-internal_id="${project.internal_id}" data-toggle="modal" data-target="#thingModal" class="item-row">
				<td>${project.active? "true" : ""}</td>
				<td><nobr>${project.identifier}</nobr></td>
				<td>${project.description}</td>
				<td>${((project.updated == null) ? "" : project.updated.toString().substring(4, project.updated.toString().indexOf(" G")))}</td>
			</tr>
		`
	};
	let selectedRow = null;
	const save = (data) => {
		projectsDB.saveProjectToDB(data).then(result => {
			const table = document.getElementById("thingsTable");
			if (selectedRow != null) {
				selectedRow.innerHTML = getRowHTML(result);
			}
			else {
				load().then(result => {
					list();
				});
			}
		});
	}
	const activateProject = projectToActivate => {
		projectToActivate.active = true;
		projectsDB.activateProject(projectToActivate).then(result => {
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
		document.body.appendChild(setupProjectPropertiesModal());
		const project = projects.find(project => project.internal_id == id);
		viewProject(project, save, deleteProject, activateProject);
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
		const thingHTML = curatedProjectsList
			.map(project => getRowHTML(project));
		const table = document.getElementById("projectsTable");
		table.tBodies[0].innerHTML = thingHTML.join("");
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