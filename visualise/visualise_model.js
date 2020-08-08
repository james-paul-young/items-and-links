class VisualiseOptions {
    internal_id = null;
    nodeRadius = 0.0;
    strength = -9000;
    maxDistance = 500;
    linkRadius = 150;
    created = null;
    nodeLabels = true;
    pathLabels = true;
}

class VisualiseFilterOptions extends Thing {
    constructor() {
        super();
        this.types = [];
        this.connectors = [];
    }
}
