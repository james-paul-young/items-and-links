class ViewModel {
    dbName = "thingdb";
    dbVersion = 9;
    
    thingObjectStoreName = "thing";
    typeObjectStoreName = "type";
    connectorObjectStoreName = "connector";
    connectionObjectStoreName = "connection";
    visualiseOptionsObjectStoreName = "visualise";
    projectObjectStoreName = "project"
    visualiseFilterObjectStoreName = "filter"

    constructor()
    {
        //super();
        console.assert((this.dbName != null) && (this.dbName != ""), "Cannot find database name. Add script reference to HTML");
        console.assert(this.dbVersion != null, "Cannot find database version. Ensure database version variable is set.");
        // Make sure the required structures exist in the database.  
        this.checkDatabase();
    }
    checkDatabase() {
        var request = indexedDB.open(this.dbName, this.dbVersion);
        request.onupgradeneeded = (event) => {
            // console.table("Upgrade needed.");
            var db = event.target.result;
            if (event.oldVersion < 1) {
                // Create a thing ObjectStore for this database
                var thingObjectStore = db.createObjectStore(this.thingObjectStoreName, { keyPath: "internal_id" });
                var typeObjectStore = db.createObjectStore(this.typeObjectStoreName, { keyPath: "internal_id" });
            }
            if (event.oldVersion < 2) {
                var markerObjectStore = db.createObjectStore("marker", { keyPath: "internal_id" });
            }
            if (event.oldVersion < 3) {
                var connectorObjectStore = db.createObjectStore(this.connectorObjectStoreName, { keyPath: "internal_id" });
            }
            if (event.oldVersion < 4) {
                db.createObjectStore(this.connectionObjectStoreName, { keyPath: "internal_id" });
            }
            if (event.oldVersion < 5) {
                db.createObjectStore(this.visualiseOptionsObjectStoreName, { keyPath: "internal_id" });
            }
            if (event.oldVersion < 7) {
                db.createObjectStore(this.projectObjectStoreName, { keyPath: "internal_id" });
            }
            if (event.oldVersion < 9) {
                db.createObjectStore(this.visualiseFilterObjectStoreName, { keyPath: "internal_id" });
            }
        };

    }

}
