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
  ns.append(`<option value='all' onclick="addNetwork('all')">All networks`);
  for (const [key, value] of Object.entries(networks)) {
    ns.append(`<option value=${key}>${key}</option>`);
    // console.log(`${key}: ${value}`);
  }

  for (const [key, value] of Object.entries(networks)) {
    markerClusterGroups[key] = L.markerClusterGroup(markerClusterGroupOptions);
    networks[key].forEach(function (location) {
      markerClusterGroups[key].addLayer(
        L.marker([location.lat, location.lon], {
          icon: L.BeautifyIcon.icon({
            isAlphaNumericIcon: true,
            text: key.slice(0, 3).toLocaleUpperCase(),
            iconShape: "marker",
            borderColor: "#00ABDC",
            textColor: "#00ABDC",
            innerIconStyle: "margin-top:0;",
          }),
          properties: location,
          belongs_to: key,
        })
      );
    });
    markerClusterGroups[key].name = key;
    markerClusterGroups[key].addTo(map);
  }
  
  var urlLayer = getUrlParam('l', 'all');
  if (urlLayer === 'all') {
    for (const [key, value] of Object.entries(networks)) {
      markerClusterGroups[key].addTo(map);
    }
  } else {
    if(markerClusterGroups.hasOwnProperty(urlLayer)) {
      markerClusterGroups[urlLayer].addTo(map);
    }else{
      alert(`${urlLayer} is not a valid network`);
    }
  }
  
  ns.click((evt) => {
    console.log(evt.target.value);
    switch (evt.target.value) {
      case "osmosis-1":
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name + " removed");
        }
        map.addLayer(markerClusterGroups[evt.target.value]);
        break;
      case "phoenix-1":
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name + " removed");
        }
        map.addLayer(markerClusterGroups[evt.target.value]);
        break;
      case "all":
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name + " removed");
        }
        for (const key in markerClusterGroups) {
          map.addLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name + " added");
        }
        break;
      default:
        for (const key in markerClusterGroups) {
          map.removeLayer(markerClusterGroups[key]);
          console.log(markerClusterGroups[key].name + " removed");
        }
        break;
    }
    updateTable();
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
            L.BeautifyIcon.icon({
              isAlphaNumericIcon: true,
              text: selected.options.belongs_to.slice(0, 3).toLocaleUpperCase(),
              iconShape: "marker",
              borderColor: "#00ABDC",
              textColor: "#00ABDC",
              innerIconStyle: "margin-top:0;",
            })
          );
        }
        selected = a.layer;
        selected.setIcon(
          L.BeautifyIcon.icon({
            isAlphaNumericIcon: true,
            text: selected.options.belongs_to.slice(0, 3).toLocaleUpperCase(),
            iconShape: "marker",
            borderColor: "#red",
            textColor: "red",
            innerIconStyle: "margin-top:0;",
          })
        );

        document.getElementsByClassName("singlenodeonly")[0].style.display =
          "block";
        document.getElementById("networkName").innerHTML =
          markerClusterGroups[key].name;
        document.getElementById("markerMoniker").innerHTML =
          a.layer.options.properties.moniker;
        document.getElementById("markerID").innerHTML =
          a.layer.options.properties.nodeId;
        document.getElementById("statsFor").innerHTML = "SELECTED NODE";
        document.getElementById("numNodes").innerHTML = ": 1";
        updateTable();
        // updateChart();
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
            L.BeautifyIcon.icon({
              isAlphaNumericIcon: true,
              text: selected.options.belongs_to.slice(0, 3).toLocaleUpperCase(),
              iconShape: "marker",
              borderColor: "#00ABDC",
              textColor: "#00ABDC",
              innerIconStyle: "margin-top:0;",
            })
          );
        }
        selected = a.layer;
        selected._icon.style.backgroundColor = "red";
        // map.sidebar.show();
        document.getElementById("networkName").innerHTML =
          markerClusterGroups[key].name;
        document.getElementById("statsFor").innerHTML = "SELECTED NODE";
        console.log("cluster " + a.layer.getAllChildMarkers().length);
        document.getElementById("numNodes").innerHTML =
          a.layer.getAllChildMarkers().length + "'s ";
        document.getElementsByClassName("singlenodeonly")[0].style.display =
          "none";
        updateTable();
        // updateChart();
      });
    }
  }
};
// standard leaflet map setup
$(document).ready(function () {
  map = L.map("map");
  map.setView([51.2, 7], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "Map data &copy; OpenStreetMap contributors",
  }).addTo(map);
  var sidebar = L.control
    .sidebar({ container: "sidebar" })
    .addTo(map)
    .open("home");

  map.on("click", function () {
    // sidebar.hide();
    document.getElementById("statsFor").innerHTML = "WHOLE WORLD";
    document.getElementById("networkName").innerHTML = "ALL NETWORKS";
    if (selected) {
      try {
        markerClusterGroups[selected._group.name].refreshClusters();
      } catch (e) {
        console.log(e);
        selected.setIcon(
          L.BeautifyIcon.icon({
            isAlphaNumericIcon: true,
            text: selected.options.belongs_to.slice(0, 3).toLocaleUpperCase(),
            iconShape: "marker",
            borderColor: "#00ABDC",
            textColor: "#00ABDC",
            innerIconStyle: "margin-top:0;",
          })
        );
      }
      selected = null;
    }
    document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
    var numNodes = 0;
    for (const key in markerClusterGroups) {
      if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
        const element = markerClusterGroups[key];
        numNodes += element.getLayers().length;
      }
    }
    document.getElementById("numNodes").innerHTML = ": " + numNodes;
    updateTable();

    // updateChart();
  });

  $.ajax("data/peers.json", {
    // $.ajax("https://tools.highstakes.ch/geoloc-api/peers", {
    dataType: "json",
    success: populateNetworks,
    error: function (xhr, st, et) {
      console.warn(et);
    },
  });
});

