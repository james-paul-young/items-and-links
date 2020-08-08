class Type {
    constructor() {
        this.internal_id = "";
        this.identifier = "";
        this.description = "";
        this.icon = "";
        this.colour = "";
        this.background_colour = "";
        this.created = "";
        this.updated = "";
        this.project_id = "";
        this.jiraId = "";
        this.custom_image = "";
    }

    get iconCode() {
        var foundIconCode = null;
        if (this.icon != null) {
            console.assert(typeResources != null, "No Type resouce file loaded. Cannot find icon.")
            var foundIcon = typeResources.icons.find(i => i.name == this.icon);
            if (foundIcon != null) {
                foundIconCode = foundIcon.unicode;
            }
        }
        return (foundIconCode);
    }
    copy() {
        let type = new Type();
        type.internal_id = this.internal_id;
        type.identifier = this.identifier;
        type.description = this.description;
        type.icon = this.icon;
        type.colour = this.colour;
        type.background_colour = this.background_colour;
        type.created = this.created;
        type.updated = this.updated;
        type.project_id = this.project_id;
        type.jiraId = this.jiraId;
        type.custom_image = this.custom_image;
        return(type);
    }
}

class Types extends Array {
    copy() {
        return(this.map(type => type.copy()));
    }
}
