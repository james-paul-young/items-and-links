"use strict";

class Controller {
    constructor(dbName = "items-and-links", dbVersion = 1) {
        this._dbName = dbName;
        this._dbVersion = dbVersion;


        this._projects = new Map();
        this._searchedProjects = new Map();
        this._onProjectsLoaded = [];
        this._onProjectSaved = [];
        this._onCurrentProjectChanged = [];
        this._onNewProject = [];
        this._onProjectDeleted = [];
        this._onProjectActivated = [];

        this._items = new Map();
        this._searchedItems = new Map();
        this._onItemsLoaded = [];
        this._onItemSaved = [];
        this._onCurrentItemChanged = [];
        this._onNewItem = [];
        this._onDeleteItem = [];

        this._itemTypes = new Map();
        this._searchedItemTypes = new Map();
        this._onItemTypesLoaded = [];
        this._onItemTypeSaved = [];
        this._onCurrentItemTypeChanged = [];
        this._onNewItemType = [];
        this._onDeleteItemType = [];

        this._links = new Map();
        this._searchedLinks = new Map();
        this._onLinksLoaded = [];
        this._onLinkSaved = [];
        this._onCurrentLinkChanged = [];
        this._onNewLink = [];
        this._onDeleteLink = [];

        this._linkTypes = new Map();
        this._searchedLinkTypes = new Map();
        this._onLinkTypesLoaded = [];
        this._onLinkTypeSaved = [];
        this._onCurrentLinkTypeChanged = [];
        this._onNewLinkType = [];
        this._onDeleteLinkType = [];

        this._searchString = "";
        this._onSearchActive = [];
    }
    get searchString() { return this._searchString; }
    set searchString(value) {
        this._searchString = value;
        this.onSearchActive.forEach(listener => listener.dispatchEvent(new CustomEvent("projects.searched", { detail: { previousValue: null, newValue: this.projects, } })));
        this.onSearchActive.forEach(listener => listener.dispatchEvent(new CustomEvent("items.searched", { detail: { previousValue: null, newValue: this.items, } })));
        this.onSearchActive.forEach(listener => listener.dispatchEvent(new CustomEvent("item-types.searched", { detail: { previousValue: null, newValue: this.itemTypes, } })));
        this.onSearchActive.forEach(listener => listener.dispatchEvent(new CustomEvent("links.searched", { detail: { previousValue: null, newValue: this.links, } })));
        this.onSearchActive.forEach(listener => listener.dispatchEvent(new CustomEvent("link-types.searched", { detail: { previousValue: null, newValue: this.linkTypes, } })));
    }
    get onSearchActive() { return this._onSearchActive; }

    //#region Items
    get allItems() { return this._items; } // Unfiltered items
    get items() {
        let itemFilter = () => true;
        if (this._searchString != "") {
            itemFilter = item => (item.identifier.indexOf(this._searchString) >= 0) || (item.description.indexOf(this._searchString) >= 0);
        }
        this._searchedItems.clear();
        //this._searchedItems.push(...this._items.filter(itemFilter));
        [...this.allItems.values()].filter(itemFilter).forEach(item => this._searchedItems.set(item.internal_id, item))
        return this._searchedItems;
    }
    get onItemsLoaded() { return this._onItemsLoaded; }
    get onItemSaved() { return this._onItemSaved; }
    get onCurrentItemChanged() { return this._onCurrentItemChanged; }
    get onNewItem() { return this._onNewItem; }
    get onDeleteItem() { return this._onDeleteItem; }

