"use strict";
const dbVersion = 1;
const dbName = "items-and-links";

class Controller {
    constructor(dbName = "items-and-links", dbVersion = 1) {
        this._dbName = dbName;
        this._dbVersion = dbVersion;


        this._projects = new Array();
        this._onProjectsLoaded = [];
        this._onProjectSaved = [];
        this._onCurrentProjectChanged = [];
        this._onNewProject = [];
        this._onProjectDeleted = [];
        this._onProjectActivated = [];

        this._items = new Array();
        this._onItemsLoaded = [];
        this._onItemSaved = [];
        this._onCurrentItemChanged = [];
        this._onNewItem = [];
        this._onDeleteItem = [];
        
        this._searchString = null;
        this._onSearchActive = [];
    }
    get searchString() { return this._searchString; }
    set searchString(value) {
        const searchedProjects = this.projects.filter(project => (project.identifier.indexOf(value) >= 0) || (project.description.indexOf(value) >= 0));
        this.onSearchActive.forEach(listener => listener.dispatchEvent(new CustomEvent("projects.searched", { detail: { previousValue: null, newValue: searchedProjects, } })));
    }
    get onSearchActive() { return this._onSearchActive; }

    //#region Items
    get items() { return this._items;}
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

    async loadItems() {
        try {
            this.items.length = 0;
            const itemModel = new items(this._dbName, this._dbVersion)
            const results = await itemModel.load(this.activeProject.internal_id);
            results.forEach(result => {
                this.items.push(new Item({...result, state: modelViewState.existing } ));
            });
            this.onItemsLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("items.loaded", { detail: { newValue: this.items, } })));
        }
        catch (exception) {
            alert(exception);
        }
    }
    newItem() {
        const newItemInstance = new Item({ state: modelViewState.new, project_id: this.currentProject.internal_id });

        this.items.push(newItemInstance);
        this.onNewItem.forEach(listener => listener.dispatchEvent(new CustomEvent("item.new", { detail: { previousValue: null, newValue: newItemInstance, } })));
        this.currentItem = newItemInstance;
    }

    async deleteItem() {
        try {
            const itemModel = new items(this._dbName, this._dbVersion)
            await itemModel.delete(this.currentItem.internal_id);
            const index = this.items.findIndex(item => item.internal_id == this.currentItem.internal_id);
            this.items.splice(index, 1);
            this.onDeleteItem.forEach(listener => listener.dispatchEvent(new CustomEvent("item.deleted", { detail: { newValue: this.currentItem, } })));

            //this.currentItem = this.items[(index < this.items.length) ? index : this.items.length - 1];
            // Let every listener know the items list has been updated.
            //this.onLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("items.loaded", { detail: { newValue: this.items, } })));
        }
        catch (exception) {
            alert(exception);
        }
    }
    async saveCurrentItem() {
        // try {
            const itemModel = new items(this._dbName, this._dbVersion);
            let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentItem)), this.currentItem);
            this.currentItem.project_id = this.activeProject.internal_id;
            this.currentItem.data = await itemModel.save(this.currentItem);
            this.currentItem.state = modelViewState.saved;
            // Let every listener know the current objective have been saved.
            this.onItemSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("item.saved", { detail: { previousValue : previousValue, newValue: this.currentItem, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    //#endregion
    //#region Projects
    get projects() { return this._projects;}
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

        // Dump all the loaded things for the current project.
        this._items.length = 0;
        this.loadItems().then(result => {
            this.onCurrentProjectChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("project.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentProject, } })));
        });
    }
    get activeProject() { return this.projects.find(project => project.active); }
    async loadProjects() {
        try {
            this.projects.length = 0;
            const projectModel = new projects(this._dbName, this._dbVersion)
            const results = await projectModel.load();
            results.forEach(result => {
                this.projects.push(new Project({...result, state: modelViewState.existing } ));
            });
            this.onProjectsLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("projects.loaded", { detail: { newValue: this.projects, } })));
        }
        catch (exception) {
            alert(exception);
        }
    }
    newProject() {
        const newProjectInstance = new Project({ state: modelViewState.new });

        this.projects.push(newProjectInstance);
        this.onNewProject.forEach(listener => listener.dispatchEvent(new CustomEvent("project.new", { detail: { previousValue: null, newValue: newProjectInstance, } })));
        this.currentProject = newProjectInstance;
    }

    async deleteProject() {
        try {
            const projectModel = new projects(this._dbName, this._dbVersion)
            await projectModel.delete(this.currentProject.internal_id);
            const index = this.projects.findIndex(project => project.internal_id == this.currentProject.internal_id);
            this.projects.splice(index, 1);
            this.currentProject = this.projects[(index < this.projects.length) ? index : this.projects.length - 1];
            // Let every listener know the projects list has been updated.
            this.onProjectDeleted.forEach(listener => listener.dispatchEvent(new CustomEvent("project.deleted", { detail: { newValue: this.projects, } })));
        }
        catch (exception) {
            alert(exception);
        }
    }
    async saveCurrentProject() {
        // try {
            const projectModel = new projects(this._dbName, this._dbVersion);
            let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentProject)), this.currentProject);

            this.currentProject.data = await projectModel.save(this.currentProject);
            this.currentProject.state = modelViewState.saved;
            // Let every listener know the current objective have been saved.
            this.onProjectSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("project.saved", { detail: { previousValue : previousValue, newValue: this.currentProject, } })));
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    async activateCurrentProject() {
        const projectModel = new projects(this._dbName, this._dbVersion);
        const previousValue = this.projects.find(project => project.active);
        previousValue.active = false;
        projectModel.save(previousValue);
        this.currentProject.active = true;
        projectModel.save(this.currentProject);
        this.onProjectActivated.forEach(listener => listener.dispatchEvent(new CustomEvent("project.activated", { detail: { previousValue : previousValue, newValue: this.currentProject, } })));
    }
    //#endregion
}
const modelViewState = Object.freeze({"new":"new", "unsaved":"unsaved", "saved":"saved", "unknown": "unknown", "existing" : "existing"})

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
    set data(value) { this._data = value;}

    get onStateChanged() { return this._onStateChanged; }
    get onBackcolourChanged() { return this._onBackcolourChanged; }
    get onForecolourChanged() { return this._onForecolourChanged; }
    get onIdentifierChanged() { return this._onIdentifierChanged; }
    get onDescriptionChanged() { return this._onDescriptionChanged; }

    get internal_id() { 
        if(!this._data.internal_id || (this._data.internal_id == "")) {
            this._data.internal_id = baseModel.makeid(30);
        }
        //console.log("internal_id = " + this._data.internal_id);
        return this._data.internal_id;
    }

    get state() { return this._data.state; }
    set state(value) {
        const previousValue = this._data.state;
        this._data.state = value;
        if(previousValue != this._data.state) {
            this.onStateChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".stateChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.state, } })));
        }
    }

    get identifier() { return this._data.identifier; }
    set identifier(value) {
        const previousValue = this._data.identifier;
        this._data.identifier = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        this.onIdentifierChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".identifierChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.identifier, } })));
    }

    get description() { return this._data.description; }
    set description(value) {
        const previousValue = this._data.description;
        this._data.description = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        this.onDescriptionChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".descriptionChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.description, } })));
    }

    get project_id() { return this._data.project_id; }
    set project_id(value) {
        const previousValue = this._data.project_id;
        this._data.project_id = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        //this.onDescriptionChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".descriptionChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.description, } })));
    }

    get forecolour() { return this._data.forecolour; }
    set forecolour(value) {
        const previousValue = this._data.forecolour;
        this._data.forecolour = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        this.onForecolourChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".forecolourChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.forecolour, } })));
    }

    get backcolour() { return this._data.backcolour; }
    set backcolour(value) {
        const previousValue = this._data.backcolour;
        this._data.backcolour = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        this.onBackcolourChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".backcolourChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.backcolour, } })));
    }

    get created() { return this._data.created; }
    get updated() { return this._data.updated; }
    toJSON(additionalJSON = "") {
        return `
                {
                    "internal_id": "${this.internal_id}",
                    "identifier" : "${this.identifier}", 
                    "description": "${this.description}", 
                    "forecolour": "${this.forecolour}", 
                    "backcolour": "${this.backcolour}", 
                    "created": "${this.created}", 
                    "updated": "${this.updated}",
                    "project_id": "${this.project_id}"
                    ${(additionalJSON.length) > 0? ", " + additionalJSON : ""}
                }`;
    }

}

