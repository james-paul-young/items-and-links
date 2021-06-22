"use strict";
const dbVersion = 1;
const dbName = "items-and-links";

class View {
	constructor(controller) {

		document.getElementById("hamburger").addEventListener("click", event => {
			document.getElementById("v-pills-tab").classList.toggle("nav-collapsed");
			document.getElementById("v-pills-tab").classList.toggle("nav-expanded");
		});

		this.projectView = new ProjectView(controller);
		this.itemView = new ItemView(controller);
		this.linkView = new LinkView(controller);
		this.itemTypeView = new ItemTypeView(controller);
		this.linkTypeView = new LinkTypeView(controller);
		this.visualiseView = new VisualiseView(controller);

		this.projectView.display().then(() => {
			Promise.all([this.itemView.display(),
			this.itemTypeView.display(),
			this.linkView.display(),
			this.linkTypeView.display()]).then(results => {
				//this.visualiseView.display();
			})
		});

		document.getElementById("item-tab").addEventListener("click", event => {
			this.itemView.display();
		});
		document.getElementById("item-type-tab").addEventListener("click", event => {
			this.itemTypeView.display();
		});
		document.getElementById("link-tab").addEventListener("click", event => {
			this.linkView.display();
		});
		document.getElementById("link-type-tab").addEventListener("click", event => {
			this.linkTypeView.display();
		});
		document.getElementById("project-tab").addEventListener("click", event => {
			this.projectView.display();
		});
		document.getElementById("visualise-tab").addEventListener("click", event => {
			this.visualiseView.display();
		});

		document.getElementById("search").addEventListener("input", function (event) {
			controller.searchString = this.value;
		})
	}
}
class BaseView {
	constructor(controller, UIElementIdPrefix, viewTitle, listId, mainUIElement) {

		this.applicationName = "Items and Links";

		this.UIElementIdPrefix = UIElementIdPrefix;
		this.mainUIElement = mainUIElement;
		this.viewTitle = viewTitle
		this._controller = controller;
		this.listId = listId;

		const toastElList = [].slice.call(document.querySelectorAll('.toast'));
		this.toastList = toastElList.map(function (toastEl) {
			return new bootstrap.Toast(toastEl)
		});
		this.toastList.forEach(toast => toast.hide());

		if (this.properties) {
			document.body.appendChild(this.properties);
		}
		const saveButton = document.getElementById(`${this.UIElementIdPrefix}Save`);
		if (saveButton) {
			saveButton.addEventListener("click", async event => {
				this.save();
			});
		}
		const newButton = document.getElementById(`new-${this.UIElementIdPrefix}`);
		if (newButton) {
			newButton.addEventListener("click", async event => {
				this.new();
			});
		}
		const deleteButton = document.getElementById(`${this.UIElementIdPrefix}Delete`);
		if (deleteButton) {
			deleteButton.addEventListener("click", async event => {
				this.delete();
			});
		}
		const identifierInput = document.getElementById(`${this.UIElementIdPrefix}IdentifierInput`);
		if (identifierInput) {
			identifierInput.addEventListener("keyup", event => {
				this.currentEntry.identifier = event.currentTarget.value;
			});
		}
		const descriptionInput = document.getElementById(`${this.UIElementIdPrefix}DescriptionInput`);
		if (descriptionInput) {
			document.getElementById(`${this.UIElementIdPrefix}DescriptionInput`).addEventListener("keyup", event => {
				this.currentEntry.description = event.currentTarget.value;
			});
		}
		const forecolourInput = document.getElementById(`${this.UIElementIdPrefix}ForecolourInput`);
		if (forecolourInput) {
			document.getElementById(`${this.UIElementIdPrefix}ForecolourInput`).addEventListener("change", event => {
				this.currentEntry.forecolour = event.currentTarget.value;
			});
		}
		const backcolourInput = document.getElementById(`${this.UIElementIdPrefix}BackcolourInput`);
		if (backcolourInput) {
			document.getElementById(`${this.UIElementIdPrefix}BackcolourInput`).addEventListener("change", event => {
				this.currentEntry.backcolour = event.currentTarget.value;
			});
		}

	}
	static makeid(length) {
		console.assert(length && (length > 0), "No length provided for creating an ID");

		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	get controller() { return this._controller; }

	get currentEntry() { return this._currentEntry; }
	set currentEntry(value) {
		this._currentEntry = value;
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
			<div class="row">
				<div class="col">
					<div class="mb-3">
						<label for="${this.UIElementIdPrefix}ForecolourInput" class="form-label">Forecolour</label>
						<input type="color" class="form-control form-control-color bg-dark text-white" id="${this.UIElementIdPrefix}ForecolourInput"
							title="Choose your color">
					</div>
				</div>
				<div class="col">
					<div class="mb-3">
						<label for="${this.UIElementIdPrefix}BackcolourInput" class="form-label">Backcolor</label>
						<input type="color" class="form-control form-control-color bg-dark text-white" id="${this.UIElementIdPrefix}BackcolourInput"
							title="Choose your color">
					</div>
				</div>
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
		// Row may not exist if importing.
		if (document.getElementById(entry.internal_id)) {
			document.getElementById(entry.internal_id).innerHTML = this.rowHTML(entry);
		}
		this.displayProgress("Saved.");
	}

	async new(entry) {
		this.createEntry(this.listId, entry, false, true);
	}
	get controller() { return this._controller; }

	async displayProgress(message) {
		if (this.mainUIElement.classList.contains("active")) {
			document.getElementById("progress-message").innerHTML = message;
			this.toastList[0].show();
		}
	}
	async displayStatus(message) {
		if (this.mainUIElement.classList.contains("active")) {
			document.getElementById("general-status").innerHTML = message;
		}
	}
	async displayList(listId, listEntries) {
		const table = document.getElementById(this.UIElementIdPrefix + "-" + listId);
		table.innerHTML = "";
		if (listEntries) {
			[...listEntries.values()].forEach(listEntry => {
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
	get properties() {
	}
	async display() {
		if (this.mainUIElement.classList.contains("active")) {
			this.displayProgress("Loading...");
			document.title = this.applicationName + " - " + this.viewTitle;
		}
	}
}

class ProjectView extends BaseView {
	constructor(controller) {
		super(controller, "project", "Projects", "table", document.getElementById("project-tab"));
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
		await super.display();
		await this.controller.loadProjects();
		if (this.controller.activeProject != null) {
			document.getElementById("current-project").innerHTML = this.controller.activeProject.identifier;
		}
		this.displayStatus(`Displaying ${this.controller.projects.size} of ${this.controller.allProjects.size} projects.`)
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
		document.getElementById(`${this.UIElementIdPrefix}Export`).addEventListener("click", async event => {
			this.displayProgress("Exporting...");
			await this.controller.exportToFile();
			this.displayProgress("Exported.");
		});
		document.getElementById(`createProjectFromFileButton`).addEventListener("click", async event => {
			const inputFileDialog = document.createElement("input");
			inputFileDialog.type = "file";
			inputFileDialog.accept = ".json"
			inputFileDialog.addEventListener("change", event => {
				//console.log(event);
				var importFile = event.target.files[0];
				if (importFile != null) {
					const fileReader = new FileReader();
					fileReader.onload = e => {
						this.controller.importFromFile(e.target.result);
					}
					fileReader.readAsText(importFile);
				}
			});
			inputFileDialog.click();
		});

		document.addEventListener("project.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("projects.searched", async event => {
			await this.displayList("table", event.detail.newValue);
			this.displayStatus(`Displaying ${this.controller.projects.size} of ${this.controller.allProjects.size} projects.`)
		});
		document.addEventListener("project.activated", async event => {
			await this.displayList("table", this.controller.projects);
			document.getElementById("current-project").innerHTML = event.detail.newValue.identifier;
		});
		document.addEventListener("projects.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue.entries().next().value[1];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " projects.");
		});
	}
	async currentChanged(entry) {
		super.currentChanged(entry);
		this.controller.currentProject = entry;
	}

	async save() {
		super.save();
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
							<h5 class="modal-title">Project Properties</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body">${this.HTML}</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Export">Export</button>
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
		super(controller, "item", "Items", "table", document.getElementById("item-tab"));
		this.initialise();
	}

	rowHTML(entry) {
		const itemType = this.controller.itemTypes.get(entry.type_id)//.find(type => type.internal_id == entry.type_id);
		let imageHTML = "";
		if (itemType) {
			imageHTML = `<svg class="circular-icon-list">
			<g transform="translate(15, 15)">
				<circle r="12" ${itemType ? `stroke="${itemType.forecolour}"` : ""} ${itemType ? `fill="${itemType.backcolour}"` : ""}></circle>
			</g>
		</svg>`;
		}
		const HTML = `
			<td>${imageHTML} ${itemType ? itemType.identifier : ""}</nobr></td>
			<td>${entry.identifier ? entry.identifier : ""}</td>
			<td>${entry.description ? entry.description : ""}</td>
			<td>${entry.updated ? entry.updated : ""}</td>
		`;
		return HTML;
	}
	async display() {
		await super.display();
		await this.controller.loadItems();
		this.displayStatus(`Displaying ${this.controller.items.size} of ${this.controller.allItems.size} items.`);
	}
	async initialise() {
		this.controller.onItemsLoaded.push(document);
		this.controller.onCurrentItemChanged.push(document);
		this.controller.onItemSaved.push(document);
		this.controller.onNewItem.push(document);

		this.controller.onSearchActive.push(document);

		document.addEventListener("item.currentChanged", async event => {
			this.refreshItemTypeList(this.controller.currentItem.type_id);
		});
		document.addEventListener("project.currentChanged", async event => {
			await this.displayList("table", this.controller.items);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " items.", document.getElementById("item-tab"));
		});

		document.addEventListener("item.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("items.searched", async event => {
			await this.displayList("table", event.detail.newValue);
			this.displayStatus(`Displaying ${this.controller.items.size} of ${this.controller.allItems.size} items.`);
		});
		document.addEventListener("items.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue.entries().next().value[1];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " items.");
		});
		document.addEventListener("item-types.loaded", async event => {
			if (this.controller.currentItem) {
				this.refreshItemTypeList(this.controller.currentItem.type_id);
			}
		});
		document.addEventListener("item-type.saved", event => {
			this.refreshItemTypeList(this.controller.currentItem.type_id);
		});

	}
	static itemShortList(items, itemTypes, UIElementIdPrefix, container_id, selected_id = "", search_input_id = "") {
		const searchString = document.getElementById(UIElementIdPrefix + search_input_id).value;
		let HTML = `
			<nav>
				<ul class="short-list" id="${container_id}-items-short-list">
					<li${(selected_id == "") ? ` class="list-item-selected"` : ""} role="button"><i>No selection</i></li>`;
		HTML += [...items.values()].filter(item => item.identifier.indexOf(searchString) >= 0)
			.map(item => {
				const itemType = itemTypes.get(item.type_id);
				const strokeAttribute = itemType ? `stroke="${itemType.forecolour}"` : "";
				const fillAttribute = itemType ? `fill="${itemType.backcolour}"` : "";
				const imageHTML = `
					<svg class="list-item-visual-short">
						<g transform="translate(15, 15)">
							<circle r="12" ${strokeAttribute} ${fillAttribute}></circle>
						</g>
					</svg>`;
				let selected = (selected_id == item.internal_id) ? `list-item-selected` : "";
				return `<li data-internal_id="${item.internal_id}" class="ms-n1 mt-1 mb-1 ${selected}" role="button"><span>${imageHTML}</span><span class="ms-2 align-middle">${item.identifier}</span></li>`;
			}).join("")
		HTML += `
				</ul>
			</nav >
			`;
		document.getElementById(UIElementIdPrefix + container_id).innerHTML = HTML;
		const list = document.getElementById(container_id + "-items-short-list");
		const allItemsList = Array.from(list.querySelectorAll("li"));

		allItemsList.forEach(element => {
			element.addEventListener("click", event => {
				const selected = list.querySelector(".list-item-selected");
				if (selected) {
					selected.classList.remove("list-item-selected");
				}
				event.currentTarget.classList.add("list-item-selected");
			})
		});
		document.getElementById(UIElementIdPrefix + search_input_id).addEventListener("input", event => {
			ItemView.itemShortList(items, itemTypes, UIElementIdPrefix, container_id, selected_id, search_input_id);
		});
		return HTML;
	}
	static itemShortList2(items = [], itemTypes = [], container_id = "", selected_id = "") {
		const uniquePrefix = BaseView.makeid("20");
		let HTML = `
			<input type="text" class="form-control bg-dark text-white" id="${uniquePrefix}FilterInput"
			placeholder="Filter items...">
			<nav>`;
		const refreshList = (searchString) => {
			`<ul id="${uniquePrefix}List" class="short-list">
					<li${(selected_id == "") ? ` class="list-item-selected"` : ""} role="button"><i>No selection</i></li>`;
			HTML += items.map(item => {
				const itemType = itemTypes.find(itemType => itemType.internal_id == item.type_id);
				const strokeAttribute = itemType ? `stroke="${itemType.forecolour}"` : "";
				const fillAttribute = itemType ? `fill="${itemType.backcolour}"` : "";
				const imageHTML = `
					<svg class="list-item-visual-short">
						<g transform="translate(15, 15)">
							<circle r="12" ${strokeAttribute} ${fillAttribute}></circle>
						</g>
					</svg>`;
				let selected = (selected_id == item.internal_id) ? `list-item-selected` : "";
				return `<li data-internal_id="${item.internal_id}" class="ms-n1 mt-1 mb-1 ${selected}" role="button"><span>${imageHTML}</span><span class="ms-2 align-middle">${item.identifier}</span></li>`;
			}).join("")
			HTML += `
				</ul>
			</nav >
			`;
			document.getElementById(container_id).innerHTML = HTML;
		}
		refreshList();
		const list = document.getElementById(uniquePrefix + "List");
		const listItems = Array.from(list.querySelectorAll("li"));

		listItems.forEach(listItem => {
			listItem.addEventListener("click", event => {
				const selected = list.querySelector(".list-item-selected");
				if (selected) {
					selected.classList.remove("list-item-selected");
				}
				event.currentTarget.classList.add("list-item-selected");
			})
		});
		document.getElementById(uniquePrefix + "FilterInput").addEventListener("input", event => {
			refreshList();
		});
		return HTML;
	}