    get currentItem() { return this._currentItem; }
    set currentItem(value) {
        this._previous = this._currentItem;
        this._currentItem = value;
        this.onCurrentItemChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("item.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentItem, } })));
    }

    exportToFile() {
        const all = {
            project: this.currentProject,
            linkTypes: this.allLinkTypes.values(),
            links: this.allLinks.values(),
            items: this.allItems.values(),
            itemTypes: this.allItemTypes.values()
        };
        const exportJSON = document.createElement("a");
        const blob = new Blob([JSON.stringify(all)], { type: "text/JSON; charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        exportJSON.href = url;
        exportJSON.setAttribute("download", all.project.identifier + ".JSON");
        exportJSON.click();
    };
    async importFromFile(filedata) {
        const parsedJSON = JSON.parse(filedata);
        const importedProject = new Project(parsedJSON.project);
        //importedProject.internal_id = BaseView.makeid(30);
        // Create a new project id so as not to conflict with any existing ones...
        this._currentProject = importedProject;
        await this.saveCurrentProject();
        await this.activateCurrentProject();

        const deleteRecordArray = [];
        const saveRecordsArray = [];

        const itemModel = new items(this._dbName, this._dbVersion);
        deleteRecordArray.push(itemModel.deleteAll(this.currentProject.internal_id));
        parsedJSON.items.forEach(parsedItem => {
            const item = new Item(parsedItem);
            item.project_id = importedProject.internal_id;
            saveRecordsArray.push(itemModel.save(item));
        });

        const itemTypeModel = new itemTypes(this._dbName, this._dbVersion);
        deleteRecordArray.push(itemTypeModel.deleteAll(this.currentProject.internal_id));
        parsedJSON.itemTypes.forEach(parsedItemType => {
            const itemType = new ItemType(parsedItemType);
            itemType.project_id = importedProject.internal_id;
            saveRecordsArray.push(itemTypeModel.save(itemType));
        });

        const linkModel = new links(this._dbName, this._dbVersion);
        deleteRecordArray.push(linkModel.deleteAll(this.currentProject.internal_id));
        parsedJSON.links.forEach(parsedLink => {
            const link = new Link(parsedLink);
            link.project_id = importedProject.internal_id;
            saveRecordsArray.push(linkModel.save(link));
        });

        const linkTypeModel = new linkTypes(this._dbName, this._dbVersion);
        deleteRecordArray.push(linkTypeModel.deleteAll(this.currentProject.internal_id));
        parsedJSON.linkTypes.forEach(parsedLinkType => {
            const linkType = new LinkType(parsedLinkType);
            linkType.project_id = importedProject.internal_id;
            saveRecordsArray.push(linkTypeModel.save(linkType));
        });
        Promise.all(deleteRecordArray).then(results => {
            Promise.all(saveRecordsArray).then(async results => {
                await this.loadProjects();
                await this.loadItemTypes();
                await this.loadItems();
                await this.loadLinkTypes();
                await this.loadLinks();
            });
        });
    }
    async loadItems() {
        this.allItems.clear();
        if (this.activeProject) {
            const itemModel = new items(this._dbName, this._dbVersion)
            const results = await itemModel.load(this.activeProject.internal_id);
            results.forEach(result => {
                this.allItems.set(result.internal_id, new Item({ ...result, state: modelViewState.existing }));
            });
        }
        this.onItemsLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("items.loaded", { detail: { newValue: this.items, } })));
    }
    newItem() {
        const newItemInstance = new Item({ state: modelViewState.new, project_id: this.currentProject.internal_id });

        this.allItems.set(newItemInstance.internal_id, newItemInstance);
        this.onNewItem.forEach(listener => listener.dispatchEvent(new CustomEvent("item.new", { detail: { previousValue: null, newValue: newItemInstance, } })));
        this.currentItem = newItemInstance;
    }

    async deleteItem() {
        const itemModel = new items(this._dbName, this._dbVersion)
        await itemModel.delete(this.currentItem.internal_id);
        //const index = this.items.findIndex(item => item.internal_id == this.currentItem.internal_id);
        //this.items.splice(index, 1);
        this.allItems.delete(this.currentItem.internal_id);
        this.onDeleteItem.forEach(listener => listener.dispatchEvent(new CustomEvent("item.deleted", { detail: { newValue: this.currentItem, } })));
    }
    async saveCurrentItem() {
        // try {
        const itemModel = new items(this._dbName, this._dbVersion);
        let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentItem)), this.currentItem);
        this.currentItem.project_id = this.activeProject.internal_id;
        this.currentItem.data = await itemModel.save(this.currentItem);
        this.currentItem.state = modelViewState.saved;
        // Let every listener know the current objective have been saved.
        this.onItemSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("item.saved", { detail: { previousValue: previousValue, newValue: this.currentItem, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    //#endregion
    //#region Projects

    get allProjects() { return this._projects; }
    get projects() {
        let projectFilter = () => true;
        if (this._searchString != "") {
            projectFilter = project => (project.identifier.indexOf(this._searchString) >= 0) || (project.description.indexOf(this._searchString) >= 0);
        }
        this._searchedProjects.clear();
        [...this.allProjects.values()].filter(projectFilter).forEach(project => {
            this._searchedProjects.set(project.internal_id, project);
        });
        // this._searchedProjects.push(...this._projects.filter(projectFilter));
        return this._searchedProjects;
    }
    get onProjectsLoaded() { return this._onProjectsLoaded; }
    get onProjectSaved() { return this._onProjectSaved; }
    get onCurrentProjectChanged() { return this._onCurrentProjectChanged; }
    get onNewProject() { return this._onNewProject; }
    get onProjectDeleted() { return this._onProjectDeleted; }
    get onProjectActivated() { return this._onProjectActivated; }

    get currentProject() { return this._currentProject; }
    set currentProject(value) {
        this._previous = this._currentProject;
        this._currentProject = value;
        this.onCurrentProjectChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("project.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentProject, } })));
    }
    get activeProject() { return [...this._projects.values()].find(project => project.active); }
    async loadProjects() {
        // try {
        this._projects.length = 0;
        const projectModel = new projects(this._dbName, this._dbVersion)
        const results = await projectModel.load();
        results.forEach(result => {
            //this._projects.push(new Project({ ...result, state: modelViewState.existing }));
            this.allProjects.set(result.internal_id, new Project({ ...result, state: modelViewState.existing }));
        });
        this.onProjectsLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("projects.loaded", { detail: { newValue: this.projects, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    newProject() {
        const newProjectInstance = new Project({ state: modelViewState.new });
        this.allProjects.set(newProjectInstance.internal_id, newProjectInstance);

        //        this._projects.push(newProjectInstance);
        this.onNewProject.forEach(listener => listener.dispatchEvent(new CustomEvent("project.new", { detail: { previousValue: null, newValue: newProjectInstance, } })));
        this.currentProject = newProjectInstance;
    }

    async deleteProject() {
        // try {
        const projectModel = new projects(this._dbName, this._dbVersion)
        await projectModel.delete(this.currentProject.internal_id);
        this.allProjects.delete(this.currentProject.internal_id);
        // const index = this._projects.findIndex(project => project.internal_id == this.currentProject.internal_id);
        // this._projects.splice(index, 1);
        this.currentProject = this._projects[(index < this._projects.size) ? index : this._projects.size - 1];
        // Let every listener know the projects list has been updated.
        this.onProjectDeleted.forEach(listener => listener.dispatchEvent(new CustomEvent("project.deleted", { detail: { newValue: this.projects, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    async saveCurrentProject() {
        // try {
        const projectModel = new projects(this._dbName, this._dbVersion);
        let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentProject)), this.currentProject);

        this.currentProject.data = await projectModel.save(this.currentProject);
        this.currentProject.state = modelViewState.saved;
        // Let every listener know the current objective have been saved.
        this.onProjectSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("project.saved", { detail: { previousValue: previousValue, newValue: this.currentProject, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    async activateCurrentProject() {
        const projectModel = new projects(this._dbName, this._dbVersion);
        const previousValue = this.projects.values.find(project => project.active);
        if (previousValue) {
            previousValue.active = false;
            projectModel.save(previousValue);
        }
        this.currentProject.active = true;
        projectModel.save(this.currentProject);

        this.onProjectActivated.forEach(listener => listener.dispatchEvent(new CustomEvent("project.activated", { detail: { previousValue: previousValue, newValue: this.currentProject, } })));
    }
    //#endregion
    //#region Item Types
    get allItemTypes() { return this._itemTypes; } // Unfiltered item Types
    get itemTypes() {
        let itemTypeFilter = () => true;
        if (this._searchString != "") {
            itemTypeFilter = itemType => (itemType.identifier.indexOf(this._searchString) >= 0) || (itemType.description.indexOf(this._searchString) >= 0);
        }
        this._searchedItemTypes.clear();
        //this._searchedItemTypes.push(...this._itemTypes.filter(itemTypeFilter));
        [...this.allItemTypes.values()].filter(itemTypeFilter).forEach(itemType => {
            this._searchedItemTypes.set(itemType.internal_id, itemType);
        })
        return this._searchedItemTypes;
    }
    get onItemTypesLoaded() { return this._onItemTypesLoaded; }
    get onItemTypeSaved() { return this._onItemTypeSaved; }
    get onCurrentItemTypeChanged() { return this._onCurrentItemTypeChanged; }
    get onNewItemType() { return this._onNewItemType; }
    get onDeleteItemType() { return this._onDeleteItemType; }

    get currentItemType() { return this._currentItemType; }
    set currentItemType(value) {
        this._previous = this._currentItemType;
        this._currentItemType = value;
        this.onCurrentItemTypeChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("item-type.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentItemType, } })));
    }

    async loadItemTypes() {
        if (this.activeProject) {
            this.allItemTypes.clear();
            const itemTypeModel = new itemTypes(this._dbName, this._dbVersion)
            const results = await itemTypeModel.load(this.activeProject.internal_id);
            results.forEach(result => {
                this.allItemTypes.set(result.internal_id, new ItemType({ ...result, state: modelViewState.existing }));
            });
        }
        this.onItemTypesLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("item-types.loaded", { detail: { newValue: this.itemTypes, } })));
    }
    newItemType() {
        const newItemTypeInstance = new ItemType({ state: modelViewState.new, project_id: this.currentProject.internal_id });

        this.allItemTypes.set(newItemTypeInstance.internal_id, newItemTypeInstance);
        this.onNewItemType.forEach(listener => listener.dispatchEvent(new CustomEvent("item-type.new", { detail: { previousValue: null, newValue: newItemTypeInstance, } })));
        this.currentItemType = newItemTypeInstance;
    }

    async deleteItemType() {
        const itemTypeModel = new itemTypes(this._dbName, this._dbVersion)
        await itemTypeModel.delete(this.currentItemType.internal_id);
        this.allItemTypes.delete(this._currentItemType.internal_id);
        // const index = this.itemTypes.findIndex(itemType => itemType.internal_id == this.currentItemType.internal_id);
        // this.itemTypes.splice(index, 1);
        this.onDeleteItemType.forEach(listener => listener.dispatchEvent(new CustomEvent("item-type.deleted", { detail: { newValue: this.currentItemType, } })));
    }
    async saveCurrentItemType() {
        // try {
        const itemTypeModel = new itemTypes(this._dbName, this._dbVersion);
        let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentItemType)), this.currentItemType);
        this.currentItemType.project_id = this.activeProject.internal_id;
        this.currentItemType.data = await itemTypeModel.save(this.currentItemType);
        this.currentItemType.state = modelViewState.saved;
        // Let every listener know the current objective have been saved.
        this.onItemTypeSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("item-type.saved", { detail: { previousValue: previousValue, newValue: this.currentItemType, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    //#endregion
    //#region Link Types
    get allLinkTypes() { return this._linkTypes; } // Unfiltered link Types
    get linkTypes() {
        let linkTypeFilter = () => true;
        if (this._searchString != "") {
            linkTypeFilter = linkType => (linkType.identifier.indexOf(this._searchString) >= 0) || (linkType.description.indexOf(this._searchString) >= 0);
        }
        this._searchedLinkTypes.clear();
        [...this.allLinkTypes.values()].filter(linkTypeFilter).forEach(linkType => this._searchedLinkTypes.set(linkType.internal_id, linkType));
        //   this._searchedLinkTypes.push(...this._linkTypes.filter(linkTypeFilter));
        return this._searchedLinkTypes;
    }
    get onLinkTypesLoaded() { return this._onLinkTypesLoaded; }
    get onLinkTypeSaved() { return this._onLinkTypeSaved; }
    get onCurrentLinkTypeChanged() { return this._onCurrentLinkTypeChanged; }
    get onNewLinkType() { return this._onNewLinkType; }
    get onDeleteLinkType() { return this._onDeleteLinkType; }

    get currentLinkType() { return this._currentLinkType; }
    set currentLinkType(value) {
        this._previous = this._currentLinkType;
        this._currentLinkType = value;
        this.onCurrentLinkTypeChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("link-type.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentLinkType, } })));
    }

    async loadLinkTypes() {
        this._linkTypes.length = 0;
        if (this.activeProject) {
            const linkTypeModel = new linkTypes(this._dbName, this._dbVersion)
            const results = await linkTypeModel.load(this.activeProject.internal_id);
            results.forEach(result => {
                this.allLinkTypes.set(result.internal_id, { ...result, state: modelViewState.existing });
                //this._linkTypes.push(new LinkType({ ...result, state: modelViewState.existing }));
            });
        }
        this.onLinkTypesLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("link-types.loaded", { detail: { newValue: this.linkTypes, } })));
    }
    newLinkType() {
        const newLinkTypeInstance = new LinkType({ state: modelViewState.new, project_id: this.currentProject.internal_id });

        //this._linkTypes.push(newLinkTypeInstance);
        this.allLinkTypes.set(newLinkTypeInstance.internal_id, newLinkTypeInstance);
        this.onNewLinkType.forEach(listener => listener.dispatchEvent(new CustomEvent("link-type.new", { detail: { previousValue: null, newValue: newLinkTypeInstance, } })));
        this.currentLinkType = newLinkTypeInstance;
    }

    async deleteLinkType() {
        // try {
        const linkTypeModel = new linkTypes(this._dbName, this._dbVersion)
        await linkTypeModel.delete(this.currentLinkType.internal_id);
        // const index = this.linkTypes.findIndex(linkType => linkType.internal_id == this.currentLinkType.internal_id);
        // this.linkTypes.splice(index, 1);
        this.linkTypes.delete(this.currentLinkType.internal_id);
        this.onDeleteLinkType.forEach(listener => listener.dispatchEvent(new CustomEvent("link-type.deleted", { detail: { newValue: this.currentLinkType, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    async saveCurrentLinkType() {
        // try {
        const linkTypeModel = new linkTypes(this._dbName, this._dbVersion);
        let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentLinkType)), this.currentLinkType);
        this.currentLinkType.project_id = this.activeProject.internal_id;
        this.currentLinkType.data = await linkTypeModel.save(this.currentLinkType);
        this.currentLinkType.state = modelViewState.saved;
        // Let every listener know the current objective have been saved.
        this.onLinkTypeSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("link-type.saved", { detail: { previousValue: previousValue, newValue: this.currentLinkType, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    //#endregion
    //#region Links
    get allLinks() { return this._links; } // Unfiltered links
    get links() {
        let linkFilter = () => true;
        if (this._searchString != "") {
            linkFilter = link => (link.identifier.indexOf(this._searchString) >= 0) || (link.description.indexOf(this._searchString) >= 0);
        }
        this._searchedLinks.clear();
        [...this.allLinks.values()].filter(linkFilter).forEach(link => this._searchedLinks.set(link.internal_id, link))
        //this._searchedLinks.push(...this._links.filter(linkFilter));
        return this._searchedLinks;
    }
    get onLinksLoaded() { return this._onLinksLoaded; }
    get onLinkSaved() { return this._onLinkSaved; }
    get onCurrentLinkChanged() { return this._onCurrentLinkChanged; }
    get onNewLink() { return this._onNewLink; }
    get onDeleteLink() { return this._onDeleteLink; }

    get currentLink() { return this._currentLink; }
    set currentLink(value) {
        this._previous = this._currentLink;
        this._currentLink = value;
        this.onCurrentLinkChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("link.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentLink, } })));
    }

    async loadLinks() {
        this.allLinks.clear();
        if (this.activeProject) {
            const linkModel = new links(this._dbName, this._dbVersion);
            const results = await linkModel.load(this.activeProject.internal_id);
            results.forEach(result => {
                this.allLinks.set(result.internal_id, new Link({ ...result, state: modelViewState.existing }));
            });
        }
        this.onLinksLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("links.loaded", { detail: { newValue: this.links, } })));
    }
    newLink() {
        const newLinkInstance = new Link({ state: modelViewState.new, project_id: this.currentProject.internal_id });

        this.allLinks.set(newLinkInstance.internal_id, newLinkInstance);
        this.onNewLink.forEach(listener => listener.dispatchEvent(new CustomEvent("link.new", { detail: { previousValue: null, newValue: newLinkInstance, } })));
        this.currentLink = newLinkInstance;
    }

    async deleteLink() {
        const linkModel = new links(this._dbName, this._dbVersion)
        await linkModel.delete(this.currentLink.internal_id);
        this.allLinks.delete(this.currentLink.internal_id);
        this.onDeleteLink.forEach(listener => listener.dispatchEvent(new CustomEvent("link.deleted", { detail: { newValue: this.currentLink, } })));
    }
    async saveCurrentLink() {
        const newReverseLink = async (source_id, target_id, identifier, description, linkType_id) => {
            const newLinkInstance = new Link({ state: modelViewState.new, project_id: this.currentProject.internal_id });
            newLinkInstance.project_id = this.activeProject.internal_id;
            newLinkInstance.identifier = identifier;
            newLinkInstance.description = description
            newLinkInstance.source_id = source_id;
            newLinkInstance.target_id = target_id;
            newLinkInstance.linkType_id = linkType_id;

            const linkModel = new links(this._dbName, this._dbVersion);
            newLinkInstance.data = await linkModel.save(newLinkInstance);
            newLinkInstance.state = modelViewState.saved;

            this.allLinks.set(newLinkInstance.internal_id, newLinkInstance);
            this.onNewLink.forEach(listener => listener.dispatchEvent(new CustomEvent("link.new", { detail: { previousValue: null, newValue: newLinkInstance, } })));
        }

        const linkModel = new links(this._dbName, this._dbVersion);
        let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentLink)), this.currentLink);
        this.currentLink.project_id = this.activeProject.internal_id;
        this.currentLink.data = await linkModel.save(this.currentLink);
        this.currentLink.state = modelViewState.saved;
        // Check if there is a link-type-pair and create the reverse link using the other link type.
        const linkType = this.allLinkTypes.get(this.currentLink.linkType_id);
        if (linkType?.linkedType_id) {
            await newReverseLink(this.currentLink.target_id, this.currentLink.source_id, this.currentLink.identifier, this.currentLink.description, linkType.linkedType_id);
            this.onLinksLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("links.loaded", { detail: { previousValue: null, newValue: this.links, } })));
        }
        else {
            // Let every listener know the current objective have been saved.
            this.onLinkSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("link.saved", { detail: { previousValue: previousValue, newValue: this.currentLink, } })));
        }
    }
    //#endregion

}
const modelViewState = Object.freeze({ "new": "new", "unsaved": "unsaved", "saved": "saved", "unknown": "unknown", "existing": "existing" })

class baseModelViewClass {
    constructor({ eventNamePrefix = "", internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", state = "", project_id = "" } = {}) {
        this._data = { internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, project_id: project_id, };
        this._isDirty = false;
        this._onIdentifierChanged = [];
        this._onDescriptionChanged = [];
        this._onForecolourChanged = [];
        this._onBackcolourChanged = [];
        this._onStateChanged = [];
        this._eventNamePrefix = eventNamePrefix;
        this.className = ""
        this.state = state;
    }

    get data() { return this._data; }
    set data(value) { this._data = value; }

    get onStateChanged() { return this._onStateChanged; }
    get onBackcolourChanged() { return this._onBackcolourChanged; }
    get onForecolourChanged() { return this._onForecolourChanged; }
    get onIdentifierChanged() { return this._onIdentifierChanged; }
    get onDescriptionChanged() { return this._onDescriptionChanged; }

    get internal_id() {
        if (!this._data.internal_id || (this._data.internal_id == "")) {
            this._data.internal_id = baseModel.makeid(30);
        }
        //console.log("internal_id = " + this._data.internal_id);
        return this._data.internal_id;
    }

    get state() { return this._data.state; }
    set state(value) {
        const previousValue = this._data.state;
        this._data.state = value;
        if (previousValue != this._data.state) {
            this.onStateChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".stateChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.state, } })));
        }
    }

    get identifier() { return this._data.identifier; }
    set identifier(value) {
        const previousValue = this._data.identifier;
        this._data.identifier = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onIdentifierChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".identifierChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.identifier, } })));
    }

    get description() { return this._data.description; }
    set description(value) {
        const previousValue = this._data.description;
        this._data.description = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onDescriptionChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".descriptionChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.description, } })));
    }

    get project_id() { return this._data.project_id; }
    set project_id(value) {
        const previousValue = this._data.project_id;
        this._data.project_id = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        //this.onDescriptionChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".descriptionChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.description, } })));
    }

    get forecolour() { return this._data.forecolour; }
    set forecolour(value) {
        const previousValue = this._data.forecolour;
        this._data.forecolour = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onForecolourChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".forecolourChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.forecolour, } })));
    }

    get backcolour() { return this._data.backcolour; }
    set backcolour(value) {
        const previousValue = this._data.backcolour;
        this._data.backcolour = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onBackcolourChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".backcolourChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.backcolour, } })));
    }

    get created() { return this._data.created; }
    get updated() { return this._data.updated; }
    toJSON() {
        return {
            internal_id: this.internal_id,
            identifier: this.identifier,
            description: this.description,
            forecolour: this.forecolour,
            backcolour: this.backcolour,
            created: this.created,
            updated: this.updated,
            project_id: this.project_id
        };
    }
    // fromJSON(data) {
    //     this.internal_id = data.internal_id;
    //     this.identifier = data.identifier;
    //     this.description = data.description;
    //     this.forecolour = data.forecolour;
    //     this.backcolour = data.backcolour;
    //     this.created = data.created;
    //     this.updated = data.updated;
    //     this.project_id = data.project_id;
    // }
}

class Project extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", state = modelViewState.unknown, project_id = "", active = false, } = {}) {
        super({ eventNamePrefix: "project", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id: project_id });
        this._active = active;
        this.onActiveChanged = [];
    }
    get active() { return this._active; }
    set active(value) {
        const previousValue = this._active;
        this._active = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onActiveChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".activeChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.active, } })));
    }

    toJSON() {
        return super.toJSON();
    }
}

class Item extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", type_id = null, state = modelViewState.unknown, project_id = "" } = {}) {
        super({ eventNamePrefix: "item", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id: project_id });
        this._type_id = type_id;
        this._onTypeIdChanged = [];
    }
    get onTypeIdChanged() { return this._onTypeIdChanged; }
    get type_id() { return this._type_id; }
    set type_id(value) {
        const previousValue = this._type_id;
        this._type_id = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onTypeIdChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".typeIdChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.type_id, } })));
    }
    toJSON() {
        const base = super.toJSON();
        base.type_id = this.type_id;
        return base;
    }
}

class ItemType extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", state = modelViewState.unknown, project_id = "" } = {}) {
        super({ eventNamePrefix: "item-type", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id: project_id });
    }
    toJSON() {
        return super.toJSON();
    }
}
class Link extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", state = modelViewState.unknown, project_id = "", source_id = "", target_id = "", linkType_id = "" } = {}) {
        super({ eventNamePrefix: "link", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id: project_id });
        this._linkType_id = linkType_id;
        this._onLinkTypeIdChanged = [];

        this._target_id = target_id;
        this._onTargetIdChanged = [];

        this._source_id = source_id;
        this._onSourceIdChanged = [];
    }
    get onLinkTypeIdChanged() { return this._onLinkTypeIdChanged; }
    get linkType_id() { return this._linkType_id; }
    set linkType_id(value) {
        const previousValue = this._linkType_id;
        this._linkType_id = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onLinkTypeIdChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".linkTypeIdChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.linkType_id, } })));
    }
    get onSourceIdChanged() { return this._onSourceIdChanged; }
    get source_id() { return this._source_id; }
    set source_id(value) {
        const previousValue = this._source_id;
        this._source_id = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onSourceIdChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".sourceIdChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.source_id, } })));
    }
    get onTargetIdChanged() { return this._onTargetIdChanged; }
    get target_id() { return this._target_id; }
    set target_id(value) {
        const previousValue = this._target_id;
        this._target_id = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onTargetIdChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".targetIdChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.target_id, } })));
    }
    toJSON() {
        const base = super.toJSON();
        base.source_id = this.source_id;
        base.target_id = this.target_id;
        base.linkType_id = this.linkType_id;
        return base;
    }
}

class LinkType extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", state = modelViewState.unknown, project_id = "", dash = "", marker = "", linkedType_id = "" } = {}) {
        super({ eventNamePrefix: "link-type", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id: project_id });
        this._dash = dash;
        this._marker = marker;
        this._linkedType_id = linkedType_id;

        this._onDashChanged = [];
        this._onMarkerChanged = [];
        this._onLinkedTypeIdChanged = [];
    }
    get onDashChanged() { return this._onDashChanged; }
    get onMarkerChanged() { return this._onMarkerChanged; }
    get onLinkedTypeIdChanged() { return this._onLinkedTypeIdChanged; }

    get dash() { return this._dash; }
    set dash(value) {
        const previousValue = this._dash;
        this._dash = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onDashChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".dashChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.dash, } })));
    }
    get marker() { return this._marker; }
    set marker(value) {
        const previousValue = this._marker;
        this._marker = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onMarkerChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".markerChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.marker, } })));
    }
    get linkedType_id() { return this._linkedType_id; }
    set linkedType_id(value) {
        const previousValue = this._linkedType_id;
        this._linkedType_id = value;
        this.state = (this.state == modelViewState.new) ? modelViewState.new : modelViewState.unsaved;
        this.onLinkedTypeIdChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".linkedTypeIdChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.linkedType_id, } })));
    }
    toJSON() {
        const base = super.toJSON();
        base.dash = this.dash;
        base.marker = this.marker;
        base.linkedType_id = this.linkedType_id;
        return base;
    }
}
