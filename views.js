"use strict";

class View {
	constructor(controller) {
		document.getElementById("hamburger").addEventListener("click", event => {
			document.getElementById("v-pills-tab").classList.toggle("nav-collapsed");
			document.getElementById("v-pills-tab").classList.toggle("nav-expanded");
		});

		this.projectView = new ProjectView(controller);

		this.itemView = new ItemView(controller);

		// document.getElementById("items-tab").addEventListener("click", event => {
		// 	this.itemView.display();
		// });
		document.getElementById("component-tab").addEventListener("click", event => {
			this.projectView.display();
		});
		document.getElementById("component-tab").click();

		document.getElementById("search").addEventListener("input", function (event) {
			controller.searchString = this.value;
		})
		// // Listen for the change in project/component
		// document.addEventListener("project.currentChanged", event => {
		// 	document.getElementById("component-name").innerHTML = event.detail.newValue.identifier;
		// });
	}
}
class BaseView {
	constructor(controller, UIElementIdPrefix, viewTitle, listId) {
		this.UIElementIdPrefix = UIElementIdPrefix;
		this.viewTitle = viewTitle
		this._controller = controller;
		this.listId = listId;

		const toastElList = [].slice.call(document.querySelectorAll('.toast'))
		this.toastList = toastElList.map(function (toastEl) {
			return new bootstrap.Toast(toastEl)
		});
		this.toastList.forEach(toast => toast.hide());

		document.body.appendChild(this.properties);
		document.getElementById(`${this.UIElementIdPrefix}Save`).addEventListener("click", async event => {
			this.save();
		});
		document.getElementById(`new-${this.UIElementIdPrefix}`).addEventListener("click", async event => {
			this.new();
		});
		document.getElementById(`${this.UIElementIdPrefix}Delete`).addEventListener("click", async event => {
			this.delete();
		});
		document.getElementById(`${this.UIElementIdPrefix}IdentifierInput`).addEventListener("keyup", event => {
			this.currentEntry.identifier = event.currentTarget.value;
		});
		document.getElementById(`${this.UIElementIdPrefix}DescriptionInput`).addEventListener("keyup", event => {
			this.currentEntry.description = event.currentTarget.value;
		});
		document.getElementById(`${this.UIElementIdPrefix}ForecolourInput`).addEventListener("change", event => {
			this.currentEntry.forecolour = event.currentTarget.value;
		});
		document.getElementById(`${this.UIElementIdPrefix}BackcolourInput`).addEventListener("change", event => {
			this.currentEntry.backcolour = event.currentTarget.value;
		});

	}
	get controller() { return this._controller; }

	get currentEntry() { return this._currentEntry; }
	set currentEntry(value) {
		this._currentEntry = value;
		//this.copytoProperties(this._currentEntry);
		//this.setActiveSidebarEntry(this._currentEntry);
		this.currentChanged(this._currentEntry);
	}

	get containerId() { return this._containerId; }
	set containerId(value) { this._containerId = value; }

	get viewTitle() { return this._viewTitle; }

	set viewTitle(value) {
		this._viewTitle = value;
	}
	get HTML() {
		return `
			<div class="mb-3">
				<label for="${this.UIElementIdPrefix}IdentifierInput" class="form-label">Identifier</label>
				<input type="text" class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}IdentifierInput"
					placeholder="Enter Identifier...">
			</div>
			<div class="mb-3">
				<label for="${this.UIElementIdPrefix}DescriptionInput" class="form-label">Description</label>
				<textarea class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}DescriptionInput" rows="3" placeholder="Enter Description..."></textarea>
			</div>
			<div class="mb-3">
				<label for="${this.UIElementIdPrefix}ForecolorInput" class="form-label">Forecolour</label>
				<input type="color" class="form-control form-control-color bg-dark text-white" id="${this.UIElementIdPrefix}ForecolourInput"
					title="Choose your color">
			</div>
			<div class="mb-3">
				<label for="${this.UIElementIdPrefix}BackcolorInput" class="form-label">Backcolor</label>
				<input type="color" class="form-control form-control-color bg-dark text-white" id="${this.UIElementIdPrefix}BackcolourInput"
					title="Choose your color">
			</div>
			<div class="mb-3">
				<label for="${this.UIElementIdPrefix}UpdatedInput" class="form-label">Last updated</label>
				<input type="text" class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}UpdatedInput" readonly="true">
			</div>
			<div class="mb-3">
				<label for="${this.UIElementIdPrefix}CreatedInput" class="form-label">Created</label>
				<input type="text" class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}CreatedInput" readonly="true">
			</div>
		`;
	}