class Project extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", typeId = null, state = modelViewState.unknown, project_id = "", active = false, } = {}) {
        super({ eventNamePrefix: "project", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id: project_id });
        this._active = active;
        this.onActiveChanged = [];
    }
    get active() { return this._active; }
    set active(value) {
        const previousValue = this._active;
        this._active = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        this.onActiveChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".activeChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.active, } })));
    }
    
    toJSON() {
        return super.toJSON();
    }
}

class Item extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", typeId = null, state = modelViewState.unknown, project_id = ""} = {}) {
        super({ eventNamePrefix: "item", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state, project_id : project_id});
    }
    toJSON() {
        return super.toJSON();
    }
}

class ItemType extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = null, backcolour = null, created = null, updated = null } = {}) {
        super({ eventNamePrefix: "itemType", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated });
    }
    toJSON() {
        return `
                {
                    "internal_id": "${this.internal_id}",
                    "identifier" : "${this.identifier}", 
                    "description": "${this.description}", 
                    "forecolour": "${this.forecolour}", 
                    "backcolour": "${this.backcolour}", 
                    "created": "${this.created}", 
                    "updated": "${this.updated}"
                }`;
    }
}

class Link extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = null, backcolour = null, created = null, updated = null, typeId = null } = {}) {
        super({ eventNamePrefix: "link", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated });

        this.onTypeChanged = [];
        this.typeId = typeId;
    }
    get typeId() { return this._data.typeId; }
    set typeId(value) {
        const previousValue = this._data.typeId;
        this._data.typeId = value;
        this._isDirty = true;
        this.onTypeChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".TypeChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.typeId, } })));
    }

    toJSON() {
        return `
                {
                    "internal_id": "${this.internal_id}",
                    "identifier" : "${this.identifier}", 
                    "description": "${this.description}", 
                    "forecolour": "${this.forecolour}", 
                    "backcolour": "${this.backcolour}", 
                    "created": "${this.created}", 
                    "updated": "${this.updated}",
                    "typeId": "${this.linkTypeId}"
                }`;
    }
}

class LinkType extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = null, backcolour = null, created = null, updated = null } = {}) {
        super({ eventNamePrefix: "linkType", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated });
    }
    toJSON() {
        return `
                {
                    "internal_id": "${this.internal_id}",
                    "identifier" : "${this.identifier}", 
                    "description": "${this.description}", 
                    "forecolour": "${this.forecolour}", 
                    "backcolour": "${this.backcolour}", 
                    "created": "${this.created}", 
                    "updated": "${this.updated}"
                }`;
    }
}