	refreshItemTypeList(selected_id) {
		const HTML = `
	<nav>
	<ul class="item-types-short-list" id="${this.UIElementIdPrefix}-item-types-short-list">
		<li${selected_id == null ? ` class="item-type-selected"` : ""} role="button"><i>No Type</i></li>
					${[...this.controller.itemTypes.values()].map(itemType => {
			const imageHTML = `<svg class="circular-icon-list">
							<g transform="translate(15, 15)">
								<circle r="12" ${itemType ? `stroke="${itemType.forecolour}"` : ""} ${itemType ? `fill="${itemType.backcolour}"` : ""}></circle>
							</g>
						</svg>`;
			let selected = (itemType.internal_id == this.controller.currentItem.type_id) ? `item-type-selected` : "";
			return `<li data-internal_id="${itemType.internal_id}" class="ms-n1 mt-1 mb-1 ${selected}" role="button"><span>${imageHTML}</span><span class="ms-2 align-middle">${itemType.identifier}</span></li>`;
		}).join("")
			}
	</ul>
			</nav>
	`
		document.getElementById(this.UIElementIdPrefix + "TypeInput").innerHTML = HTML;
		const allItemTypeListItems = Array.from(document.querySelectorAll("#" + this.UIElementIdPrefix + "-item-types-short-list > li"));

		allItemTypeListItems.forEach(element => {
			element.addEventListener("click", event => {
				const selected = document.querySelector("#" + this.UIElementIdPrefix + "-item-types-short-list > .item-type-selected");
				if (selected) {
					selected.classList.remove("item-type-selected");
				}
				event.currentTarget.classList.add("item-type-selected");
			})
		});
		return HTML;
	}

