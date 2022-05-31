var map;
var overlay;
var selected = null;

markerClusterGroupOptions = {
  chunkedLoading: true,
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: false,
};

var markerClusterGroups = {};
var markerClusterOsmosis = L.markerClusterGroup(markerClusterGroupOptions);

var markerClusterPhoenix = L.markerClusterGroup(markerClusterGroupOptions);

var populateNetworks = function (networks) {
  ns = $("#networkSelector");
  for (const [key, value] of Object.entries(networks)) {
    ns.append(`<option value=${key}>${key}</option>`);
    // console.log(`${key}: ${value}`);
  }
  ns.append(`<option value='all' onclick="addNetwork('all')">All networks`);

  for (const [key, value] of Object.entries(networks)) {
    markerClusterGroups[key] = L.markerClusterGroup(markerClusterGroupOptions);
    networks[key].forEach(function (location) {
      markerClusterGroups[key].addLayer(
        L.marker([location.lat, location.lon], {
          icon: L.icon({
            iconUrl: "js/img/marker-icon-2x.png",
            iconSize: [25, 41],
          }),
          properties: location,
        })
      );
    });
    markerClusterGroups[key].name = key;
  }

  ns.click((evt) => {
    console.log(evt.target.value);
    switch (evt.target.value) {
      case "osmosis-1":
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name+' removed');
        };
        map.addLayer(markerClusterGroups[evt.target.value]);
        break;
      case "phoenix-1":
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name+' removed');
        };
        map.addLayer(markerClusterGroups[evt.target.value]);
        break;
      case "all":
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name+' removed');
        };
        for (const key in markerClusterGroups) {
          map.addLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name+' added');
        };
        break;
      default:
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name+' removed');
        };
        break;
    }
  });

  // click handlings
  for (const key in markerClusterGroups) {
    if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
      const element = markerClusterGroups[key];
      // yakchau marker pinta
      markerClusterGroups[key].on("click", function (a) {
        console.log("marker " + a.layer);
        try {
          if (selected) {
            selected.getAllChildMarkers();
            markerClusterGroups[key].refreshClusters();
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
          markerClusterOsmosis.name;
        document.getElementById("markerMoniker").innerHTML =
          a.layer.options.properties.moniker;
        document.getElementById("markerID").innerHTML =
          a.layer.options.properties.nodeId;
        document.getElementById("statsFor").innerHTML = "SELECTED NODE";
        document.getElementById("numNodes").innerHTML = ": 1";
        updateTable();
        updateChart();
      });

      // sagolyau marker pinta
      markerClusterGroups[key].on("clusterclick", function (a) {
      // a.layer is actually a cluster
        try {
          if (selected) {
            selected.getAllChildMarkers();
            markerClusterGroups[key].refreshClusters();
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
        selected._icon.style.backgroundColor = "red";
        map.sidebar.show();
        document.getElementById("networkName").innerHTML =
          markerClusterOsmosis.name;
        document.getElementById("statsFor").innerHTML = "SELECTED NODE";
        console.log("cluster " + a.layer.getAllChildMarkers().length);
        document.getElementById("numNodes").innerHTML =
          "S: " + a.layer.getAllChildMarkers().length;
        document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
        updateTable();
        updateChart();
      });
    }   
  }
  // markerClusterOsmosis.on("click", function (a) {
  //   console.log("marker " + a.layer);
  //   try {
  //     if (selected) {
  //       selected.getAllChildMarkers();
  //       markerClusterOsmosis.refreshClusters();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     selected.setIcon(
  //       L.icon({
  //         iconUrl: "js/img/marker-icon-2x.png",
  //         iconSize: [25, 41],
  //       })
  //     );
  //   }
  //   selected = a.layer;
  //   selected.setIcon(
  //     L.icon({
  //       iconUrl: "js/img/marker-icon-2x-selected.png",
  //       iconSize: [25, 41],
  //     })
  //   );

  //   map.sidebar.show();
  //   document.getElementsByClassName("singlenodeonly")[0].style.display =
  //     "block";
  //   document.getElementById("networkName").innerHTML =
  //     markerClusterOsmosis.name;
  //   document.getElementById("markerMoniker").innerHTML =
  //     a.layer.options.properties.moniker;
  //   document.getElementById("markerID").innerHTML =
  //     a.layer.options.properties.nodeId;
  //   document.getElementById("statsFor").innerHTML = "SELECTED NODE";
  //   document.getElementById("numNodes").innerHTML = ": 1";
  // });

  // markerClusterPhoenix.on("click", function (a) {
  //   console.log("marker " + a.layer);
  //   try {
  //     if (selected) {
  //       selected.getAllChildMarkers();
  //       markerClusterOsmosis.refreshClusters();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     selected.setIcon(
  //       L.icon({
  //         iconUrl: "js/img/marker-icon-2x.png",
  //         iconSize: [25, 41],
  //       })
  //     );
  //   }
  //   selected = a.layer;
  //   selected.setIcon(
  //     L.icon({
  //       iconUrl: "js/img/marker-icon-2x-selected.png",
  //       iconSize: [25, 41],
  //     })
  //   );
  //   map.sidebar.show();
  //   document.getElementsByClassName("singlenodeonly")[0].style.display =
  //     "block";
  //   document.getElementById("networkName").innerHTML =
  //     markerClusterPhoenix.name;
  //   document.getElementById("statsFor").innerHTML = "SELECTED NODE";
  //   document.getElementById("numNodes").innerHTML = ": 1";
  // });

  // markerClusterOsmosis.on("clusterclick", function (a) {
  //   // a.layer is actually a cluster
  //   try {
  //     if (selected) {
  //       selected.getAllChildMarkers();
  //       markerClusterOsmosis.refreshClusters();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     selected.setIcon(
  //       L.icon({
  //         iconUrl: "js/img/marker-icon-2x.png",
  //         iconSize: [25, 41],
  //       })
  //     );
  //   }
  //   selected = a.layer;
  //   selected._icon.style.backgroundColor = "red";
  //   map.sidebar.show();
  //   document.getElementById("networkName").innerHTML =
  //     markerClusterOsmosis.name;
  //   document.getElementById("statsFor").innerHTML = "SELECTED NODE";
  //   console.log("cluster " + a.layer.getAllChildMarkers().length);
  //   document.getElementById("numNodes").innerHTML =
  //     "S: " + a.layer.getAllChildMarkers().length;
  //   document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
  // });

  // markerClusterPhoenix.on("clusterclick", function (a) {
  //   // a.layer is actually a cluster
  //   try {
  //     if (selected) {
  //       selected.getAllChildMarkers();
  //       markerClusterOsmosis.refreshClusters();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     selected.setIcon(
  //       L.icon({
  //         iconUrl: "js/img/marker-icon-2x.png",
  //         iconSize: [25, 41],
  //       })
  //     );
  //   }
  //   selected = a.layer;

  //   selected._icon.style.backgroundColor = "red";
  //   map.sidebar.show();
  //   document.getElementById("networkName").innerHTML =
  //     markerClusterPhoenix.name;
  //   document.getElementById("statsFor").innerHTML = "SELECTED NODE";
  //   console.log("cluster " + a.layer.getAllChildMarkers().length);
  //   document.getElementById("numNodes").innerHTML =
  //     "S: " + a.layer.getAllChildMarkers().length;
  //   document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
  // });
};

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
    selected = null;
    updateTable();
    updateChart();
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

function updateTable(){
  var table = document.getElementById("dataTable");
  table.innerHTML = "";
  var table_header_row = document.createElement("tr");
  var table_header_col1 = document.createElement("th");

  var sele = document.getElementById("dataSelector");
  table_header_col1.innerHTML = sele.value;
  var table_header_col2 = document.createElement("th");
  table_header_col2.innerHTML = "Nodes";

  table_header_row.appendChild(table_header_col1);
  table_header_row.appendChild(table_header_col2);
  table.appendChild(table_header_row);
  if(sele.value){
    switch(sele.value){
      case "COUNTRY":
        if(selected){
          try{
            var countries = {};
            selected.getAllChildMarkers().forEach(a => {
              // console.log(a);
              countries[a.options.properties.country] = countries[a.options.properties.country] + 1 || 1;
            });
            console.table(countries);
          }catch(e){
            // console.error(e);
            // console.log(selected);
            if (e instanceof TypeError) {
              var countries = {};
              countries[selected.options.properties.country] = 1;
            }
            console.table(countries);
          }
        }else{
          var countries = {};
          for (const key in markerClusterGroups) {
            if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
              const element = markerClusterGroups[key];
              element.getLayers().forEach(a => {
                countries[a.options.properties.country] = countries[a.options.properties.country] + 1 || 1;
              });
            }
          }
        }
        for(var key in countries){
          var table_row = document.createElement("tr");
          var table_col1 = document.createElement("td");
          table_col1.innerHTML = key;
          var table_col2 = document.createElement("td");
          table_col2.innerHTML = countries[key];
          table_row.appendChild(table_col1);
          table_row.appendChild(table_col2);
          table.appendChild(table_row);
        }
        break;
      case "ISP":
        if(selected){
          try{
            var ISPs = {};
            selected.getAllChildMarkers().forEach(a => {
             // console.log(a);
              ISPs[a.options.properties.isp] = ISPs[a.options.properties.isp] + 1 || 1;
            });
           console.table(ISPs);
          }catch(e){
            // console.error(e);
            // console.log(selected);
            if (e instanceof TypeError) {
              var ISPs = {};
              ISPs[selected.options.properties.isp] = 1;
            }
            console.table(ISPs);
          }
        }else{
          var ISPs = {};
          for (const key in markerClusterGroups) {
            if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
              const element = markerClusterGroups[key];
              element.getLayers().forEach(a => {
                ISPs[a.options.properties.isp] = ISPs[a.options.properties.isp] + 1 || 1;
              });
            }
          }
        }
        for(var key in ISPs){
          var table_row = document.createElement("tr");
          var table_col1 = document.createElement("td");
          table_col1.innerHTML = key;
          var table_col2 = document.createElement("td");
          table_col2.innerHTML = ISPs[key];
          table_row.appendChild(table_col1);
          table_row.appendChild(table_col2);
          table.appendChild(table_row);
        }
        break;
      case "DATA CENTER":
        break;
    };
  }
}

function updateChart(){

}
