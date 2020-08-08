class Connection {
    constructor() {
        this.internal_id = "";
        this.identifier = "";
        this.description = "";
        this.source = null;
        this.target = null;
        this.connector = null;
        this.created = null;
        this.updated = null;
        this.project_id = "";
    }
    
    copy() {
        let connection = new Connection();
        connection.internal_id = this.internal_id;
        connection.identifier = this.identifier;
        connection.description = this.description;
        connection.source = (typeof(this.source) == "Connection")? this.source.internal_id : this.source; // d3 replaces this string id with an actual object. Just copy the string.
        connection.target = (typeof(this.target) == "Connection")? this.target.internal_id : this.target; // d3 replaces this string id with an actual object. Just copy the string.
        connection.connector = this.connector;
        connection.created = this.created;
        connection.updated = this.updated;
        connection.project_id = this.project_id;

        return(connection);
    }
}

class Connections extends Array {
    copy() {
        return(this.map(connection => connection.copy()));
    }
}