	async currentChanged(entry) {
		super.currentChanged(entry);
		this.controller.currentItem = entry;
	}

	async save() {
		super.save();
		const typeSelected = document.querySelector("#" + this.UIElementIdPrefix + "-item-types-short-list > .item-type-selected");
		this.controller.currentItem.type_id = typeSelected.dataset.internal_id;
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
				<h5 class="modal-title">Item Properties</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="mb-3">
					<label for="${this.UIElementIdPrefix}TypeInput" class="form-label">Type</label>
					<div id="${this.UIElementIdPrefix}TypeInput" class="border border-light rounded"></div>
				</div>
							${this.HTML}
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				<button type="button" class="btn btn-primary mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Save">Save</button>
				<button type="button" class="btn btn-danger mx-1" data-bs-dismiss="modal" id="${this.UIElementIdPrefix}Delete">Delete</button>
			</div>
		</div>
				</div >
	`;
		return modal;
	}

}

class ItemTypeView extends BaseView {
	constructor(controller) {
		super(controller, "item-type", "Item Types", "table", document.getElementById("item-type-tab"));
		this.initialise();
	}

	rowHTML(entry) {
		const imageHTML = `<svg class="circular-icon-list">
	<g transform="translate(15, 15)">
		<circle r="12" ${entry ? `stroke="${entry.forecolour}"` : ""} ${entry ? `fill="${entry.backcolour}"` : ""}></circle>
	</g>
		</svg > `;

		const HTML = `
	<td> ${imageHTML}</td >
			<td>${entry.identifier ? entry.identifier : ""}</td>
			<td>${entry.description ? entry.description : ""}</td>
			<td>${entry.updated ? entry.updated : ""}</td>
		`;
		return HTML;
	}
	async display() {
		await super.display();
		await this.controller.loadItemTypes();
		this.displayStatus(`Displaying ${this.controller.itemTypes.size} of ${this.controller.allItemTypes.size} item types.`);
	}
	async initialise() {
		this.controller.onItemTypesLoaded.push(document);
		this.controller.onCurrentItemTypeChanged.push(document);
		this.controller.onItemTypeSaved.push(document);
		this.controller.onNewItemType.push(document);

		this.controller.onSearchActive.push(document);

		document.addEventListener("item-type.new", event => {
			//this.createEntry("table", event.detail.newValue);
		});
		document.addEventListener("item-type.currentChanged", async event => {
		});
		document.addEventListener("project.currentChanged", async event => {
			await this.displayList("table", this.controller.itemTypes);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " item types.", document.getElementById("item-type-tab"));
		});

		document.addEventListener("item-type.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("item-types.searched", async event => {
			await this.displayList("table", event.detail.newValue);
			this.displayStatus(`Displaying ${this.controller.itemTypes.size} of ${this.controller.allItemTypes.size} item types.`);
		});
		document.addEventListener("item-types.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue.entries().next().value[1];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " item types.");
		});
	}
	async currentChanged(entry) {
		super.currentChanged(entry);
		this.controller.currentItemType = entry;
	}

	async save() {
		super.save();
		this.controller.saveCurrentItemType();
	}
	async new() {
		this.controller.newItemType();
		super.new(this.controller.currentItemType);
	}
	async delete() {
		super.delete();
		await this.controller.deleteItemType();
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
				<h5 class="modal-title">Item Type Properties</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
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
class LinkTypeView extends BaseView {
	constructor(controller) {
		super(controller, "link-type", "Link Types", "table", document.getElementById("link-type-tab"));
		this.initialise();
	}

	static get markers() {
		return [
			{ name: "Circle", path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-5 -5 10 10' }, // Circle
			{ name: "Square", path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' }, // Square
			{ name: "Arrow", path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' }, // Arrow
			{ name: "Stub", path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' } // stub
		];
	}

	static get dashes() {
		return [
			{ name: "Short Dash", on: 3, off: 3 }, // Short Dash
			{ name: "Solid", on: 1, off: 0 }, // Solid
			{ name: "Dash", on: 7, off: 7 } // Dash
		];
	}
	rowHTML(entry) {
		const tempId = BaseView.makeid(50);
		const marker = LinkTypeView.markers.find(marker => marker.name == entry.marker);
		const dash = LinkTypeView.dashes.find(dash => dash.name == entry.dash);
		let imageHTML = "";
		if ((marker != null) && (dash != null)) {
			imageHTML = `
				<svg class="link-type-list-colour">
					<defs>
						<marker markerUnits="strokeWidth" id="${tempId}" markerHeight="6px" markerWidth="6px" orient="auto-start-reverse" refX="5px" refY="0" viewBox="${marker.viewbox}">
							<path d="${marker.path}" class="default-link-type-visual" fill="${entry.forecolour ? entry.forecolour : " #aaa"}"></path>
						</marker>
					</defs >
					<g transform="translate(0, 16)">
						<path d="M 0,0 L 100,0" class="default-link-type-visual skeleton" marker-start="url(#${tempId})" stroke="${entry.forecolour ? entry.forecolour : " #aaa"}" stroke-dasharray="${dash.on} ${dash.off}">
							<animateMotion path="M100,0 L0,0" begin="0s" dur="${Math.random()}s" repeatCount="1" />
						</path>
					</g>
				</svg>
				`;
		}
		const HTML = `
			<td>${imageHTML}</td>
			<td>${entry.identifier ? entry.identifier : ""}</td>
			<td>${entry.description ? entry.description : ""}</td>
			<td>${entry.updated ? entry.updated : ""}</td>
		`;
		return HTML;
	}
	refreshLinkTypeVisuaLList(selected_dash, selected_marker, forecolour, backcolour) {
		document.getElementById(this.UIElementIdPrefix + "VisualInput").innerHTML = "";
		const HTML = `
	<nav>
	<ul class="link-types-short-list" id="${this.UIElementIdPrefix}-link-types-short-list">
		<li${selected_dash + selected_marker == "" ? ` class="link-type-selected"` : ""} role="button"><i>No Type</i></li>
					${LinkTypeView.markers.map(marker => {
			return LinkTypeView.dashes.map(dash => {
				const tempId = BaseView.makeid(50);
				const imageHTML = `
					<svg class="link-type-list-colour">
						<defs>
							<marker markerUnits="strokeWidth" id="${tempId}" markerHeight="6px" markerWidth="6px" orient="auto-start-reverse" refX="5px" refY="0" viewBox="${marker.viewbox}">
								<path d="${marker.path}" class="default-link-type-visual" fill="${forecolour ? forecolour : "#aaa"}"></path>
							</marker>
						</defs>
						<g transform="translate(0, 16)">
							<path d="M 0,0 L 100,0" class="default-link-type-visual skeleton" marker-start="url(#${tempId})" stroke="${forecolour ? forecolour : "#aaa"}" stroke-dasharray="${dash.on} ${dash.off}">
								<animateMotion path="M100,0 L0,0" begin="0s" dur="${Math.random()}s" repeatCount="1"/>
							</path>
						</g>
					</svg>`;
				return `<li class="ms-n1 ps-2 mt-1 mb-1${(selected_dash + selected_marker) == (dash.name + marker.name) ? " link-type-selected" : ""}" role="button" data-dash="${dash.name}" data-marker="${marker.name}">
										<span>${imageHTML}</span><span class="ms-3 align-middle">${dash.name} line with a ${marker.name} end</span></li>`;

			}).join("");
		}).join("")}
	</ul>
			</nav>
	`
		document.getElementById(this.UIElementIdPrefix + "VisualInput").innerHTML = HTML;
		const allLinkTypeListItems = Array.from(document.querySelectorAll("#" + this.UIElementIdPrefix + "-link-types-short-list > li"));

		allLinkTypeListItems.forEach(element => {
			element.addEventListener("click", event => {
				const selected = document.querySelector("#" + this.UIElementIdPrefix + "-link-types-short-list > .link-type-selected");
				if (selected) {
					selected.classList.remove("link-type-selected");
				}
				event.currentTarget.classList.add("link-type-selected");
				this.controller.currentLinkType.dash = event.currentTarget.dataset.dash;
				this.controller.currentLinkType.marker = event.currentTarget.dataset.marker;
			})
		});

	}
	refreshLinkTypeList(linkTypes, selected_id) {
		const HTML = `
	<nav>
	<ul class="link-types-list" id="${this.UIElementIdPrefix}-link-types-list">
		<li${selected_id == "" ? ` class="link-type-selected"` : ""} role="button"><i>No Type</i></li>
					${[...this.controller.linkTypes.values()].map(linkType => {
			const marker = LinkTypeView.markers.find(marker => marker.name == linkType.marker);
			const dash = LinkTypeView.dashes.find(dash => dash.name == linkType.dash);
			let imageHTML = "";
			if ((marker != null) && (dash != null)) {
				const tempId = BaseView.makeid(50);

				imageHTML = `<svg class="link-type-list-colour">
							<defs>
								<marker markerUnits="strokeWidth" id="${tempId}" markerHeight="6px" markerWidth="6px" orient="auto-start-reverse" refX="5px" refY="0" viewBox="${marker.viewbox}">
									<path d="${marker.path}" class="default-link-type-visual" fill="${linkType.forecolour ? linkType.forecolour : "#aaa"}"></path>
								</marker>
							</defs>
							<g transform="translate(0, 16)">
								<path d="M 0,0 L 100,0" class="default-link-type-visual skeleton" marker-start="url(#${tempId})" stroke="${linkType.forecolour ? linkType.forecolour : "#aaa"}" stroke-dasharray="${dash.on} ${dash.off}">
									<animateMotion path="M100,0 L0,0" begin="0s" dur="${Math.random()}s" repeatCount="1"/>
								</path>
							</g>
						</svg>`;

			}
			let selected = (linkType.internal_id == selected_id) ? `link-type-selected` : "";
			return `<li data-internal_id="${linkType.internal_id}" class="ms-n1 mt-1 mb-1 ${selected}" role="button"><span>${imageHTML}</span><span class="ms-2 align-middle">${linkType.identifier}</span></li>`;
		}).join("")
			}
	</ul>
			</nav>
	`
		document.getElementById(this.UIElementIdPrefix + "LinkedTypeInput").innerHTML = HTML;
		const allLinkTypeListItems = Array.from(document.querySelectorAll("#" + this.UIElementIdPrefix + "-link-types-list > li"));

		allLinkTypeListItems.forEach(element => {
			element.addEventListener("click", event => {
				const selected = document.querySelector("#" + this.UIElementIdPrefix + "-link-types-list > .link-type-selected");
				if (selected) {
					selected.classList.remove("link-type-selected");
				}
				event.currentTarget.classList.add("link-type-selected");
			})
		});
		return HTML;
	}

	async display() {
		await super.display();
		await this.controller.loadLinkTypes();
		this.displayStatus(`Displaying ${this.controller.linkTypes.size} of ${this.controller.allLinkTypes.size} link types.`);
	}
	async initialise() {
		this.controller.onLinkTypesLoaded.push(document);
		this.controller.onCurrentLinkTypeChanged.push(document);
		this.controller.onLinkTypeSaved.push(document);
		this.controller.onNewLinkType.push(document);

		this.controller.onSearchActive.push(document);

		document.addEventListener("link-type.new", event => {
			//this.createEntry("table", event.detail.newValue);
		});
		document.addEventListener("link-type.currentChanged", async event => {
			//this.refreshLinkTypeList(event.detail.newValue.dash, event.detail.newValue.marker, event.detail.newValue.forecolour, event.detail.newValue.backcolour);
		});
		document.addEventListener("project.currentChanged", async event => {
			await this.displayList("table", this.controller.linkTypes);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " link types.", document.getElementById("link-type-tab"));
		});

		document.addEventListener("link-type.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("link-types.searched", async event => {
			await this.displayList("table", event.detail.newValue);
			this.displayStatus(`Displaying ${this.controller.linkTypes.size} of ${this.controller.allLinkTypes.size} link types.`);
		});
		document.addEventListener("link-types.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue.entries().next().value[1];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " link types.");
		});
		const forecolorInput = document.getElementById(this.UIElementIdPrefix + "ForecolourInput");
		forecolorInput.addEventListener("change", event => {
			this.refreshLinkTypeVisuaLList(this.controller.currentLinkType.dash, this.controller.currentLinkType.marker, event.currentTarget.value, this.controller.currentLinkType.backcolour);
		})

	}
	async currentChanged(entry) {
		super.currentChanged(entry);
		this.controller.currentLinkType = entry;
		this.refreshLinkTypeVisuaLList(entry.dash, entry.marker, entry.forecolour, entry.backcolour);
		this.refreshLinkTypeList(this.controller.linkTypes, entry.linkedType_id);
	}

	async save() {
		super.save();
		const selectedVisual = document.querySelector(`#${this.UIElementIdPrefix}-link-types-short-list > .link-type-selected`);
		if (selectedVisual != null) {
			this.controller.currentLinkType.dash = selectedVisual.dataset.dash;
			this.controller.currentLinkType.marker = selectedVisual.dataset.marker;
		}
		const selectedLinkType = document.querySelector(`#${this.UIElementIdPrefix}-link-types-list > .link-type-selected`);
		if (selectedLinkType != null) {
			this.controller.currentLinkType.linkedType_id = selectedLinkType.dataset.internal_id;
		}
		this.controller.saveCurrentLinkType();
	}
	async new() {
		this.controller.newLinkType();
		super.new(this.controller.currentLinkType);
	}
	async delete() {
		super.delete();
		await this.controller.deleteLinkType();
		super.deleted();
	}
	get properties() {
		const modal = document.createElement("div");
		modal.setAttribute("id", this.UIElementIdPrefix + "-properties");
		modal.setAttribute("class", "modal fade");
		modal.setAttribute("tabindex", "-1");
		modal.setAttribute("role", "dialog");
		modal.innerHTML = `
	<div class="modal-dialog modal-xl">
		<div class="modal-content bg-dark text-white">
			<div class="modal-header">
				<h5 class="modal-title">Link Type Properties</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="row">
					<div class="col">
						<div class="mb-3">
							<label for="${this.UIElementIdPrefix}VisualInput" class="form-label">Visual</label>
							<div id="${this.UIElementIdPrefix}VisualInput" class="border border-light rounded"></div>
						</div>
								${this.HTML}
					</div>
					<div class="col border-start ">
						<div class="mb-3">
							<label for="${this.UIElementIdPrefix}LinkedTypeInput" class="form-label">Linked Type</label>
							<div id="${this.UIElementIdPrefix}LinkedTypeInput" class="border border-light rounded"></div>
						</div>
					</div>
				</div>
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
class LinkView extends BaseView {
	constructor(controller) {
		super(controller, "link", "Links", "table", document.getElementById("link-tab"));
		this.initialise();
	}

	rowHTML(entry) {
		const linkType = this.controller.linkTypes.get(entry.linkType_id);
		const source = this.controller.items.get(entry.source_id);
		const target = this.controller.items.get(entry.target_id);
		const tempId = BaseView.makeid(20);
		let imageHTML = "";
		if (linkType) {
			const marker = LinkTypeView.markers.find(marker => marker.name == linkType.marker);
			const dash = LinkTypeView.dashes.find(dash => dash.name == linkType.dash);
			imageHTML = `<svg class="link-type-list-colour">
			<defs>
				<marker markerUnits="strokeWidth" id="${tempId}" markerHeight="6px" markerWidth="6px" orient="auto-start-reverse" refX="5px" refY="0" viewBox="${marker.viewbox}">
					<path d="${marker.path}" class="default-link-type-visual" fill="${linkType.forecolour ? linkType.forecolour : "#aaa"}"></path>
				</marker>
			</defs>
			<g transform="translate(0, 16)">
				<path d="M 0,0 L 100,0" class="default-link-type-visual skeleton" marker-start="url(#${tempId})" stroke="${linkType.forecolour ? linkType.forecolour : "#aaa"}" stroke-dasharray="${dash.on} ${dash.off}">
					<animateMotion path="M100,0 L0,0" begin="0s" dur="${Math.random()}s" repeatCount="1"/>
				</path>
			</g>
		</svg>`;
		}
		let sourceHTML = "";
		if (source) {
			const sourceType = this.controller.allItemTypes.get(source.type_id);
			sourceHTML = `
				<svg class="circular-icon-list">
					<g transform="translate(15, 15)">
						<circle r="12" ${sourceType ? `stroke="${sourceType.forecolour}"` : ""} ${sourceType.backcolour ? `fill="${sourceType.backcolour}"` : ""}></circle>
					</g>
				</svg > `;

		}
		let targetHTML = "";
		if (target) {
			const targetType = this.controller.allItemTypes.get(target.type_id);
			targetHTML = `<svg class="circular-icon-list">
			<g transform="translate(15, 15)">
				<circle r="12" ${target ? `stroke="${targetType.forecolour}"` : ""} ${targetType ? `fill="${targetType.backcolour}"` : ""}></circle>
			</g>
				</svg > `;

		}
		const HTML = `
			<td>${sourceHTML} ${source ? source.identifier : ""}</td>
			<td>${imageHTML} ${linkType ? linkType.identifier : ""}</nobr></td>
			<td>${targetHTML} ${target ? target.identifier : ""}</td>
			<td>${entry.updated ? entry.updated : ""}</td>
		`;
		return HTML;
	}
	async display() {
		await super.display();
		await this.controller.loadLinks();
		this.displayStatus(`Displaying ${this.controller.links.size} of ${this.controller.allLinks.size} links.`);
	}
	async initialise() {
		this.controller.onLinksLoaded.push(document);
		this.controller.onCurrentLinkChanged.push(document);
		this.controller.onLinkSaved.push(document);
		this.controller.onNewLink.push(document);

		this.controller.onSearchActive.push(document);

		document.addEventListener("link.new", event => {
			//this.createEntry("table", event.detail.newValue);
		});
		document.addEventListener("link.currentChanged", async event => {
			//this.refreshLinkTypeList(this.controller.currentLink.type_id);
		});
		document.addEventListener("project.currentChanged", async event => {
			await this.displayList("table", this.controller.links);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue[0];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " links.", document.getElementById("link-tab"));
		});

		document.addEventListener("link.saved", async event => {
			this.saved(event.detail.newValue);
		});
		document.addEventListener("links.searched", async event => {
			await this.displayList("table", event.detail.newValue);
			this.displayStatus(`Displaying ${this.controller.links.size} of ${this.controller.allLinks.size} links.`);
		});
		document.addEventListener("links.loaded", async event => {
			await this.displayList("table", event.detail.newValue);
			if (event.detail.newValue.size > 0) {
				super.currentEntry = event.detail.newValue.entries().next().value[1];
			}
			this.displayProgress("Loaded " + event.detail.newValue.size + " links.");
		});
		document.addEventListener("link-types.loaded", async event => {
			//this.refreshLinkTypeList(this.controller.currentLink.type_id);
		});
		document.addEventListener("link-type.saved", event => {
			//this.refreshLinkTypeList(this.controller.currentLink.type_id);
		});
		document.getElementById(this.UIElementIdPrefix + "SourceFilterInput").addEventListener("input", event => {
			ItemView.itemShortList(this.controller.items, this.controller.itemTypes, this.UIElementIdPrefix, "SourceInput", this.controller.currentLink.source_id, "SourceFilterInput");
		});
		document.getElementById(this.UIElementIdPrefix + "TargetFilterInput").addEventListener("input", event => {
			ItemView.itemShortList(this.controller.items, this.controller.itemTypes, this.UIElementIdPrefix, "TargetInput", this.controller.currentLink.source_id, "TargetFilterInput");
		});

	}

	// refreshItemList(container_id, selected_id = "", searchString = "") {
	// 	const HTML = `
	// <nav>
	// <ul class="items-short-list" id="${this.UIElementIdPrefix}-items-short-list">
	// 	<li${(selected_id == "") ? ` class="link-type-selected"` : ""} role="button"><i>No selection</i></li>
	// 				${this.controller.items.filter(item => item.identifier.indexOf(searchString) >= 0).map(item => {
	// 		const itemType = this.controller.itemTypes.find(itemType => itemType.internal_id == item.type_id);
	// 		const imageHTML = `<svg class="item-list-colour">
	// 						<g transform="translate(15, 15)">
	// 							<circle r="12" ${itemType ? `stroke="${itemType.forecolour}"` : ""} ${itemType ? `fill="${itemType.backcolour}"` : ""}></circle>
	// 						</g>
	// 					</svg>`;
	// 		let selected = (selected_id == this.controller.currentItem.internal_id) ? `link-type-selected` : "";
	// 		return `<li data-internal_id="${item.internal_id}" class="ms-n1 mt-1 mb-1 ${selected}" role="button"><span>${imageHTML}</span><span class="ms-2 align-middle">${item.identifier}</span></li>`;
	// 	}).join("")
	// 		}
	// </ul>
	// 		</nav>
	// `
	// 	document.getElementById(this.UIElementIdPrefix + container_id).innerHTML = HTML;
	// 	const list = document.getElementById("items-short-list");
	// 	const allItemsList = Array.from(document.querySelectorAll("#" + this.UIElementIdPrefix + "-items-short-list > li"));

	// 	allItemsList.forEach(element => {
	// 		element.addEventListener("click", event => {
	// 			const selected = document.querySelector("#" + this.UIElementIdPrefix + "-items-short-list > .link-type-selected");
	// 			if (selected) {
	// 				selected.classList.remove("link-type-selected");
	// 			}
	// 			event.currentTarget.classList.add("link-type-selected");
	// 		})
	// 	});
	// 	document.getElementById(this.UIElementIdPrefix + "SourceFilterInput").addEventListener("input", event => {
	// 		const searchString = event.currentTarget.value;
	// 		this.refreshItemList("SourceInput", this.controller.currentLink.source_id, searchString);
	// 	});
	// 	return HTML;
	// }
	refreshLinkTypeList(linkTypes, selected_id) {
		const HTML = `
	<nav>
	<ul class="link-types-list" id="${this.UIElementIdPrefix}-link-types-list">
		<li${selected_id == "" ? ` class="link-type-selected"` : ""} role="button"><i>No Type</i></li>
					${[...this.controller.linkTypes.values()].map(linkType => {
			const marker = LinkTypeView.markers.find(marker => marker.name == linkType.marker);
			const dash = LinkTypeView.dashes.find(dash => dash.name == linkType.dash);
			let imageHTML = "";
			if ((marker != null) && (dash != null)) {
				const tempId = BaseView.makeid(50);

				imageHTML = `<svg class="link-type-list-colour">
							<defs>
								<marker markerUnits="strokeWidth" id="${tempId}" markerHeight="6px" markerWidth="6px" orient="auto-start-reverse" refX="5px" refY="0" viewBox="${marker.viewbox}">
									<path d="${marker.path}" class="default-link-type-visual" fill="${linkType.forecolour ? linkType.forecolour : "#aaa"}"></path>
								</marker>
							</defs>
							<g transform="translate(0, 16)">
								<path d="M 0,0 L 100,0" class="default-link-type-visual skeleton" marker-start="url(#${tempId})" stroke="${linkType.forecolour ? linkType.forecolour : "#aaa"}" stroke-dasharray="${dash.on} ${dash.off}">
									<animateMotion path="M100,0 L0,0" begin="0s" dur="${Math.random()}s" repeatCount="1"/>
								</path>
							</g>
						</svg>`;

			}
			let selected = (linkType.internal_id == selected_id) ? `link-type-selected` : "";
			return `<li data-internal_id="${linkType.internal_id}" class="ms-n1 mt-1 mb-1 ${selected}" role="button"><span>${imageHTML}</span><span class="ms-2 align-middle">${linkType.identifier}</span></li>`;
		}).join("")
			}
	</ul>
			</nav>
	`
		document.getElementById(this.UIElementIdPrefix + "LinkedTypeInput").innerHTML = HTML;
		const allLinkTypeListItems = Array.from(document.querySelectorAll("#" + this.UIElementIdPrefix + "-link-types-list > li"));

		allLinkTypeListItems.forEach(element => {
			element.addEventListener("click", event => {
				const selected = document.querySelector("#" + this.UIElementIdPrefix + "-link-types-list > .link-type-selected");
				if (selected) {
					selected.classList.remove("link-type-selected");
				}
				event.currentTarget.classList.add("link-type-selected");
			})
		});
		return HTML;
	}
	async currentChanged(entry) {
		super.currentChanged(entry);
		ItemView.itemShortList(this.controller.items, this.controller.itemTypes, this.UIElementIdPrefix, "SourceInput", entry.source_id, "SourceFilterInput");
		ItemView.itemShortList(this.controller.items, this.controller.itemTypes, this.UIElementIdPrefix, "TargetInput", entry.source_id, "TargetFilterInput");
		this.refreshLinkTypeList(this.controller.linkTypes, entry.linkType_id);
		this.controller.currentLink = entry;
	}

	async save() {
		super.save();
		const sourceSelection = document.querySelector("#SourceInput-items-short-list > .list-item-selected");
		let source_id = null;
		if (sourceSelection) {
			source_id = sourceSelection.dataset.internal_id;
		}
		const targetSelection = document.querySelector("#TargetInput-items-short-list > .list-item-selected");
		let target_id = null;
		if (targetSelection) {
			target_id = targetSelection.dataset.internal_id;
		}
		const linkTypeSelected = document.querySelector("#link-link-types-list > .link-type-selected");
		let linkType_id = null;
		if (linkTypeSelected) {
			linkType_id = linkTypeSelected.dataset.internal_id;
		}
		this.controller.currentLink.linkType_id = linkType_id;
		this.controller.currentLink.source_id = source_id;
		this.controller.currentLink.target_id = target_id;
		this.controller.saveCurrentLink();
	}
	async new() {
		this.controller.newLink();
		super.new(this.controller.currentLink);
	}
	async delete() {
		super.delete();
		await this.controller.deleteLink();
		super.deleted();
	}
	get properties() {
		const modal = document.createElement("div");
		modal.setAttribute("id", this.UIElementIdPrefix + "-properties");
		modal.setAttribute("class", "modal fade");
		modal.setAttribute("tabindex", "-1");
		modal.setAttribute("role", "dialog");
		modal.innerHTML = `
	<div class="modal-dialog modal-xl">
		<div class="modal-content bg-dark text-white">
			<div class="modal-header">
				<h5 class="modal-title">Link Properties</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="row">
					<div class="col">
						<div class="mb-3">
							<label for="${this.UIElementIdPrefix}LinkedTypeInput" class="form-label">Link Type</label>
							<div id="${this.UIElementIdPrefix}LinkedTypeInput" class="border border-light rounded"></div>
						</div>
						${this.HTML}
					</div>
					<div class="col border-start">
						<div class="mb-3">
							<label for="${this.UIElementIdPrefix}SourceInput" class="form-label">Source</label>
							<div class="border border-light rounded">
								<input type="text" class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}SourceFilterInput"
									placeholder="Filter items...">
									<div id="${this.UIElementIdPrefix}SourceInput"></div>
							</div>
						</div>
						<div class="mb-3">
							<label for="${this.UIElementIdPrefix}TargetInput" class="form-label">Target</label>
							<div class="border border-light rounded">
								<input type="text" class="form-control bg-dark text-white" id="${this.UIElementIdPrefix}TargetFilterInput"
									placeholder="Filter items...">
									<div id="${this.UIElementIdPrefix}TargetInput"></div>
							</div>
						</div>
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
class VisualiseView extends BaseView {
	constructor(controller) {
		super(controller, "visualise", "Visualisation", "", document.getElementById("visualise-tab"));
		this.initialise();
		this.settings = new Map();
		this.settings.set("node-radius", 20);
	}
	initialise() {
		this.simulation = this.setupSimulation(innerWidth, innerHeight);
	}
	display() {
		this.update();
	}
	dragHandler() {
		d3.drag()
			.on("drag", function (d) {
				console.log(`dragging (${deltaX}, ${deltaY})`);
				d3.select(this)
					.attr("transform", "translate(" + (d3.event.x + deltaX) + ", " + (d3.event.y + deltaY) + ")");
			})
			.on("start", function () {
				let current = d3.select(this);
				//deltaX = current.attr("x") - d3.event.x;
				//deltaY = current.attr("y") - d3.event.y;
			});
	}
	drag(simulation) {

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
	sortAndOrderLinks(unsortedLinks) {
		// Remove links without a source and target.
		const nonOrphanedLinks = [...this.controller.links.values()].filter(link => (link.source_id != null) && (link.target_id != null));
		// Count the number of links in the set of links between each item.
		nonOrphanedLinks.forEach(firstlink => {
			// Hydrate the links with references to items at both source and target.
			firstlink.source = this.controller.allItems.get(firstlink.source_id);
			firstlink.target = this.controller.allItems.get(firstlink.target_id);
			firstlink.type = this.controller.allLinkTypes.get(firstlink.linkType_id);

			nonOrphanedLinks.forEach(secondlink => {
				if (firstlink.set == null) firstlink.set = 1;
				if (secondlink.set == null) secondlink.set = 1;
				if (firstlink.internal_id != secondlink.internal_id) {
					if (((firstlink.source_id == secondlink.source_id) && (firstlink.target_id == secondlink.target_id)) || (
						(firstlink.source_id == secondlink.target_id) && (firstlink.target_id == secondlink.source_id))) {
						//console.log("Incrementing set");
						firstlink.set++;
						secondlink.set++;
					}
				}
			});
		});

		nonOrphanedLinks.sort(function (a, b) {
			if (a.source.internal_id > b.source.internal_id) { return 1; }
			else if (a.source.internal_id < b.source.internal_id) { return -1; }
			else {
				if (a.target.internal_id > b.target.internal_id) { return 1; }
				if (a.target.internal_id < b.target.internal_id) { return -1; }
				else { return 0; }
			}
		});
		// Any links with duplicate source and target get an incremented 'linknum'
		for (var i = 0; i < nonOrphanedLinks.length; i++) {
			let link = nonOrphanedLinks[i];
			let previousLink = nonOrphanedLinks[i - 1];
			link.arcDirection = 1;
			if (i != 0 && link.source == previousLink.source && link.target == previousLink.target) {
				link.linknum = previousLink.linknum + 1;
				link.arcDirection = (i % 2) == 0 ? 1 : 0;
			}
			else { link.linknum = 1; };
		};

		return nonOrphanedLinks;
	};
	setupSimulation(width, height) {
		const maxDrawingHeight = innerHeight - document.querySelector("header").scrollHeight - document.querySelector("footer").scrollHeight;
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

				// append offset filter to result of gaussion blur filter
				filter.append('feOffset')
					.attr('result', 'offOut')
					.attr('in', 'SourceAlpha')
					.attr('dx', 5) // !!! important parameter - x-offset
					.attr('dy', 5) // !!! important parameter - y-offset

				// append gaussian blur to filter
				filter.append('feGaussianBlur')
					.attr('result', 'blurOut')
					.attr('in', 'offOut')
					.attr('stdDeviation', 3) // !!! important parameter - blur

				filter.append('feBlend')
					.attr('in', 'SourceGraphic')
					.attr('in2', 'blurOut')
					.attr('mode', 'normal')


				// // append offset filter to result of gaussion blur filter
				// filter.append('feOffset')
				// 	.attr('in', 'blur')
				// 	.attr('dx', 2) // !!! important parameter - x-offset
				// 	.attr('dy', 3) // !!! important parameter - y-offset
				// 	.attr('result', 'offsetBlur');

				// // merge result with original image
				// const feMerge = filter.append('feMerge');

				// // first layer result of blur and offset
				// feMerge.append('feMergeItem')
				// 	.attr('in", "offsetBlur')

				// // original image on top
				// feMerge.append('feMergeItem')
				// 	.attr('in', 'SourceGraphic');
			}
			setupDropShadowFilter(defs);
		}
		d3.select("#viewbox").remove();
		const parentSVG = d3.select("#chart")
			.append("svg")
			.attr("id", "visualise-chart")
			.attr("viewbox", [0, 0, width, height - 105])
			.attr("class", "w-100")
			.style("height", maxDrawingHeight)
			.call(d3.zoom().on("zoom", () => {
				const svg = d3.select("#drawingArea");
				svg.attr("transform", d3.event.transform);
			}))

		parentSVG
			.append("g")
			.attr("id", "drawingArea")
			.attr("class", "drawing-area")
		setupEffects();

		const simulation = d3.forceSimulation()
			.force("charge", d3.forceManyBody().strength(-10000).distanceMax(1500))
			// .force("charge", d3.forceManyBody().strength(-3000))
			.force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2));

		return simulation;
	};
	update() {
		const filteredItems = [...this.controller.items.values()];
		const sortedLinks = this.sortAndOrderLinks([...this.controller.links.values()]);
		const nodeRadius = this.settings.get("node-radius");
		const createMarkerEnd = (markerName, colour) => {
			const defs = d3.select("#defs");
			const tempId = BaseView.makeid(50);
			const marker = LinkTypeView.markers.find(marker => marker.name == markerName);
			if (marker) {
				defs
					.append('marker')
					.attr('markerUnits', 'strokeWidth')
					.attr('orient', 'auto')
					.attr('id', tempId)
					.attr('markerHeight', "5px")
					.attr('markerWidth', "5px")
					.attr('refX', 0) // 19
					.attr('refY', 0) // 0
					.attr('viewBox', marker.viewbox)
					.append('path')
					.attr('d', marker.path)
					.attr('fill', colour);
			}
			return tempId;
		}

		this.simulation
			.nodes(filteredItems)
			.force("link", d3.forceLink(sortedLinks).id(d => d.internal_id))
		const svg = d3.select("#drawingArea");

		const item = svg
			.selectAll(".item-chart")
			.data(filteredItems, d => d.internal_id)
			.join("g")
			.attr("class", "item-chart")
			.attr("role", "button")
			.call(this.drag(this.simulation))

		item
			.append("circle")
			.attr("stroke", d => (d.type_id ? this.controller.allItemTypes.get(d.type_id).forecolour : "transparent"))
			.attr("r", this.settings.get("node-radius"))
			.attr("fill", d => (d.type_id ? this.controller.allItemTypes.get(d.type_id).backcolour : "transparent"))
			.style("filter", `url(#dropshadow)`)

		item
			.append("text")
			.attr("class", "text")
			.style("fill", "white")
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "middle")
			.attr("y", nodeRadius + 17)
			.text(d => d.identifier)

		// These SVG element types need to be added in a very specific order for the user interface mechanics to work correctly.
		const link = svg
			.selectAll(".path")
			.data(sortedLinks)
			.join("path")
			.attr("id", d => d.internal_id)
			.lower()
			.attr("class", "path")
			.attr("stroke-width", 2)
			.attr("fill", "transparent")
			.attr("stroke", d => d.type?.forecolour)
			.attr("stroke-dasharray", d => {
				let dash = null;
				if (d.linkType_id) {
					const linkType = this.controller.allLinkTypes.get(d.linkType_id);
					dash = LinkTypeView.dashes.find(dash => dash.name == linkType.dash);
				}
				return dash ? (dash.on + " " + dash.off) : null
			})

			.attr("marker-end", d => {
				let attributeValue = "";
				if (d.linkType_id) {
					const linkType = this.controller.allLinkTypes.get(d.linkType_id);
					attributeValue = `url(#${createMarkerEnd(linkType.marker, linkType.forecolour)}`;
				}
				return attributeValue;
			})

		// Sonar
		// for (let i = 1; i < 40; ++i) {
		// 	item
		// 		.append("circle")
		// 		.lower()
		// 		.attr("class", "ripple")
		// 		.attr("r", nodeRadius)
		// 		.style("stroke", "white")
		// 		.style("stroke-width", 5 / (i))
		// 		.transition()
		// 		.delay(Math.pow(i, 2.5) * 150)
		// 		.duration(2000)
		// 		.ease(d3.easeQuad)
		// 		.attr("r", 150)
		// 		.style("stroke-opacity", 0)
		// 		.on("end", function () {
		// 			d3.select(this).remove();
		// 		})
		// }

		this.simulation.on("tick", () => {
			function linkArc(d, i, that) {
				var dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dr = Math.sqrt(dx * dx + dy * dy);

				// length of current path
				var pl = that.getTotalLength(),
					// radius of circle plus marker head
					r = (d.target.weight) * 4 + 16.97, //16.97 is the "size" of the marker Math.sqrt(12**2 + 12 **2)
					// position close to where path intercepts circle
					m = that.getPointAtLength(pl - r);

				var dx = m.x - d.source.x,
					dy = m.y - d.source.y,
					dr = Math.sqrt(dx * dx + dy * dy);

				//	return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + m.x + "," + m.y;

				//if (d.set != 1) { dr = dr / d.linknum; } //linknum is defined above
				//return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + d.target.x + "," + d.target.y;
				return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + m.x + "," + m.y;
			}
			if (link != null) {
				// fit path like you've been doing
				link.attr("d", function (d) {
					var dx = d.target.x - d.source.x,
						dy = d.target.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy);
					return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
				});

				// recalculate and back off the distance
				link.attr("d", function (d) {

					// length of current path
					var pl = this.getTotalLength(),
						// radius of circle plus marker head
						r = (9) + 16.97, //16.97 is the "size" of the marker Math.sqrt(12**2 + 12 **2)
						// position close to where path intercepts circle
						m = this.getPointAtLength(pl - r);

					var dx = m.x - d.source.x,
						dy = m.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy);

						return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0," + d.arcDirection + " " + m.x + "," + m.y;
//						return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + m.x + "," + m.y;
				});
			}
			if (item != null) {
				item
					.attr("transform", d => `translate(${d.x}, ${d.y})`);
			}
		});
	};

}