	async delete() {
		this.displayProgress("Deleting...");
	}
	async deleted() {
		this.deleteEntry(this.listId, this._currentEntry);
		this.displayProgress("Deleted.");
	}
	async deleteEntry(listId, entry) {
		const rowToDelete = document.getElementById(entry.internal_id);
		const rowIndex = rowToDelete.rowIndex;
		document.getElementById(this.UIElementIdPrefix + "-" + listId).deleteRow(rowIndex - 1);
	}
	async save() {
		this.displayProgress("Saving...");
	}
	async saved(entry) {
		this.copytoProperties(entry);
		document.getElementById(entry.internal_id).innerHTML = this.rowHTML(entry);
		this.displayProgress("Saved.");
	}

	async new(entry) {
		this.createEntry(this.listId, entry, false, true);
	}
	get controller() { return this._controller; }

	async displayProgress(message) {
		document.getElementById("progress-message").innerHTML = message;
		this.toastList[0].show();
	}
	async displayList(listId, listEntries) {
		const table = document.getElementById(this.UIElementIdPrefix + "-" + listId);
		table.innerHTML = "";
		if (listEntries) {
			listEntries.forEach(listEntry => {
				this.createEntry(listId, listEntry);
			});
		}
	}
	rowHTML(entry) { return ""; }
	createEntry(listId, entry, selected, displayProperties) {
		const clickable = document.createElement("tr");
		clickable.setAttribute("id", entry.internal_id);
		clickable.setAttribute("role", "button");
		clickable.setAttribute("data-bs-toggle", "modal");
		clickable.setAttribute("data-bs-target", "#" + this.UIElementIdPrefix + "-properties");
		if (selected) {
			Array.from(document.getElementById(this.UIElementIdPrefix + "-" + listId).rows).forEach(element => {
				element.classList.remove("table-primary");
			});
			clickable.classList.add("table-primary");
		}
		clickable.innerHTML = this.rowHTML(entry);
		document.getElementById(this.UIElementIdPrefix + "-" + listId).appendChild(clickable);

		clickable.addEventListener("click", event => {
			this.currentEntry = entry;
		});
		if (displayProperties) {
			clickable.click();
		}
	}
	async copytoProperties(entry) {
		document.getElementById(`${this.UIElementIdPrefix}IdentifierInput`).value = entry.identifier ? entry.identifier : "";
		document.getElementById(`${this.UIElementIdPrefix}DescriptionInput`).value = entry.description ? entry.description : "";
		document.getElementById(`${this.UIElementIdPrefix}ForecolourInput`).value = entry.forecolour ? entry.forecolour : "#000000";
		document.getElementById(`${this.UIElementIdPrefix}BackcolourInput`).value = entry.backcolour ? entry.backcolour : "#000000";
		document.getElementById(`${this.UIElementIdPrefix}UpdatedInput`).value = entry.updated ? entry.updated : "";
		document.getElementById(`${this.UIElementIdPrefix}CreatedInput`).value = entry.created ? entry.created : "";
	}
	async currentChanged(entry) {
		this.copytoProperties(entry);
	}
	async copyFromUI(entry) {
		// entry.identifier = document.getElementById(`${this.UIElementIdPrefix}IdentifierInput`).value;
		// entry.description = document.getElementById(`${this.UIElementIdPrefix}DescriptionInput`).value;
		// entry.forecolour = document.getElementById(`${this.UIElementIdPrefix}ForecolorInput`).value;
		// entry.backcolour = document.getElementById(`${this.UIElementIdPrefix}BackcolorInput`).value;
	}
	get properties() {
	}
}

