"use strict";
const dbVersion = 1;
const dbName = "items-and-links";

class Controller {
    constructor(dbName = "items-and-links", dbVersion = 1) {
        this._dbName = dbName;
        this._dbVersion = dbVersion;


        this._onItemTypesLoaded = [];
        this._onLinksLoaded = [];
        this._onLinkTypesLoaded = [];
        this._onFiltersLoaded = [];

        this._projects = new Array();
        this._onProjectsLoaded = [];
        this._onProjectsLoaded = [];
        this._onProjectSaved = [];
        this._onCurrentProjectChanged = [];
        this._onNewProject = [];

        this._items = new Array();
        this._onItemsLoaded = [];
        this._onItemSaved = [];
        this._onCurrentItemChanged = [];
        this._onNewItem = [];
    }
    //#region Items
    get items() { return this._items;}
    get onItemsLoaded() { return this._onItemsLoaded; }
    get onItemSaved() { return this._onItemSaved; }
    get onCurrentItemChanged() { return this._onCurrentItemChanged; }
    get onNewItem() { return this._onNewItem; }
    
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
            const results = await itemModel.load();
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
        const newItemInstance = new Item({ state: modelViewState.new });

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
            this.currentItem = this.items[(index < this.items.length) ? index : this.items.length - 1];
            // Let every listener know the items list has been updated.
            this.onLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("items.loaded", { detail: { newValue: this.items, } })));
        }
        catch (exception) {
            alert(exception);
        }
    }
    async saveCurrentItem() {
        // try {
            const itemModel = new items(this._dbName, this._dbVersion);
            let previousValue = Object.assign(Object.create(Object.getPrototypeOf(this.currentItem)), this.currentItem);

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
    
    get currentProject() { return this._currentProject; }
    set currentProject(value) {
        this._previous = this._currentProject;
        this._currentProject = value;
        this.onCurrentProjectChanged.forEach(listener => listener.dispatchEvent(new CustomEvent("project.currentChanged", { detail: { previousValue: this._previous, newValue: this.currentProject, } })));
    }

    async loadProjects() {
        try {
            this.projects.length = 0;
            const projectModel = new projects(this._dbName, this._dbVersion)
            const results = await projectModel.load();
            results.forEach(result => {
                this.projects.push(new Project(result));
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
            this.onLoaded.forEach(listener => listener.dispatchEvent(new CustomEvent("projects.loaded", { detail: { newValue: this.projects, } })));
        }
        catch (exception) {
            alert(exception);
        }
    }
    async saveCurrentProject() {
        // try {
            const projectModel = new projects(this._dbName, this._dbVersion);
            await projectModel.save(this.currentProject);
            // Let every listener know the current objective have been saved.
            this.onProjectSaved.forEach(listener => listener.dispatchEvent(new CustomEvent("project.saved", { detail: { newValue: this.currentProject, } })));
            this.currentProject.state = modelViewState.saved;
        // }
        // catch (exception) {
        //     alert(exception);
        // }
    }
    //#endregion    
}
const modelViewState = Object.freeze({"new":"new", "unsaved":"unsaved", "saved":"saved", "unknown": "unknown", "existing" : "existing"})

class baseModelViewClass {
    constructor({ eventNamePrefix = "", internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", state = "", } = {}) {
        this._data = { internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated };
        this._isDirty = false;
        this._onIdentifierChanged = [];
        this._onDescriptionChanged = [];
        this._onForecolourChanged = [];
        this._onBackcolourChanged = [];
        this._onStateChanged = [];
        this._eventNamePrefix = eventNamePrefix;
        this.className = ""
        this.state = state;
        this._tempId = "";

    }
    createId() { 
        this._data.internal_id = baseModel.makeid(30);
        return this._data.internal_id;
    }
    get data() { return this._data; }
    set data(value) { this._data = value;}

    get onStateChanged() { return this._onStateChanged; }
    get onBackcolourChanged() { return this._onBackcolourChanged; }
    get onForecolourChanged() { return this._onForecolourChanged; }
    get onIdentifierChanged() { return this._onIdentifierChanged; }
    get onDescriptionChanged() { return this._onDescriptionChanged; }

    get internal_id() { 
        return (this._data.internal_id && (this._data.internal_id != ""))? this._data.internal_id : this.createId(); 
    }

    get state() { return this._data.state; }
    set state(value) {
        const previousValue = this._data.state;
        this._data.state = value;
        //let id = (this._data.state == modelViewState.new)? this.tempId(100) :  this.internal_id;
        this.onStateChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".stateChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.state, } })));
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
}

class Project extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = null, backcolour = null, created = null, updated = null, active = false } = {}) {
        super({ eventNamePrefix: "project", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated });

        this._onActiveChanged = [];
        this.active = active;
    }
    get onActiveChanged() { return this._onActiveChanged; }
    get active() { return this._data.active; }
    set active(value) {
        const previousValue = this._data.active;
        this._data.active = value;
        this.state = (this.state == modelViewState.new)? modelViewState.new : modelViewState.unsaved;
        this.onActiveChanged.forEach(listener => listener.dispatchEvent(new CustomEvent(this._eventNamePrefix + ".activeChanged", { detail: { id: this.internal_id, previousValue: previousValue, newValue: this.data.active, } })));
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
                    "active": "${this.active}"
                }`;
    }
}

class Item extends baseModelViewClass {
    constructor({ internal_id = "", identifier = "", description = "", forecolour = "", backcolour = "", created = "", updated = "", typeId = null, state = modelViewState.unknown } = {}) {
        super({ eventNamePrefix: "item", internal_id: internal_id, identifier: identifier, description: description, forecolour: forecolour, backcolour: backcolour, created: created, updated: updated, state: state });
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
                }`;
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