// create the sidebar instance and add it to the map

function updateTable() {
  var sele = document.getElementById("dataSelector");

  if (sele.value) {
    switch (sele.value) {
      case "COUNTRY":
        var countries = {};
        var countriesPro = { Others: 0 };
        if (selected) {
          try {
            selected.getAllChildMarkers().forEach((a) => {
              countries[a.options.properties.country] =
                countries[a.options.properties.country] + 1 || 1;
            });
            console.table(countries);
          } catch (e) {
            if (e instanceof TypeError) {
              countries[selected.options.properties.country] = 1;
            }
            console.table(countries);
          }
        } else {
          for (const key in markerClusterGroups) {
            if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
              const element = markerClusterGroups[key];
              element.getLayers().forEach((a) => {
                countries[a.options.properties.country] =
                  countries[a.options.properties.country] + 1 || 1;
              });
            }
          }
        }
        var countriesSorted = Object.keys(countries).sort(
          (a, b) => countries[b] - countries[a]
        );
        var countriesSum = Object.values(countries).reduce((a, b) => a + b, 0);
        console.log(countriesSum);
        countriesSorted.reduce((a, b) => {
          if (a > 0.98 * countriesSum) {
            countriesPro["Others"] =
              countriesPro["Others"] + countries[b] || countries[b];
            return a + countries[b];
          } else {
            countriesPro[b] = countries[b];
            return a + countries[b];
          }
        }, 0);
        if ($.fn.dataTable.isDataTable("#dataTable")) {
          console.log("table exists");
          $("#dataTable").DataTable().destroy();
        }
        $("#dataTable").DataTable({
          dom: "itp",
          searching: false,
          data: Object.entries(countriesPro),
          columns: [{ title: "COUNTRY" }, { title: "NODES" }],
          order: [[1, "desc"]],
        });
        break;
      case "ISP":
        var ISPs = {};
        var ISPsPro = { Others: 0 };
        if (selected) {
          try {
            selected.getAllChildMarkers().forEach((a) => {
              ISPs[a.options.properties.isp] =
                ISPs[a.options.properties.isp] + 1 || 1;
            });
            console.table(ISPs);
          } catch (e) {
            if (e instanceof TypeError) {
              ISPs[selected.options.properties.isp] = 1;
            }
            console.table(ISPs);
          }
        } else {
          for (const key in markerClusterGroups) {
            if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
              const element = markerClusterGroups[key];
              element.getLayers().forEach((a) => {
                ISPs[a.options.properties.isp] =
                  ISPs[a.options.properties.isp] + 1 || 1;
              });
            }
          }
        }
        var ISPsSorted = Object.keys(ISPs).sort((a, b) => ISPs[b] - ISPs[a]);
        var ISPSum = Object.values(ISPs).reduce((a, b) => a + b, 0);
        console.log(ISPSum);
        ISPsSorted.reduce((a, b) => {
          if (a > 0.98 * ISPSum) {
            ISPsPro["Others"] = ISPsPro["Others"] + ISPs[b] || ISPs[b];
            return a + ISPs[b];
          } else {
            ISPsPro[b] = ISPs[b];
            return a + ISPs[b];
          }
        }, 0);
        if ($.fn.dataTable.isDataTable("#dataTable")) {
          console.log("table exists");
          $("#dataTable").DataTable().destroy();
        }
        $("#dataTable").DataTable({
          dom: "itp",
          searching: false,
          data: Object.entries(ISPsPro),
          columns: [{ title: "ISP" }, { title: "NODES" }],
          order: [[1, "desc"]],
        });
        break;
      case "DATA CENTER":
        var DCS = {};
        var DCSPro = { Others: 0 };
        if (selected) {
          try {
            selected.getAllChildMarkers().forEach((a) => {
              DCS[a.options.properties.as] =
                DCS[a.options.properties.as] + 1 || 1;
            });
            console.table(DCS);
          } catch (e) {
            if (e instanceof TypeError) {
              DCS[selected.options.properties.as] = 1;
            }
            console.table(DCS);
          }
        } else {
          for (const key in markerClusterGroups) {
            if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
              const element = markerClusterGroups[key];
              element.getLayers().forEach((a) => {
                DCS[a.options.properties.as] =
                  DCS[a.options.properties.as] + 1 || 1;
              });
            }
          }
        }
        var DCSSorted = Object.keys(DCS).sort((a, b) => DCS[b] - DCS[a]);
        var DCSSum = Object.values(DCS).reduce((a, b) => a + b, 0);
        console.log(DCSSum);
        DCSSorted.reduce((a, b) => {
          if (a > 0.98 * DCSSum) {
            DCSPro["Others"] = DCSPro["Others"] + DCS[b] || DCS[b];
            return a + DCS[b];
          } else {
            DCSPro[b] = DCS[b];
            return a + DCS[b];
          }
        }, 0);
        if ($.fn.dataTable.isDataTable("#dataTable")) {
          console.log("table exists");
          $("#dataTable").DataTable().destroy();
        }
        $("#dataTable").DataTable({
          dom: "itp",
          searching: false,
          data: Object.entries(DCS),
          columns: [{ title: "DATA CENTER" }, { title: "NODES" }],
        });
        break;
    }
  }
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
function getUrlParam(parameter, defaultvalue) {
  var urlparameter = defaultvalue;
  if (window.location.href.indexOf(parameter) > -1) {
    urlparameter = getUrlVars()[parameter];
  }
  console.log(urlparameter);
  if (urlparameter !== undefined) {
    return urlparameter;
  } else {
    return defaultvalue;
  }
}