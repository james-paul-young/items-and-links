class utils {
    static makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    // Object Store names
    static guid() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
    }
}
class ConnectorLines {
    static data = [
        { id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-5 -5 10 10' }
        , { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' }
        , { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' }
        , { id: 3, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
    ]
    static dashes = [
        { name: "short dash", on: 3, off: 3 },
        { name: "solid", on: 1, off: 0 },
        { name: "dash", on: 7, off: 7 }
    ];

    static createLineAndMarker(svg, width, height, markerData, dashType) {
        var svgWidth = width;
        var svgHeight = height;
        var strokeWidth = 2;

        svg.selectAll("*").remove();

        var defs = svg.append('defs')

        var lineGroup = svg.append('g')
            .attr('id', 'marker')
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

        ConnectorLines.createMarker(defs, [markerData], "", 0, 0);
        var path = lineGroup.selectAll('line')
            .data([markerData])
            .enter()
            .append('line')
            .attr('x1', d => d.width + strokeWidth + 1)
            .attr('y1', Math.floor(svgHeight / 2))
            .attr('x2', d => svgWidth - d.width - strokeWidth - 2)
            .attr('y2', Math.floor(svgHeight / 2))
            .attr('stroke', (d, i) => { return d.colour; })
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', 'round')
            .attr("stroke-dasharray", dashType.on + " " + dashType.off)
            .attr('marker-end', (d, i) => { return 'url(#marker_' + d.internal_id + ")"; })

    }
/**
 * 
 * @param {string} inputId ID of the list UI element
 * @param {string} colour Colour value to use for each connector line
 * @param {*} dashName The name of the dash to be selected (in combination with the marker name)
 * @param {*} markerName The name of the marker to be selected (in combination with the dash name)
 */
    static drawDashesAndMarkersSelect(inputId, colour, dashName, markerName) {
        console.assert(inputId != "", "No input Id to identify \"list\" element.");
        var selectedConnectorListItem = null;
        var listContainer = document.getElementById(inputId)

        // Clear out any content in the list before adding all the connectors.
        listContainer.innerHTML = "";
        // Loop through the dashes and markers to create a candidate line for a connector.
        ConnectorLines.dashes.forEach(dashItem => {
            ConnectorLines.data.forEach(markerItem => {
                // Create the list item for containing the candidate line.
                var connectorListItem = document.createElement("li");
                connectorListItem.setAttribute("class", "d-flex justify-content-between align-items-center connectorListItem");
                // // Set the id so the svg can be added to this element below.
                // connectorListItem.id = "connector-" + markerItem.name + "-" + dashItem.name;
                connectorListItem.dataset.marker = markerItem.name;
                connectorListItem.dataset.dash = dashItem.name;
                // See if the current candidate line should be marked as "selected" based on parameters passed to this function.
                if ((dashItem.name == dashName) && (markerItem.name == markerName)) {
                    selectedConnectorListItem = connectorListItem;
                    connectorListItem.classList.add("connectorsInputSelected");
                }
                // Add a "click" listener to handle the current item being "selected" as the candidate line.
                connectorListItem.addEventListener("click", (event) => {
                    var allconnectorListItems = document.querySelectorAll(".connectorListItem");
                    // Clear the selection indicators of all other candidate lines.
                    [...allconnectorListItems].forEach(connectorListItem => {
                        connectorListItem.classList.remove("connectorsInputSelected");
                    });
                    // Set the selection indicator for the current candidate line.
                    event.currentTarget.classList.toggle("connectorsInputSelected");
                });
                // Create the container for the candidate line
                var connectorListItemDiv = document.createElement("div");
                // Give the container a random id to uniquely identify it among other containers. Used when adding SVG.
                connectorListItemDiv.id = utils.makeid(50);
                connectorListItemDiv.width = "100px";
                connectorListItem.appendChild(connectorListItemDiv);

                // Add the container to the list.
                listContainer.appendChild(connectorListItem);

                var svg = d3.select("#" + connectorListItemDiv.id).append('svg')
                    .attr('width', "100")
                    .attr('height', "20")
                    .attr("id", "svg_" + connectorListItemDiv.id);
                //var marker = data.find((datum) => datum.name == markerItem.name);
                var candidateLineMarker = JSON.parse(JSON.stringify(markerItem));
                candidateLineMarker.internal_id = utils.makeid(50);
                candidateLineMarker.colour = colour;
                candidateLineMarker.width = 5;
                candidateLineMarker.height = 5;
                ConnectorLines.createLineAndMarker(svg, 100, 20, candidateLineMarker, dashItem);
            });
            if (selectedConnectorListItem != null) {
                selectedConnectorListItem.scrollIntoView();
            }

        });

    }
    static createMarker(defs, markerData, markerSuffix, refX, refY) {
                defs.selectAll("*").remove();
        var allMarkers = defs.selectAll('marker').data(markerData, d => d.internal_id);
        var newMarkers = allMarkers.enter();
        var oldMarkers = allMarkers.exit();

        oldMarkers.remove();

        newMarkers
            .append('marker')
            .attr('markerUnits', 'strokeWidth')
            .attr('orient', 'auto')
            .attr('id', function (d) {
                return 'marker_' + d.internal_id + markerSuffix;
            })
        allMarkers = newMarkers.merge(allMarkers);

        allMarkers.selectAll("marker")
            .attr('markerHeight', d => d.height)
            .attr('markerWidth', d => d.width)
            .attr('refX', refX)
            .attr('refY', refY)
            .attr('viewBox', function (d) { return d.viewbox })
            .append('path')
            .attr('d', (d) => d.path)
            .attr('fill', (d, i) => d.colour);

            var pattern = defs.append("pattern")
            .attr("id", "Pattern")
            .attr("width", .25)
            .attr("height", .25)
            .attr("patternContentUnits", "objectBoundingBox")
        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0.25)
            .attr("height", 0.25)
            .attr("fill", "skyblue")

        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0.125)
            .attr("height", 0.125)
            .attr("fill", "pink")

        pattern.append("rect")
            .attr("cx", 25)
            .attr("cy", 25)
            .attr("r", 20)
            .attr("fill-opacity", 0.5)
            .attr("fill", "orange")

    }
}

class Search {
    search = null;
    constructor(applicationResources) {
        this.search = document.createElement("div");

        let searchInput = document.createElement("input");
        searchInput.setAttribute("id", "searchInput");
        searchInput.setAttribute("type", "text");
        searchInput.setAttribute("class", "form-control mr-sm-2");
        searchInput.setAttribute("placeholder", applicationResources.searchPlaceholderString);
        this.search.appendChild(searchInput);
        searchInput.addEventListener("keyup", event => {

        });

        let searchButton = document.createElement("button");
        searchButton.setAttribute("id", "searchButton");
        searchButton.setAttribute("class", "btn btn-secondary my-2 my-sm-0");
        searchButton.innerHTML = applicationResources.searchString;
        this.search.appendChild(searchButton);

        searchButton.addEventListener("click", event => {
            //alert("Clicked");
        });

    }
}
