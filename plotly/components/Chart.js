var index = 0;

function createElement(containerId) {
    var containersDiv = document.getElementById(containerId);
    // create a new div element
    var newDiv = document.createElement("div");
    newDiv.id = "chart-container" + index++;
    containersDiv.appendChild(newDiv);
    return newDiv.id;
}

function param(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
    return undefined;
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "text";
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
}

function importJson(url) {
    return new Promise((resolve, reject) => {
            getJSON(url, (status, model) => {
                if (status === null) {
                    resolve(model);
                } else {
                    let err = new Error("error fetchin json from url: ");
                    reject(err); // reject
                }
            });
        }
    );
}


function fetchTheme(url) {
    return importJson(url);
}

function fetchTraces(links) {
    let traces = [];
    let count = links.length;

    return new Promise((resolve, reject) => {
        links.forEach((element) => {
            console.log("import: " + element);
            importJson(element).then(model => {
                console.log(model);
                traces.push(model);
                if ((count = count - 1) <= 0) {
                    resolve(traces);
                }
            }, err => {
                if ((count = count - 1) <= 0) {
                    resolve(traces);
                }
            });
        });
    });
}

function createChart(containerId, url) {
    if (!url) {
        if (param('url')) {
            url = param('url');
        } else {
            console.log("url param is not provided and not found in query string");
        }
    }
    importJson(url).then(charts => {
        fetchTheme("../components/DarkTheme.json").then((layout1) => {
            charts.forEach(chart => {
                layout1.title.text = chart.chartTitleText;
                layout1.xaxis.title.text = chart.xAxisText;
                layout1.yaxis.title.text = chart.yAxisText;
                new LineChart(createElement(containerId), fetchTraces(chart.traces), layout1);
            });
        });
    });
}