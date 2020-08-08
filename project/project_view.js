class ProjectView extends ApplicationView {
    rowPrefix = "Project";
    projectProperties = null;

    projectViewModel = new ProjectViewModel(applicationResources.defaultProjectTypeId);
    constructor() {
        super(applicationResources.projectPageString);
        document.getElementById("pageTitle").innerHTML = projectResources.pageTitleString;

        var createButton = document.getElementById("createProjectButton");
        console.assert(createButton != null, "Cannot find createProjectButton");
        createButton.addEventListener("click", event => {
            this.create(event);
        });
        var importButton = document.getElementById("importButton");
        if (importButton != null) {
            importButton.addEventListener("click", (event) => {
                this.import();
            })
        }
        var importJirasButton = document.getElementById("importJirasButton");
        if (importJirasButton != null) {
            importJirasButton.addEventListener("click", (event) => {
                this.importJiras();
            })
        }
        var exportButton = document.getElementById("exportButton");
        if (exportButton != null) {
            exportButton.addEventListener("click", (event) => {
                if (this.projectViewModel.active != null) {
                    this.export();
                }
            })
        }

        Promise.all([this.projectViewModel.load()]).then(results => {
            this.list("projectsTable");
            this.projectProperties = new ProjectProperties(applicationResources, projectResources);
            document.body.appendChild(this.projectProperties.modal);
        });
    }
    import() {
        var inputFileDialog = document.createElement("input");
        inputFileDialog.type = "file";
        inputFileDialog.addEventListener("change", event => {
            console.log(event);
            var importFile = event.target.files[0];
            if (importFile != null) {
                var fileReader = new FileReader();
                fileReader.onload = e => {
                    this.projectViewModel.importAll(e.target.result).then(results => {
                        // this.setupSVG();
                        // // Create the markers (end point symbols) within the SVG before their used on paths.
                        // ConnectorLines.createMarker(this.defs, this.visualiseViewModel.markers, "", 21, -1.5);
                        // // Map the nodes such that the data from the chart isn't mingling with the data from the node or link.
                        // this.mappedNodes = this.visualiseViewModel.nodes.map(node => { return { payload: node }; });
                        // this.mappedLinks = this.visualiseViewModel.links.map(link => {
                        //     return {
                        //         payload: link,
                        //         // D3 seems to replace the "source" and "target" with an instance of the thing it references.
                        //         // Copy the source and target from the payload to prevent chart data mixing with payload data.
                        //         source: link.source,
                        //         target: link.target,
                        //     };
                        // });
                        // //this.DrawForce("chartSVG", this.visualiseViewModel.nodes, this.visualiseViewModel.links, this.visualiseViewModel.types, this.visualiseViewModel.connectors);
                        // this.updateForce();
                    });
                }
                fileReader.readAsText(importFile);
            }
        });
        inputFileDialog.click();
    }

    importJiras() {
        var inputFileDialog = document.createElement("input");
        inputFileDialog.type = "file";
        inputFileDialog.addEventListener("change", event => {
            console.log(event);
            var importFile = event.target.files[0];
            if (importFile != null) {
                var fileReader = new FileReader();
                fileReader.onload = e => {
                    this.projectViewModel.importJiras(e.target.result)
                    // .then(items => {
                    //     this.setupSVG();
                    //     // Create the markers (end point symbols) within the SVG before their used on paths.
                    //     ConnectorLines.createMarker(this.defs, this.visualiseViewModel.markers, "", 21, -1.5);
                    //     this.DrawForce("chartSVG", this.mappedNodes, this.mappedLinks, null, null);
                    // });
                }
                fileReader.readAsText(importFile);
            }
        });
        inputFileDialog.click();
    }

    delete(id) {
        this.projectViewModel.delete(id).then(() => {
            var row = document.getElementById(this.rowPrefix + id);
            console.assert(row != null, "Can't find the row to delete.")
            var table = document.getElementById("projectsTable");
            table.deleteRow(row.rowIndex);
        });
    }
    create() {
        this.view(null);
    }

    save(data) {
        this.projectViewModel.save(data).then(result => {
            var table = document.getElementById("projectsTable");
            this.DisplayRow(table, result.project);
        });
    }
    open(id) {
        var project = null;
        if (id != null) {
            project = this.projectViewModel.projects.find((item => item.internal_id == id));
        }
        if (project != null) {
            this.projectViewModel.active = project;
        }
    }
    view(id) {
        var project = null;
        if (id != null) {
            project = this.projectViewModel.projects.find((item => item.internal_id == id));
            this.projectViewModel.current = this.projectViewModel.projects.find((item => item.internal_id == id));
        }
        this.projectProperties.view(project, this.save.bind(this));
        //this.projectProperties.view2(this.projectViewModel.current, this.save.bind(this));
    }
    list(tableName) {
        var listPromise = new Promise((resolve, reject) => {
            var table = document.getElementById(tableName);

            // Add the header row.
            table.innerHTML = `
                <tr>
                    <th>${projectResources.identifierString}</th>
                    <th>${projectResources.descriptionString}</th>
                    <th>${projectResources.createdString}</th>
                    <!--<th>${projectResources.updatedString}</th>-->
                    <th>${projectResources.statusString}</th>
                    <th>${projectResources.actionsString}</th>
                </tr>`;
            this.projectViewModel.projects.forEach((project) => {
                this.DisplayRow(table, project);
            });
        });
        return (listPromise);
    }
    DisplayRow(table, project) {
        console.assert(table != null, "No table to display Projects in.");
        console.assert(project != null, "No project to display in table row.");
        // Try to find the row in the table
        var row = document.getElementById(this.rowPrefix + project.internal_id);

        if (row == null) {
            // Row not found. Create a new row in the table and set it's id for future reference.
            row = table.insertRow(table.rows.length);
            row.setAttribute("id", this.rowPrefix + project.internal_id);
        }
        else {
            row.innerHTML = "";
        }

        var identifierCell = row.insertCell(-1);
        var descriptionCell = row.insertCell(-1);
        var createdCell = row.insertCell(-1);
        //var updatedCell = row.insertCell(-1);
        var statusCell = row.insertCell(-1);
        var actionsCell = row.insertCell(-1);

        identifierCell.innerHTML = project.identifier;
        descriptionCell.innerHTML = project.description;
        createdCell.innerHTML = project.created;
		//updatedCell.innerHTML = project.updated;
		if(this.projectViewModel.active != null) {
			statusCell.innerHTML = (this.projectViewModel.active.internal_id == project.internal_id)? "Active" : "";
		}

        var addRowPromise = new Promise((resolve, reject) => {
            actionsCell.innerHTML = `
            <button type="button" id="${"open" + project.internal_id}" data-internal_id="${project.internal_id}" class="openButton btn btn-primary btn-sm">${projectResources.openString}</button>
            <button type="button" id="${"view" + project.internal_id}" data-internal_id="${project.internal_id}" class="viewButton btn btn-info btn-sm" data-toggle="modal"
                data-target="#projectModal">${projectResources.viewString}</button>
            <button type="button" id="${"delete" + project.internal_id}" data-internal_id="${project.internal_id}" class="deleteButton btn btn-danger btn-sm">${projectResources.deleteString}
            </button>`;
            resolve();
        });
        addRowPromise.then(() => {
            var viewButton = document.getElementById("view" + project.internal_id);
            var id = viewButton.dataset.internal_id;
            // Find the project in the loaded project collection.
            console.assert(viewButton != null, "Can't find viewProjectButton");
            viewButton.addEventListener("click", event => this.view(id));

            var deleteButton = document.getElementById("delete" + project.internal_id);
            console.assert(deleteButton != null, "Can't find deleteProjectButton");
            id = deleteButton.dataset.internal_id;
            deleteButton.addEventListener("click", event => this.delete(id));

            var openButton = document.getElementById("open" + project.internal_id);
            console.assert(openButton != null, "Can't find openProjectButton");
            id = openButton.dataset.internal_id;
            openButton.addEventListener("click", event => this.open(id));
        });
    }
    export() {
        this.projectViewModel.exportAll().then(results => {
            var exportJSON = document.createElement("a");
            var blob = new Blob([JSON.stringify(results)], { type: "text/JSON; charset=utf-8;" });
            var url = URL.createObjectURL(blob);
            exportJSON.href = url;
            exportJSON.setAttribute("download", this.projectViewModel.active.identifier + ".JSON");
            exportJSON.click();
        });
    }
}

window.onload = () => {
    let projectView = new ProjectView();
}

