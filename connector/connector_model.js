class Connector {
    constructor() {
        this.internal_id = "";
        this.identifier = "";
        this.description = "";
        this.colour = "";
        this.marker = "";
        this.dash = "";
        this.marker_id = "";
        this.created = "";
        this.updated = "";
        }

    copy() {
        var newConnector = new Connector();
        newConnector.internal_id = this.internal_id;
        newConnector.identifier = this.identifier;
        newConnector.description = this.desc;
        newConnector.colour = this.colour;
        newConnector.marker = this.marker;
        newConnector.dash = this.dash;
        newConnector.marker_id = this.marker_id;
        newConnector.created = this.created;
        newConnector.updated = this.updated;
        return (newConnector);
    }
}

class Connectors extends Array {
    copy() {
        // using d3 can add unwanted variables. Return a stripped-back version of the array
        return(this.map(connector => connector.copy()));
    }
}
