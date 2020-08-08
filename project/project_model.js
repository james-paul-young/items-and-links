class Project {
    constructor() {
        this.internal_id = "";
        this.identifier = "";
        this.description = "";
        this._created = "";
        this._updated = "";
    }
    get created() {
        return (this._created == null ? "" : this._created);
    }
    set created(value) {
        this._created = value;
    }
    get updated() {
        return (this._updated == null ? "" : this._updated);
    }
    set updated(value) {
        this._updated = value;
    }
}

class Projects extends Array {
}