// class ItemView extends BaseView {
// 	constructor(controller) {
// 		super(controller, "item-details", "item", "Item Details");
// 		this.initialise();
// 	}
// 	async display() {
// 		this.displayProgress("Loading...");
// 		this.controller.loadItems();
// 	}
// 	async initialise() {
// 		this.controller.onItemsLoaded.push(document);
// 		this.controller.onCurrentItemChanged.push(document);
// 		this.controller.onItemSaved.push(document);
// 		this.controller.onNewItem.push(document);

// 		document.addEventListener("item.new", event => {
// 			this.createSidebarEntry("sidebarList", event.detail.newValue);
// 		});
// 		document.addEventListener("item.currentChanged", async event => {

// 		});
// 		document.addEventListener("item.saved", async event => {
// 			this.saved(event.detail.newValue);
// 		});
// 		document.addEventListener("items.loaded", async event => {
// 			await this.displayList("Items", "sidebarList", event.detail.newValue);
// 			if (event.detail.newValue.length > 0) {
// 				this.controller.currentItem = event.detail.newValue[0];
// 			}
// 			this.displayProgress("Loaded " + event.detail.newValue.length + " items.");
// 		});
// 	}
// 	async currentChanged(entry) {
// 		super.currentChanged(entry);
// 		this.controller.currentItem = entry;
// 	}

// 	async save() {
// 		await this.copyFromUI(this.controller.currentItem);
// 		this.controller.saveCurrentItem();
// 	}
// 	async new() {
// 		this.controller.newItem();
// 	}
// }

class ProjectView extends BaseView {
	constructor(controller) {
		super(controller, "component", "Components", "table");
		this.initialise();
	}

	rowHTML(entry) {
		const HTML = `
			<td>${entry.active ? `<span class="badge bg-success">Active</span>` : ""}</td>
			<td>${entry.identifier ? entry.identifier : ""}</td>
			<td>${entry.description ? entry.description : ""}</td>
			<td>${entry.updated ? entry.updated : ""}</td>
		`;
		return HTML;
	}
	async display() {
		this.displayProgress("Loading...");
		await this.controller.loadProjects();
		if (this.controller.activeProject != null) {
			document.getElementById("current-component").innerHTML = this.controller.activeProject.identifier;
		}
	}
	async setasActiveAndSave() {
		this.controller.activateCurrentProject();
	}
	async initialise() {
		this.controller.onProjectsLoaded.push(document);
		this.controller.onCurrentProjectChanged.push(document);
		this.controller.onProjectSaved.push(document);
		this.controller.onNewProject.push(document);
		this.controller.onProjectActivated.push(document);

		this.controller.onSearchActive.push(document);

		document.getElementById(`${this.UIElementIdPrefix}Active`).addEventListener("click", async event => {
			this.controller.activateCurrentProject();
		});

		document.addEventListener("project.new", event => {
			//this.createEntry("table", event.detail.newValue);
		});
		document.addEventListener("project.currentChanged", async event => {
		});
		document.addEventListener("project.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("projects.searched", async event => {
			await this.displayList("table", event.detail.newValue);
		});
		document.addEventListener("project.activated", async event => {
			await this.displayList("table", this.controller.projects);
			document.getElementById("current-component").innerHTML = event.detail.newValue.identifier;
		});
		document.addEventListener("projects.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.length > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			document.getElementById("general-status").innerHTML = event.detail.newValue.length + " projects.";
			this.displayProgress("Loaded " + event.detail.newValue.length + " projects.");
		});
	}
	async currentChanged(entry) {
		super.currentChanged(entry);
		this.controller.currentProject = entry;
	}

	async save() {
		super.save();
		await this.copyFromUI(this.controller.currentProject);
		this.controller.saveCurrentProject();
	}
	async new() {
		this.controller.newProject();
		super.new(this.controller.currentProject);
	}
	async delete() {
		super.delete();
		await this.controller.deleteProject();
		super.deleted();
	}
	get properties() {
		const modal = document.createElement("div");
		modal.setAttribute("id", this.UIElementIdPrefix + "-properties");
		modal.setAttribute("class", "modal fade");
		modal.setAttribute("tabindex", "-1");
		modal.setAttribute("role", "dialog");
		modal.innerHTML = `
				<div class="modal-dialog modal-lg">
					<div class="modal-content bg-dark text-white">
						<div class="modal-header">
							<h5 class="modal-title">Component Properties</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body">${this.HTML}</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Save">Save</button>
							<button type="button" class="btn btn-danger mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Delete">Delete</button>
							<button type="button" class="btn btn-success mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Active">Save and set as Active</button>
						</div>
					</div>
				</div>
			`;
		return modal;
	}

}

