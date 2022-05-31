var map;
var overlay;
var selected = null;

markerClusterGroupOptions = {
  chunkedLoading: true,
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: false,
};
var markerClusterOsmosis = L.markerClusterGroup(markerClusterGroupOptions);
var markerClusterPhoenix = L.markerClusterGroup(markerClusterGroupOptions);

var populateNetworks = function (networks) {
  ns = $("#networkSelector");
  for (const [key, value] of Object.entries(networks)) {
    ns.append(`<option value=${key}>${key}</option>`);
    // console.log(`${key}: ${value}`);
  }
  ns.append(`<option value='all' onclick="addNetwork('all')">All networks`);

  networks["osmosis-1"].forEach(function (location) {
    markerClusterOsmosis.addLayer(
      L.marker([location.lat, location.lon], {
        icon: L.icon({
          iconUrl: "js/img/marker-icon-2x.png",
          iconSize: [25, 41],
        }),
        properties: location,
      })
    );
  });

  networks["phoenix-1"].forEach(function (location) {
    markerClusterPhoenix.addLayer(
      L.marker([location.lat, location.lon], {
        icon: L.icon({
          iconUrl: "js/img/marker-icon-2x.png",
          iconSize: [25, 41],
        }),
        properties: location,
      })
    );
  });

  ns.click((evt) => {
    console.log(evt.target.value);
    switch (evt.target.value) {
      case "osmosis-1":
        map.removeLayer(markerClusterPhoenix);
        map.addLayer(markerClusterOsmosis);
        break;
      case "phoenix-1":
        map.removeLayer(markerClusterOsmosis);
        map.addLayer(markerClusterPhoenix);
        break;
      case "all":
        map.removeLayer(markerClusterOsmosis);
        map.removeLayer(markerClusterPhoenix);
        map.addLayer(markerClusterOsmosis);
        map.addLayer(markerClusterPhoenix);
        break;
      default:
        map.removeLayer(markerClusterOsmosis);
        map.removeLayer(markerClusterPhoenix);
        break;
    }
  });

  markerClusterOsmosis.on("click", function (a) {
    console.log("marker " + a.layer);
    try {
      if (selected) {
        selected.getAllChildMarkers();
        markerClusterOsmosis.refreshClusters();
      }
    } catch (e) {
      console.log(e);
      selected.setIcon(
        L.icon({
          iconUrl: "js/img/marker-icon-2x.png",
          iconSize: [25, 41],
        })
      );
    }
    selected = a.layer;
    selected.setIcon(
      L.icon({
        iconUrl: "js/img/marker-icon-2x-selected.png",
        iconSize: [25, 41],
      })
    );

    map.sidebar.show();
    document.getElementsByClassName("singlenodeonly")[0].style.display =
      "block";
    document.getElementById("networkName").innerHTML =
      document.getElementById("networkSelector").value;
    document.getElementById("markerMoniker").innerHTML =
      a.layer.options.properties.moniker;
    document.getElementById("markerID").innerHTML =
      a.layer.options.properties.nodeId;
    document.getElementById("statsFor").innerHTML = "SELECTED NODE";
    document.getElementById("numNodes").innerHTML = ": 1";
  });

  markerClusterPhoenix.on("click", function (a) {
    console.log("marker " + a.layer);try {
      if (selected) {
        selected.getAllChildMarkers();
        markerClusterOsmosis.refreshClusters();
      }
    } catch (e) {
      console.log(e);
      selected.setIcon(
        L.icon({
          iconUrl: "js/img/marker-icon-2x.png",
          iconSize: [25, 41],
        })
      );
    }
    selected = a.layer;
    selected.setIcon(
      L.icon({
        iconUrl: "js/img/marker-icon-2x-selected.png",
        iconSize: [25, 41],
      })
    );
    map.sidebar.show();
    document.getElementsByClassName("singlenodeonly")[0].style.display =
      "block";
    document.getElementById("networkName").innerHTML =
      document.getElementById("networkSelector").value;
    document.getElementById("statsFor").innerHTML = "SELECTED NODE";
    document.getElementById("numNodes").innerHTML = ": 1";
  });

  markerClusterOsmosis.on("clusterclick", function (a) {
    // a.layer is actually a cluster
    try {
      if (selected) {
        selected.getAllChildMarkers();
        markerClusterOsmosis.refreshClusters();
      }
    } catch (e) {
      console.log(e);
      selected.setIcon(
        L.icon({
          iconUrl: "js/img/marker-icon-2x.png",
          iconSize: [25, 41],
        })
      );
    }
    selected = a.layer;
    selected._icon.style.backgroundColor='red';
    map.sidebar.show();
    document.getElementById("networkName").innerHTML =
      document.getElementById("networkSelector").value;
    document.getElementById("statsFor").innerHTML = "SELECTED NODE";
    console.log("cluster " + a.layer.getAllChildMarkers().length);
    document.getElementById("numNodes").innerHTML =
      "S: " + a.layer.getAllChildMarkers().length;
    document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
  });

  markerClusterPhoenix.on("clusterclick", function (a) {
    // a.layer is actually a cluster
    try {
      if (selected) {
        selected.getAllChildMarkers();
        markerClusterOsmosis.refreshClusters();
      }
    } catch (e) {
      console.log(e);
      selected.setIcon(
        L.icon({
          iconUrl: "js/img/marker-icon-2x.png",
          iconSize: [25, 41],
        })
      );
    }
    selected = a.layer;
    
    selected._icon.style.backgroundColor='red';
    map.sidebar.show();
    document.getElementById("networkName").innerHTML =
      document.getElementById("networkSelector").value;
    document.getElementById("statsFor").innerHTML = "SELECTED NODE";
    console.log("cluster " + a.layer.getAllChildMarkers().length);
    document.getElementById("numNodes").innerHTML =
      "S: " + a.layer.getAllChildMarkers().length;
    document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
  });
};