const view = new View(new Controller(dbName, dbVersion));
			// d3.selectAll("#visualise-chart > defs")
			// .data(filteredItems)
			// .append("linearGradient")
			// .attr("id", d => "shimmer" + d.internal_id)
			// .attr("x1", "-100%")
			// .attr("y1", "0")
			// .attr("x2", "200%")
			// .attr("y2", "0")
			// .html(d => `
			// 	<stop offset="0" stop-color="white">
			// 		<animate attributeName="offset" values="0;0.2;0.5" dur="1s" repeatCount="indefinite"  /> 
			// 	</stop>
			// 	<stop offset="0.5" stop-color="${(d.type_id? this.controller.allItemTypes.get(d.type_id).backcolour : "transparent")}">
			// 		<animate attributeName="offset" values="0.5;0.7;0.8;1" dur="1s" repeatCount="indefinite"  /> 
			// 	</stop>
			// 	<stop offset="1" stop-color="white">
			// 		<animate attributeName="offset" values="1;0.8;0.7;0.5" dur="1s" repeatCount="indefinite"  /> 
			// 	</stop>
			// `)

			// .attr("fill", d => `url(#shimmer${d.internal_id})`)
			// .each(d => {
			// 	d3.selectAll("defs").append("linearGradient")
			// 	.attr("id", "shimmer" + d.internal_id)
			// 	.attr("x1", "-100%")
			// 	.attr("y1", "0")
			// 	.attr("x2", "200%")
			// 	.attr("y2", "0")
			// 	.html(`
			// 		<stop offset="0" stop-color="${(d.type_id ? this.controller.allItemTypes.get(d.type_id).backcolour : "transparent")}">
			// 		<animate attributeName="offset" values="0;0.2;0.5" dur="0.5s" repeatCount="indefinite"  /> 
			// 		</stop>
			// 		<stop offset="0.5" stop-color="white">
			// 			<animate attributeName="offset" values="0.5;0.7;0.8;1" dur="0.5s" repeatCount="indefinite"  /> 
			// 		</stop>
			// 	`)
			// })