class ItemView extends BaseView {
	constructor(controller) {
		super(controller, "item", "Items", "table");
		this.initialise();
	}

	rowHTML(entry) {
		const HTML = `
			<td>Type</td>
			<td>${entry.identifier ? entry.identifier : ""}</td>
			<td>${entry.description ? entry.description : ""}</td>
			<td>${entry.updated ? entry.updated : ""}</td>
		`;
		return HTML;
	}
	async display() {
		this.displayProgress("Loading...");
		await this.controller.loadItems();
	}
	async initialise() {
		this.controller.onItemsLoaded.push(document);
		this.controller.onCurrentItemChanged.push(document);
		this.controller.onItemSaved.push(document);
		this.controller.onNewItem.push(document);

		this.controller.onSearchActive.push(document);

		document.addEventListener("item.new", event => {
			//this.createEntry("table", event.detail.newValue);
		});
		document.addEventListener("item.currentChanged", async event => {
		});
		document.addEventListener("project.currentChanged", async event => {
			await this.displayList("table", this.controller.items);
			if (event.detail.newValue.length > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			document.getElementById("general-status").innerHTML = event.detail.newValue.length + " items.";
			this.displayProgress("Loaded " + event.detail.newValue.length + " items.");
		});

		document.addEventListener("item.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("items.searched", async event => {
			await this.displayList("table", event.detail.newValue);
		});
		document.addEventListener("items.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.length > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			document.getElementById("general-status").innerHTML = event.detail.newValue.length + " items.";
			this.displayProgress("Loaded " + event.detail.newValue.length + " items.");
		});
	}
	async currentChanged(entry) {
		super.currentChanged(entry);
		this.controller.currentItem = entry;
	}

	async save() {
		super.save();
		await this.copyFromUI(this.controller.currentItem);
		this.controller.saveCurrentItem();
	}
	async new() {
		this.controller.newItem();
		super.new(this.controller.currentItem);
	}
	async delete() {
		super.delete();
		await this.controller.deleteItem();
		super.deleted();
	}
	get properties() {
		const modal = document.createElement("div");
		modal.setAttribute("id", this.UIElementIdPrefix + "-properties");
		modal.setAttribute("class", "modal fade");
		modal.setAttribute("tabindex", "-1");
		modal.setAttribute("role", "dialog");
		modal.innerHTML = `
				<div class="modal-dialog modal-lg">
					<div class="modal-content bg-dark text-white">
						<div class="modal-header">
							<h5 class="modal-title">Component Properties</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
							<div class="modal-body">
							<div class="mb-3">
								<label for="${this.UIElementIdPrefix}TypeInput" class="form-label">Identifier</label>
								<select class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}TypeInput"
									placeholder="Enter Type...">
							</div>
							${this.HTML}
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Save">Save</button>
							<button type="button" class="btn btn-danger mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Delete">Delete</button>
						</div>
					</div>
				</div>
			`;
		return modal;
	}

}

const view = new View(new Controller());