var addOsmosisNetwork = function (network) {
  map.addLayer(markerClusterOsmosis);
};

var addPhoenixNetwork = function (network) {
  map.addLayer(markerClusterPhoenix);
};

function addNetwork(network) {
  console.log(network);
}

$(document).ready(function () {
  map = L.map("map").setView([51.505, -0.09], 13);
  map.setView([51.2, 7], 4);

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "Map data &copy; OpenStreetMap contributors",
  }).addTo(map);

  var sidebar = L.control.sidebar("sidebar", {
    closeButton: true,
    position: "left",
  });
  map.addControl(sidebar);
  map.sidebar = sidebar;

  setTimeout(function () {
    sidebar.show();
  }, 500);

  // var marker = L.marker([51.2, 7]).addTo(map).on('click', function () {
  //     sidebar.toggle();
  // });

  map.on("click", function () {
    // sidebar.hide();
    document.getElementById("statsFor").innerHTML = "WHOLE WORLD";
    document.getElementById("networkName").innerHTML = "ALL NETWORKS";
  });

  sidebar.on("show", function () {
    console.log("Sidebar will be visible.");
  });

  sidebar.on("shown", function () {
    console.log("Sidebar is visible.");
  });

  sidebar.on("hide", function () {
    console.log("Sidebar will be hidden.");
  });

  sidebar.on("hidden", function () {
    console.log("Sidebar is hidden.");
  });

  L.DomEvent.on(sidebar.getCloseButton(), "click", function () {
    console.log("Close button clicked.");
  });

  L.tileLayer.provider("Esri.OceanBasemap").addTo(map);
  $.ajax("data/peers.json", {
    // $.ajax("https://tools.highstakes.ch/geoloc-api/peers", {
    dataType: "json",
    success: populateNetworks,
    error: function (xhr, st, et) {
      console.warn(et);
    },
  });
});
