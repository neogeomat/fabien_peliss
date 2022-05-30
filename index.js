var map;
var overlay;
var poiLayer = L.geoJson();
var markerCluster = L.markerClusterGroup({
	spiderfyOnMaxZoom: false,
	showCoverageOnHover: false,
	zoomToBoundsOnClick: false
});

var populateNetworks = function (networks) {
  ns=$('#networkSelector');
  for (const [key, value] of Object.entries(networks)) {
    ns.append('<option>'+key)
    // console.log(`${key}: ${value}`);
  }

  ns.append('<option>All');
  networks["osmosis-1"].forEach(function (location) {
    poiLayer.addLayer(L.marker([location.lat, location.lon],{
        icon: L.icon({
          'iconUrl': 'js/img/marker-icon-2x.png',
          'iconSize': [25, 41],
        }),
    }));
    markerCluster.addLayer(L.marker([location.lat, location.lon],{
      icon: L.icon({
        'iconUrl': 'js/img/marker-icon-2x.png',
        'iconSize': [25, 41],
      }),
  }));
  });
  // poiLayer.addTo(map);
  map.addLayer(markerCluster);
};

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

  setTimeout(function () {
      sidebar.show();
  }, 500);

  var marker = L.marker([51.2, 7]).addTo(map).on('click', function () {
      sidebar.toggle();
  });

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
