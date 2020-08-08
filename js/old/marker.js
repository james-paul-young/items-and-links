var markerData = [
    { id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12' },
    { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' },
    { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' },
    { id: 2, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
]

var patterns = [
    { id: 0, name: "close-dash", dasharray: "3 , 3" },
    { id: 1, name: "dash", dasharray: "5 , 5" },
    { id: 2, name: "far-dash", dasharray: "10 , 10" },
    { id: 3, name: "solid", dasharray: "1 , 0" }
]

var markerModal = document.getElementById("markerModal");
window.onload = () => {
    document.getElementById("markerChartColourInput").addEventListener("click", () => {
        lineColour = document.getElementById("markerChartColourInput").value;
    });
    console.log("Loading...");
    drawMarkers("markersInput");
    Loadmarkers().then(result => {
            const dropdownTitle = document.querySelector('.dropdown .title');
            // const dropdownOptions = document.querySelectorAll('.dropdown .option');

            // //bind listeners to these elements
            dropdownTitle.addEventListener('click', toggleMenuDisplay);
            // dropdownOptions.forEach(option => option.addEventListener('click', handleOptionSelected));
            document.querySelector('.dropdown .title').addEventListener('change', handleTitleChange);
    });
    // Listen for button click events

    var createmarkerButton = document.getElementById("createmarkerButton");
    createmarkerButton.addEventListener("click", (event) => {
        ViewMarker();
    });
    // Get the <span> element that closes the modal
    var markerModalClose = document.getElementById("markerModalClose");
    markerModalClose.addEventListener("click", (event) => {
        markerModal.style.display = "none";
    });
    var savemarkerButton = document.getElementById("savemarkerButton");
    savemarkerButton.addEventListener("click", (event) => {
        Savemarker();
        markerModal.style.display = "none";
        Loadmarkers();
    });
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    if (event.target == markerModal) {
        markerModal.style.display = "none";
    }
}

function guid() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}

function Savemarker() {
    var request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(["marker"], "readwrite");

        // Get all the input elements from the modal dialog.
        var markerGUID = markerModal.getAttribute("markerGUID");

        var markerDescriptionInput = document.getElementById("markerDescriptionInput");
        var markerIdentifierInput = document.getElementById("markerIdentifierInput");
        var markerChartColourInput = document.getElementById("markerChartColourInput");
        var markerInput = document.getElementById("markersInput");

        var newRecord = ((markerGUID == null) || (markerGUID.length == 0));

        var marker = {
            guid: markerGUID || guid(),
            description: markerDescriptionInput.value,
            identifier: markerIdentifierInput.value,
            chart_colour: markerChartColourInput.value,
            end_marker_name: markerInput.dataset.marker
        };
        console.log("marker = " + JSON.stringify(marker));

        // Do somemarker when all the data is added to the database.
        transaction.oncomplete = (event) => { console.log("marker Type written!"); };
        transaction.onerror = (event) => { console.error("error: " + event); };

        var objectStore = transaction.objectStore("marker");
        //console.log("ObjectStore = " + objectStore.name + ", newRecord = " + newRecord + ", contents = " + item.contents);
        //console.log("Name = " + item.contents);
        var request = null;
        if (!newRecord) {
            request = objectStore.put(marker);
        }
        else {
            request = objectStore.add(marker);
        }
        request.onsuccess = (event) => { console.log(newRecord ? "marker TypeAdded." : "Updated"); }
        request.onerror = (event) => { console.log("marker Type not Added."); }
        request.oncomplete = (event) => { db.close(); }
    };
    request.onerror = (event) => { alert("Database error: " + event.target.errorCode); };
}

var iconIndex = 0;
var identifierIndex = 1;
var descriptionIndex = 2;
var actionsIndex = 3;

function Loadmarkers() {
    return new Promise((resolve, reject) => {

        var request = indexedDB.open(dbName, dbVersion);
        request.onsuccess = (event) => {
            var db = event.target.result;
            var transaction = db.transaction(["marker"], "readwrite");

            // Do somemarker when all the data is added to the database.
            transaction.oncomplete = (event) => { console.log("All read!"); resolve(); };
            transaction.onerror = (event) => { console.error("error: " + event); };

            var objectStore = transaction.objectStore("marker");
            var readRequest = objectStore.getAll();
            readRequest.onerror = function (event) {
                // Handle errors!
                console.log("Error when getting all records.");
            };
            readRequest.onsuccess = (event) => {
                var table = document.getElementById("markersTable");
                table.innerHTML = "";
                // Add the header row
                var headerRow = table.insertRow(table.rows.length);
                var headercols = "";
                headercols += `<TH>Style</TH>`;
                headercols += `<TH>Identifier</TH>`;
                headercols += `<TH>Description</TH>`;
                headercols += `<TH>Actions</TH>`;
                headerRow.innerHTML = headercols;

                event.target.result.forEach((item) => {
                    var markerRow = table.insertRow(table.rows.length);
                    var markerCols = `
                        <td><div id="marker${item.guid}"></div></td>
                        <td>${item.identifier}</td>
                        <td>${item.description}</td>
                        <td>
                            <button type="button" title="View" onclick="ViewMarker('${item.guid}')" class="viewButton btn btn-info btn-sm"><i class="fas fa-eye"></i> View</button>
                            <button type="button" title="Delete" onclick="deleteMarkerRow('${item.guid}')" class="deleteButton btn btn-danger btn-sm"><i class="fas fa-trash"></i> Delete</button>
                        </td>`;
                    markerRow.innerHTML = markerCols;
                    DrawSelectedMarker("marker" + item.guid, item.end_marker_name);

                });
                // Do somemarker with the request.result!
            };
            readRequest.oncomplete = (event) => {
                console.log("completing...");
                db.close();
            }
        };
        request.onerror = (event) => { alert("Database error: " + JSON.stringify(event)); };
    });
}
var lineColour;

function addMarkers(elemId)
{
    var markersInput = d3.selectAll("#" + elemId);
    var markers = markersInput.selectAll('marker').data(markerData)
    .enter()
    .append('marker')
    .attr('id', (d) => { return 'marker_' + d.name; })
    .attr('markerHeight', 4)
    .attr('markerWidth', 4)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('refX', 5)
    .attr('refY', 0)
    .attr('viewBox', (d) => { return d.viewbox })
    .append('path')
    .attr('d', (d) => { return d.path })
    .attr('fill', (d, i) => { return "black" });

}
function drawMarkers(elemId)
{
    var markersInput = d3.select("#" + elemId);
    var markerDivs = markersInput.selectAll("div")
        .data(markerData)
        .enter()
        .append("div")
        .attr("class", "option")
        .append("svg")
        .attr("id", "markerSVG")
        .attr("data-marker", (d) => d.name) // Add the marker name into the dataset for later retrieval
        .attr("width", "140px")
        .attr("height", "20px")
        .on("click", (d) => { console.log("g -> svg"); handleOptionSelected(d3.event); })
        .append("g")
        .attr("class", "links")
        .attr("transform", "translate(0,0)")  // bit of margin on the left = 40
        .on("click", (d) => { console.log("g -> click"); handleOptionSelected(d3.event); });
        lineColour = document.getElementById("markerChartColourInput").value;



        markerDivs.append('svg:marker')
            .attr('id', (d) => { return 'marker_' + d.name; })
            .attr('markerHeight', 4)
            .attr('markerWidth', 4)
            .attr('markerUnits', 'strokeWidth')
            .attr('orient', 'auto')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('viewBox', (d) => { return d.viewbox })
            .append('svg:path')
            .merge(markerDivs)
            .attr('d', (d) => { return d.path })
            .attr('fill', (d, i) => { return "black" });

        var drawnlink = markerDivs.append("line")
            .attr("stroke", "black")
            .attr("stroke-width", "4px")
            .attr("stroke-cap", "square")
            .attr("stroke-dasharray", (patterns[0].dasharray))
            .attr('marker-end', function (d, i) { return 'url(#marker_' + d.name + ')' });

        drawnlink.call((link) => {
            link.attr("x1", function (d) { return 0; })
                .attr("y1", function (d) { return 10; })
                .attr("x2", function (d) { return 140; })
                .attr("y2", function (d) { return 10; });
        });

}

function ViewMarker(markerGuid) {
    console.log("ViewMarker(" + markerGuid + ")");
    document.getElementById("markerChartColourInput").value = "";
    document.getElementById("markerIdentifierInput").value = "";
    document.getElementById("markerDescriptionInput").value = "";
    //document.getElementById("markerInput").dataset.marker = "";

    // var markersInput = d3.select("#markersInput");
    // var markerDivs = markersInput.selectAll("div")
    //     .data(markerData)
    //     .enter()
    //     .append("div")
    //     .attr("class", "option")
    //     .append("svg")
    //     .attr("id", "markerSVG")
    //     .attr("data-marker", (d) => d.name) // Add the marker name into the dataset for later retrieval
    //     .attr("width", "140px")
    //     .attr("height", "20px")
    //     .on("click", (d) => { console.log("g -> svg"); handleOptionSelected(d3.event); })
    //     .append("g")
    //     .attr("class", "links")
    //     .attr("transform", "translate(0,0)")  // bit of margin on the left = 40
    //     .on("click", (d) => { console.log("g -> click"); handleOptionSelected(d3.event); });
    //     lineColour = document.getElementById("markerChartColourInput").value;

    //     markerDivs.append('svg:marker')
    //         .attr('id', (d) => { return 'marker_' + d.name; })
    //         .attr('markerHeight', 4)
    //         .attr('markerWidth', 4)
    //         .attr('markerUnits', 'strokeWidth')
    //         .attr('orient', 'auto')
    //         .attr('refX', 5)
    //         .attr('refY', 0)
    //         .attr('viewBox', (d) => { return d.viewbox })
    //         .append('svg:path')
    //         .merge(markerDivs)
    //         .attr('d', (d) => { return d.path })
    //         .attr('fill', (d, i) => { return lineColour });

    //     var drawnlink = markerDivs.append("line")
    //         .attr("stroke", lineColour)
    //         .attr("stroke-width", "4px")
    //         .attr("stroke-cap", "square")
    //         .attr("stroke-dasharray", (patterns[0].dasharray))
    //         .attr('marker-end', function (d, i) { return 'url(#marker_' + d.name + ')' });

        // drawnlink.call((link) => {
        //     link.attr("x1", function (d) { return 0; })
        //         .attr("y1", function (d) { return 10; })
        //         .attr("x2", function (d) { return 140; })
        //         .attr("y2", function (d) { return 10; });
        // });


    if (markerGuid != null) {
        var request = indexedDB.open(dbName, dbVersion);
        request.onsuccess = (event) => {
            var db = event.target.result;
            var tx = db.transaction(["marker"], "readonly");
            var markerStore = tx.objectStore("marker");
            var promises = [];
            Promise.all([new Promise((resolve, reject) => {
                var request = markerStore.get(markerGuid);
                //console.log("marker JSON = " + JSON.stringify(request));
                request.onsuccess = () => { resolve(request.result); }
                request.onerror = () => { console.log("error"); reject(request.error); }
            })]).then((results) => {
                console.log(JSON.stringify(results));
                markerModal.setAttribute("markerGUID", results[0].guid);
                document.getElementById("markerIdentifierInput").value = results[0].identifier;
                document.getElementById("markerDescriptionInput").value = results[0].description;
                document.getElementById("markerChartColourInput").value = results[0].chart_colour;
                document.getElementById("markerChartColourInput").innerhtml = "";
                DrawSelectedMarker("markerTitle", results[0].end_marker_name, 0);
                var markerIcon = document.getElementById("markerIcon");
                //get elements
                // const dropdownTitle = document.querySelector('.dropdown .title');
                // const dropdownOptions = document.querySelectorAll('.dropdown .option');

                // //bind listeners to these elements
                // dropdownTitle.addEventListener('click', toggleMenuDisplay);
                // dropdownOptions.forEach(option => option.addEventListener('click', handleOptionSelected));
                // document.querySelector('.dropdown .title').addEventListener('change', handleTitleChange);

            });
        }
    }
    else
    {
        drawMarkers("markersInput");
    }
    markerModal.style.display = "block";
}
function load_store(store) {
    return new Promise(function (resolve, reject) {
        var request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteMarkerRow(markerGUID) {
    var openDBRequest = indexedDB.open(dbName, dbVersion);
    openDBRequest.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(["marker"], "readwrite");
        transaction.oncomplete = (event) => { console.log("marker written!"); };
        transaction.onerror = (event) => { console.error("error: " + event); };

        var markerObjectStore = transaction.objectStore("marker");
        var deleteRequest = markerObjectStore.delete(markerGUID);
        deleteRequest.onsuccess = (event) => { console.log("deleted"); }
        deleteRequest.onerror = (event) => { console.log("not deleted."); }
        deleteRequest.oncomplete = (event) => { db.close(); }
    }
    openDBRequest.onerror = (event) => { alert("Database error: " + event.target.errorCode); };
    Loadmarkers();
}
// #region How to Create a Dropdown Menu with CSS and JavaScript
/* https://guide.freecodecamp.org/javascript/tutorials/how-to-create-a-dropdown-menu-with-css-and-javascript/ */
function toggleClass(elem, className) {
    if (elem.className.indexOf(className) !== -1) {
        elem.className = elem.className.replace(className, '');
    }
    else {
        elem.className = elem.className.replace(/\s+/g, ' ') + ' ' + className;
    }

    return elem;
}

function toggleDisplay(elem) {
    const curDisplayStyle = elem.style.display;

    if (curDisplayStyle === 'none' || curDisplayStyle === '') {
        elem.style.display = 'block';
    }
    else {
        elem.style.display = 'none';
    }
}


function toggleMenuDisplay(e) {
    // const dropdown = e.currentTarget.parentNode;
    // const menu = dropdown.querySelector('.menu');
    // const icon = dropdown.querySelector('.fa-angle-right');
    const dropdown = document.getElementById("markersDropdown");
    const menu = document.getElementById("markersInput");
    //const icon = document.getElementById('.fa-angle-right');
    const titleElem = document.getElementById("markerTitle");
    const icon = titleElem.querySelector('.fa');

    toggleClass(menu, 'hide');
    toggleClass(menu, 'border');
    toggleClass(icon, 'rotate-90');
}

function handleOptionSelected(e) {
    var node = document.getElementById("markersInput")
    toggleClass(node, 'hide');
    toggleClass(node, 'border');

    const id = node.id;
    const newValue = node.textContent + ' ';
    // toggleClass(e.target.parentNode, 'hide');
    // toggleClass(e.target.parentNode, 'border');

    // const id = e.target.id;
    // const newValue = e.target.textContent + ' ';
    //const titleElem = document.querySelector('.dropdown .title');
    const titleElem = document.getElementById("markerTitle");
    const icon = titleElem.querySelector('.fa');

    //    const icon = document.querySelector('.dropdown .title .fa');


    titleElem.textContent = newValue;
    node.dataset.marker = e.currentTarget.dataset.marker;
    DrawSelectedMarker(titleElem.id, e.currentTarget.dataset.marker);
    titleElem.appendChild(icon);

    //trigger custom event
    titleElem.dispatchEvent(new Event('change'));
    //setTimeout is used so transition is properly shown
    setTimeout(() => toggleClass(icon, 'rotate-90', 0));
}

function DrawSelectedMarker(elemid, marker, guid) {
    const titleElem = document.getElementById("markerTitle");

    console.log("Adding test marker...");
    var svg = d3.select("#" + elemid)
        .append("svg")
        .attr("id", elemid + guid)
        .attr("width", "140px")
        .attr("height", "20px")
        .attr("data-marker", marker)
        .append("g")
        .attr("class", "drawingArea")
        .attr("transform", "translate(0,0)")

        addMarkers(elemid + guid);
        var lineColour = document.getElementById("markerChartColourInput").value;

        var links = [{ source: 0, target: 0 }];
    var drawnlink = svg.attr("class", "links option")
        .selectAll("line")
        .data([{ marker_name: marker}])
        .enter()
        .append("line")
        .attr("stroke", (d, i) => { return "black" })
        .attr("stroke-width", "4px")
        .attr("stroke-cap", "square")
        .attr("stroke-dasharray", (patterns[0].dasharray))
        .attr('marker-end', function (d, i) { return 'url(#marker_' + marker + ')' });

    drawnlink.call((link) => {
        link.attr("x1", function (d) { return 0; })
            .attr("y1", function (d) { return 8; })
            .attr("x2", function (d) { return 140; })
            .attr("y2", function (d) { return 8; });
    });

}
function handleTitleChange(e) {
    const result = document.getElementById('result');
}
// #endregion