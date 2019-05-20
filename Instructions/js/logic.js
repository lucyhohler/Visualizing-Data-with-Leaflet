//create a satellite tile layer
var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

//create a light tile layer
var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

//create an outdoors tile layer
var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

//create a map centered on the United States
var myMap = L.map("map-id", {
    center: [44.97, -103.77],
    zoom: 4,
    layers: [satellitemap]
});

//create a baseMaps object
var baseMaps = {
    "Satellite": satellitemap,
    "Light": lightmap,
    "Outdoors": outdoormap
};

//create a layer control
var controlLayers = L.control.layers(baseMaps, {}, {collapsed: false}).addTo(myMap);

//Function to create marker size for earthquakes
function calcRadius(magnitude) {
    return (magnitude/5) * 20;
}

//colors for circles
var colors = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"];

//function to return color of circle
function circleColor(magnitude) {
    if (magnitude < 1) {
        return colors[0];
    }
    else if (magnitude < 2) {
        return colors[1];
    }
    else if (magnitude < 3) {
        return colors[2];
    }
    else if (magnitude < 4) {
        return colors[3];
    }
    else if (magnitude < 5) {
        return colors[4];
    }
    else {
        return colors[5];
    }
}

//circles to represent earthquakes

//Link to erform an API call to the United States Geological Survey to get GeoJSON records
//for all earthquakes in the last seven days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//access the url and create layer
d3.json(url, function(response) {
    console.log(response);
    geoEarthquakes = L.geoJSON(response, {
        pointToLayer: function(feature) {
            return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                fillColor: circleColor(+feature.properties.mag),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                radius: calcRadius(+feature.properties.mag)
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<p><h3>" + feature.properties.place + "</h3></p><p><h3>Magnitude: " + feature.properties.mag + "</h3></p>");
        }
    }).addTo(myMap);
    
    controlLayers.addOverlay(geoEarthquakes, "Earthquakes");
});  

//console.log(geoEarthquakes);

//plate tectonics
//Link to perform a call to the github repo to get tectonic plate boundaries
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

//access data and create layer
d3.json(url2, function(response) {
    //create geoJSON layer and add to map
    geoPlates = L.geoJSON(response, {
        style: {
            color: "orange",
            weight: 2,
            opacity: 1
        }
    }).addTo(myMap);

    //add as an overlay map
    controlLayers.addOverlay(geoPlates, "Tectonic Plates");
});

//set up the legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function() {
    //create a legend element
    var div = L.DomUtil.create('div', 'info legend');

    //create labels and values to find colors
    var labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var grades = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

    //create legend html
    div.innerHTML = '<div><strong>Legend</strong></div>';
    for(var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style = "background: ' + circleColor(grades[i]) + '">&nbsp;</i>&nbsp;&nbsp;'
        + labels[i] + '<br/>';
    };
    return div;
};
//add legend to map
legend.addTo(myMap);