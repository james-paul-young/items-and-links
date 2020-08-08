class ApplicationView {
    constructor(pageTitleString) {
        document.body.appendChild(this.navigationMenuHTML(pageTitleString));
        // Set up the application-level display requirements.
        document.title = applicationResources.applicationNameString + " - " + pageTitleString;
        document.getElementById("applicationName").innerHTML = applicationResources.applicationNameString;
        document.getElementById("homePageLink").innerHTML = applicationResources.homePageString;
        document.getElementById("thingPageLink").innerHTML = applicationResources.thingPageString;
        document.getElementById("typePageLink").innerHTML = applicationResources.typePageString;
        document.getElementById("connectionPageLink").innerHTML = applicationResources.connectionPageString;
        document.getElementById("connectorPageLink").innerHTML = applicationResources.connectorPageString;
        document.getElementById("visualisePageLink").innerHTML = applicationResources.visualisePageString;

    }

    navigationMenuHTML(current) {
        var navigationNode = document.createElement("nav");
        navigationNode.setAttribute("class", "navbar navbar-expand-lg navbar-dark bg-primary fixed-top");
        navigationNode.innerHTML = `    
            <a class="navbar-brand" href="#"><span id="applicationName">${applicationResources.applicationNameString}</span></a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01"
                aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarColor01">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <a class="nav-link ${this.currentActive(applicationResources.homePageString, current)}" href="${this.path(applicationResources.homePageString, current)}index.html" >
                            <span id="homePageLink">${applicationResources.homePageString} ${this.currentHTML("index", current)}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${this.currentActive(applicationResources.thingPageString, current)}" href="${this.path("thing", current)}thing.html">
                            <span id="thingPageLink">${applicationResources.thingPageString} ${this.currentHTML("thing", current)}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${this.currentActive(applicationResources.typePageString, current)}" href="${this.path("type", current)}type.html">
                            <span id="typePageLink">${applicationResources.typePageString} ${this.currentHTML("type", current)}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${this.currentActive(applicationResources.connectorPageString, current)}" href="${this.path("connector", current)}connector.html">
                            <span id="connectorPageLink">${applicationResources.connectorPageString} ${this.currentHTML("connector", current)}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${this.currentActive(applicationResources.connectionPageString, current)}" href="${this.path("connection", current)}connection.html">
                            <span id="connectionPageLink">${applicationResources.connectionPageString} ${this.currentHTML("connection", current)}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${this.currentActive(applicationResources.visualisePageString, current)}" href="${this.path("visualise", current)}visualise.html">
                            <span id="visualisePageLink">${applicationResources.visualisePageString} ${this.currentHTML("visualise", current)}</span>
                        </a>
                    </li>
                </ul>
            </div>
    `;
        return (navigationNode);
    }
    path(navItem, current) {
        var pathString = "";
        if (navItem.toLocaleLowerCase() != current.toLocaleLowerCase()) {
            if (current.toLocaleLowerCase() != applicationResources.homePageString.toLocaleLowerCase()) {
                if (navItem.toLocaleLowerCase() == applicationResources.homePageString.toLocaleLowerCase()) {
                    pathString = "../";
                }
                else {
                    pathString = "../" + navItem + "/";
                }
            }
            else {
                // Special case for the index page as it does not have a path. It is in the parent directory.
                pathString = navItem + "/";
            }
        }
        return (pathString);
    }
    currentActive(navItem, current) {
        var activeString = "";
        if (navItem.toLocaleLowerCase() == current.toLocaleLowerCase()) {
            activeString = "active";
        }
        return (activeString);
    }
    currentHTML(navItem, current) {
        var currentHTMLstring = "";
        if (navItem.toLocaleLowerCase() == current.toLocaleLowerCase()) {
            currentHTMLstring = `<span class="sr-only">(current)</span>`;
        }
        return (currentHTMLstring);
    }

}
