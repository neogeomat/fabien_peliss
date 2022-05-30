var map;
var overlay;

markerClusterGroupOptions = {
  spiderfyOnMaxZoom: true,
	showCoverageOnHover: false,
	zoomToBoundsOnClick: false
};
var markerClusterOsmosis = L.markerClusterGroup(markerClusterGroupOptions);
var markerClusterPhoenix = L.markerClusterGroup(markerClusterGroupOptions);

var populateNetworks = function (networks) {
  ns=$('#networkSelector');
  for (const [key, value] of Object.entries(networks)) {
    ns.append(`<option value=${key}>${key}</option>`);
    // console.log(`${key}: ${value}`);
  }
  ns.append(`<option value='all' onclick="addNetwork('all')">All`);

  networks["osmosis-1"].forEach(function (location) {
    markerClusterOsmosis.addLayer(L.marker([location.lat, location.lon],{
      icon: L.icon({
        'iconUrl': 'js/img/marker-icon-2x.png',
        'iconSize': [25, 41],
      }),
      properties:location,
    }));
  });

  networks["phoenix-1"].forEach(function (location) {
    markerClusterPhoenix.addLayer(L.marker([location.lat, location.lon],{
      icon: L.icon({
        'iconUrl': 'js/img/marker-icon-2x.png',
        'iconSize': [25, 41],
      }),
      properties:location,
    }));
  });

  ns.click(evt=>{
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

  markerClusterOsmosis.on('click', function (a) {
    console.log('marker ' + a.layer);
    map.sidebar.show();
    document.getElementById('networkName').innerHTML = document.getElementById('networkSelector').value;
  });

  markerClusterPhoenix.on('click', function (a) {
    console.log('marker ' + a.layer);
    map.sidebar.show();
    document.getElementById('networkName').innerHTML = document.getElementById('networkSelector').value;
  });

  markerClusterOsmosis.on('clusterclick', function (a) {
    // a.layer is actually a cluster
    console.log('cluster ' + a.layer.getAllChildMarkers().length);
    map.sidebar.show();
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

  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; OpenStreetMap contributors'
  }).addTo(map);

  var sidebar = L.control.sidebar('sidebar', {
      closeButton: true,
      position: 'left'
  });
  map.addControl(sidebar);
  map.sidebar = sidebar;

  setTimeout(function () {
      sidebar.show();
  }, 500);

  // var marker = L.marker([51.2, 7]).addTo(map).on('click', function () {
  //     sidebar.toggle();
  // });

  map.on('click', function () {
      sidebar.hide();
  })

  sidebar.on('show', function () {
      console.log('Sidebar will be visible.');
  });

  sidebar.on('shown', function () {
      console.log('Sidebar is visible.');
  });

  sidebar.on('hide', function () {
      console.log('Sidebar will be hidden.');
  });

  sidebar.on('hidden', function () {
      console.log('Sidebar is hidden.');
  });

  L.DomEvent.on(sidebar.getCloseButton(), 'click', function () {
      console.log('Close button clicked.');
  });

  L.tileLayer.provider('Esri.OceanBasemap').addTo(map);
  $.ajax("data/peers.json", {
    dataType: "json",
    success: populateNetworks,
    error: function (xhr, st, et) {
      console.warn(et);
    },
  });
});
