class Thing {
    constructor() {
        this.internal_id = null;
        this.identifier = "";
        this.description = "";
        this.type = null;
        this.connections = null;
        this.created = null;
        this.updated = null;
        this.project_id = "";
        this.jiraId = "";
        this.colour = "";
        this.fill_colour = "";
    }
    copy() {
        let thing = new Thing();

        thing.internal_id = this.internal_id;
        thing.identifier = this.identifier;
        thing.description = this.description;
        thing.type = this.type;
        thing.connections = this.connections;
        thing.created = this.created;
        thing.updated = this.updated;
        thing.custom_image = this.custom_image;
        thing.project_id = this.project_id;
        thing.jiraId = this.jiraId;
        
        return(thing);
    }
}

class Things extends Array {
    copy() {
        return(this.map(thing => thing.copy()));
    }
}
