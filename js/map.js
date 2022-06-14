var map;
var overlay;
var selected = null;
var mychart;

markerClusterGroupOptions = {
  chunkedLoading: true,
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: false,
  iconCreateFunction: function (cluster) {
    var childCount = cluster.getChildCount();
    var c = " marker-cluster-";
    if (childCount < 10) {
      c += "small";
    } else if (childCount < 50) {
      c += "medium";
    }
    else {
      c += "large";
    }
    return new L.DivIcon({
      html: '<div><span>' + childCount + '</span></div>',
      className: 'marker-cluster' + c,
      iconSize: new L.Point(40, 40)
    });
  }

};

var markerClusterGroups = {};
var markerClusterOsmosis = L.markerClusterGroup(markerClusterGroupOptions);

var markerClusterPhoenix = L.markerClusterGroup(markerClusterGroupOptions);
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function getnumberofcolors(num) {
  var colors = [];
  for (var i = 0; i < num; i++) {
    colors.push(getRandomColor());
  }
  return colors;
}
var populateNetworks = function (networks) {
  ns = $("#networkSelector");
  ns.append(`<option value='all' onchange="addNetwork('all')">All networks`);
  for (const [key, value] of Object.entries(networks)) {
    ns.append(`<option value=${key}>${key}</option>`);
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
  }

  var urlLayer = getUrlParam("n");
  if (urlLayer === "all" || urlLayer === undefined) {
    for (const [key, value] of Object.entries(networks)) {
      markerClusterGroups[key].addTo(map);
      if (urlLayer === "all") {
        document.getElementById("networkSelector").value = "ALL NETWORKS";
      }
      updateTable();
    }
  } else {
    if (markerClusterGroups.hasOwnProperty(urlLayer)) {
      markerClusterGroups[urlLayer].addTo(map);
      document.getElementById("networkSelector").value =
        urlLayer.toLocaleUpperCase();
      updateTable();
    } else {
      alert(`${urlLayer} is not a valid network`);
    }
  }

  ns.change((evt) => {
    evt.stopPropagation();

    if (evt.target.value === "all") {
      for (const [key, value] of Object.entries(networks)) {
        markerClusterGroups[key].addTo(map);
      }
      updateTable();
    } else {
      for (const [key, value] of Object.entries(networks)) {
        markerClusterGroups[key].removeFrom(map);
      }
      markerClusterGroups[evt.target.value].addTo(map);
      updateTable();
    }
  });

  // click handlings
  for (const key in markerClusterGroups) {
    if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
      const element = markerClusterGroups[key];
      // yakchau marker pinta
      markerClusterGroups[key].on("click", function (a) {
        try {
          if (selected) {
            selected.getAllChildMarkers();
            markerClusterGroups[selected._group.name].refreshClusters();
          }
        } catch (e) {
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

        
        document.getElementById("networkName").innerHTML =
          markerClusterGroups[key].name.toLocaleUpperCase();
        document.getElementsByClassName("singlenodeonly")[0].style.display =
          "block";
        document.getElementById("markerMoniker").innerHTML =
          a.layer.options.properties.moniker;
        document.getElementById("markerID").innerHTML =
          a.layer.options.properties.nodeId;
        document.getElementById("plural").innerHTML = " ";
        document.getElementById("statsFor").innerHTML = " SELECTED PIN";
        document.getElementById("numNodes").innerHTML = ": 1";
        updateTable();
      });

      // sagolyau marker pinta
      markerClusterGroups[key].on("clusterclick", function (a) {
        // a.layer is actually a cluster
        try {
          if (selected) {
            selected.getAllChildMarkers();
            markerClusterGroups[selected._group.name].refreshClusters();
          }
        } catch (e) {
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
        document.getElementById("networkName").innerHTML =
          markerClusterGroups[key].name.toLocaleUpperCase();
        document.getElementById("statsFor").innerHTML = " SELECTED PINS";

        document.getElementById("plural").innerHTML = "S";
        document.getElementById("numNodes").innerHTML =
          ":" + a.layer.getAllChildMarkers().length;
        document.getElementsByClassName("singlenodeonly")[0].style.display =
          "none";
        updateTable();
      });
    }
  }
  updateTable();
  map.spin(false);
};
// standard leaflet map setup
$(document).ready(function () {
  document.getElementsByClassName("singlenodeonly")[0].style.display = "none";
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

  map.on("click", function (evt) {
    document.getElementById("statsFor").innerHTML = " WHOLE WORLD:";
    document.getElementById("networkName").innerHTML = "ALL NETWORKS";
    document.getElementById("plural").innerHTML = "S";
    if (selected) {
      try {
        markerClusterGroups[selected._group.name].refreshClusters();
      } catch (e) {
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
  });
  map.spin(true);
  // $.ajax("data/peers.json", {
  $.ajax("https://tools.highstakes.ch/geoloc-api/peers", {
    dataType: "json",
    method: "GET",
    success: populateNetworks,
    error: function (xhr, st, et) {
      map.spin(false);
    },
  });

  //-------------
  //- PIE CHART -
  //-------------
  // Get context with jQuery - using jQuery's .get() method.
  var donutData;
  var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
  var pieData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        angle:[],
        rotation:[],
      },
    ],
  };
  var pieOptions = {
    rotation: (0.5 * Math.PI) - (30/180 * Math.PI),
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      display: false,
    },
    align:'end',
    plugins: {
      // labels: [
      //   {
      //     // render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
      //     render: function (args) {
      //       // args will be something like:
      //       // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
      //       return args.percentage + "%";

      //       // return object if it is image
      //       // return { src: 'image.png', width: 16, height: 16 };
      //     },

      //     // precision for percentage, default is 0
      //     precision: 0,

      //     // identifies whether or not labels of value 0 are displayed, default is false
      //     showZero: false,

      //     // font size, default is defaultFontSize
      //     fontSize: 12,

      //     // font color, can be color array for each data or function for dynamic color, default is defaultFontColor
      //     fontColor: "#000",

      //     // font style, default is defaultFontStyle
      //     fontStyle: "normal",

      //     // font family, default is defaultFontFamily
      //     fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

      //     // draw text shadows under labels, default is false
      //     textShadow: true,

      //     // text shadow intensity, default is 6
      //     shadowBlur: 10,

      //     // text shadow X offset, default is 3
      //     shadowOffsetX: -5,

      //     // text shadow Y offset, default is 3
      //     shadowOffsetY: 5,

      //     // text shadow color, default is 'rgba(0,0,0,0.3)'
      //     shadowColor: "rgba(0,0,0,0.3)",

      //     // draw label in arc, default is false
      //     // bar chart ignores this
      //     arc: false,

      //     // position to draw label, available value is 'default', 'border' and 'outside'
      //     // bar chart ignores this
      //     // default is 'default'
      //     position: "default",

      //     // draw label even it's overlap, default is true
      //     // bar chart ignores this
      //     overlap: false,

      //     // show the real calculated percentages from the values and don't apply the additional logic to fit the percentages to 100 in total, default is false
      //     showActualPercentages: true,

      //     // set images when `render` is 'image'
      //     images: [
      //       {
      //         src: "image.png",
      //         width: 16,
      //         height: 16,
      //       },
      //     ],

      //     // add padding when position is `outside`
      //     // default is 2
      //     outsidePadding: 4,

      //     // add margin of text when position is `outside` or `border`
      //     // default is 2
      //     textMargin: 4,
      //   },
      //   {
      //     render: "label",
      //     position: "outside",
      //     arc: false,
      //     // overlap: false,
      //     showZero: false,
      //   },
      // ],
      datalabels: {
        // backgroundColor: 'white',
        // display:'auto',
        // borderRadius: 10,
        // borderWidth: 3,
        borderDashOffset: 20,
        color: "black",
        // backgroundColor: function (context) {
        //   return context.dataset.backgroundColor;
        // },
        font: {
          resizable: true,
          minSize: 12,
          maxSize: 18
        },
        textAlign: 'center',
        formatter: function(value, ctx) {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.map(data => {
                sum += data;
            });
            let percentage = (value*100 / sum).toFixed(0)+"%";
            // return percentage;
            const angle = ctx.dataset.angle[ctx.dataIndex];
            var sele = document.getElementById("dataSelector");
            if(sele.value == "COUNTRY"){
              if(angle > 45){
                return `${ctx.chart.data.labels[ctx.dataIndex].replace(' ','\n').replace(',','\n')} \n ${percentage}`;
              }else{
                return ``;
              }
            }else{
              return ``;
            }
            
        },
        rotation: function(ctx) {
          // computed in text

          // const valuesBefore = ctx.dataset.data.slice(0, ctx.dataIndex).reduce((a, b) => a + b, 0);
          // const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
          // const rotation = ((valuesBefore + ctx.dataset.data[ctx.dataIndex] /2) /sum *360);
          // const angle = ctx.dataset.data[ctx.dataIndex] /sum *360;
          const angle = ctx.dataset.angle[ctx.dataIndex];
          const rotation = ctx.dataset.angle[ctx.dataIndex];
          // ctx.dataset.angle[ctx.dataIndex] = angle;
          // console.log("angle", angle);
          if(angle > 45) {
            return 0;
          }else{
          return rotation < 180 ? rotation-90 : rotation+90;
          }
        },
        padding: {
          left:50,
        }
      },
      outlabels: {
        // text: '%l PER => %p \n VAL => %v',
        color: '#462D26',
        stretch: 45,
        font: {
            resizable: true,
            minSize: 12,
            maxSize: 18
        },
        lineWidth:1,
        // stretch:10,
        // textAlign:'center',
        text:function(ctx) {
          // console.log("text", ctx.labels);
          const valuesBefore = ctx.dataset.data.slice(0, ctx.dataIndex).reduce((a, b) => a + b, 0);
          const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const rotation = ((valuesBefore + ctx.dataset.data[ctx.dataIndex] /2) /sum *360);
          const angle = ctx.dataset.data[ctx.dataIndex] /sum *360;
          ctx.dataset.angle[ctx.dataIndex] = angle;
          ctx.dataset.rotation[ctx.dataIndex] = rotation;
          var sele = document.getElementById("dataSelector");
          if(sele.value=='COUNTRY'){
            if(angle > 45){
              return "";
            }else{
              console.log(ctx.labels[ctx.dataIndex]);
              return ctx.labels[ctx.dataIndex].replace(' ','\n').replace(',','\n');
            }
          }else{
            return ctx.labels[ctx.dataIndex].replace(' ','\n').replace(',','\n');
          }
        },
      }
    },
  };
  //Create pie or douhnut chart
  // You can switch between pie and douhnut using the method below.
  mychart = new Chart(pieChartCanvas, {
    plugins: [ChartDataLabels],
    type: "outlabeledPie",
    data: pieData,
    options: pieOptions,
  });

});

// create the sidebar instance and add it to the map

function updateTable() {
  var sele = document.getElementById("dataSelector");
  var network = document.getElementById("networkSelector").value;

  if (!network) {
    if (!selected) {
      document.getElementById("networkName").innerHTML = "ALL NETWORKS";
      document.getElementById("statsFor").innerHTML = " WHOLE WORLD";
      document.getElementById("plural").innerHTML = "S";
      document.getElementsByClassName("singlenodeonly")[0].style.display =
        "none";
      var numNodes = 0;
      for (const key in markerClusterGroups) {
        if (Object.hasOwnProperty.call(markerClusterGroups, key)) {
          const element = markerClusterGroups[key];
          numNodes += element.getLayers().length;
        }
      }
      document.getElementById("numNodes").innerHTML = ": " + numNodes;
    }
  }

  // debugger;
  if (sele.value) {
    switch (sele.value) {
      case "COUNTRY":
        var countries = {};
        var countriesPro = {};
        var countriesOthers = 0;
        if (selected) {
          try {
            selected.getAllChildMarkers().forEach((a) => {
              countries[a.options.properties.country] =
                countries[a.options.properties.country] + 1 || 1;
            });
          } catch (e) {
            if (e instanceof TypeError) {
              countries[selected.options.properties.country] = 1;
            }
          }
        } else {
          if (network && network != "all") {
            const element = markerClusterGroups[network];
            element.getLayers().forEach((a) => {
              countries[a.options.properties.country] =
                countries[a.options.properties.country] + 1 || 1;
            });
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
        }
        var countriesSorted = Object.keys(countries).sort(
          (a, b) => countries[b] - countries[a]
        );
        var countriesSum = Object.values(countries).reduce((a, b) => a + b, 0);

        var countriesThreshold = countriesSum * 0.02;
        countriesSorted.reduce((a, b) => {
          if (countries[b] < 0.02 * countriesSum) {
            countriesOthers = countriesOthers + countries[b] || countries[b];
            return a + countries[b];
          } else {
            countriesPro[b] = countries[b];
            return a + countries[b];
          }
        }, 0);
        if (countriesOthers > 0) {
          countriesPro["Others"] = countriesOthers;
        }
        // debugger;
        // if (network && network != "all") {
        //   document.getElementById("networkName").innerHTML =
        //     network.toLocaleUpperCase();
        // } else {
        //   document.getElementById("networkName").innerHTML = "ALL NETWORKS";
        // }
        // document.getElementById("numNodes").innerHTML = countriesSum;
        if ($.fn.dataTable.isDataTable("#dataTable")) {
          //
          $("#dataTable").DataTable().destroy();
        }
        $("#dataTable").DataTable({
          dom: "tp",
          searching: false,
          pageLength: 5,
          data: Object.entries(countriesPro),
          columns: [{ title: "COUNTRY" }, { title: "NODES" }],
          order: [[1, "desc"]],
        });
        var lbl = new Array();
        var vl = new Array();
        $.each(countriesPro, function (k, v) {
          lbl.push(k);
          vl.push(v);
        });
        //
        mychart.data.labels = lbl;
        mychart.data.datasets[0].data = vl;
        // debugger;
        mychart.data.datasets[0].backgroundColor = randomColor({
          count: vl.length,
          luminosity: "bright",
          seed: "countries",
        });
        mychart.update();
        break;
      case "ISP":
        var ISPs = {};
        var ISPsPro = {};
        var ISPsOthers = 0;
        if (selected) {
          try {
            selected.getAllChildMarkers().forEach((a) => {
              ISPs[a.options.properties.isp] =
                ISPs[a.options.properties.isp] + 1 || 1;
            });
            //
          } catch (e) {
            if (e instanceof TypeError) {
              ISPs[selected.options.properties.isp] = 1;
            }
            //
          }
        } else {
          if (network && network != "all") {
            const element = markerClusterGroups[network];
            element.getLayers().forEach((a) => {
              ISPs[a.options.properties.isp] =
                ISPs[a.options.properties.isp] + 1 || 1;
            });
            //
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
        }
        var ISPsSorted = Object.keys(ISPs).sort((a, b) => ISPs[b] - ISPs[a]);
        var ISPSum = Object.values(ISPs).reduce((a, b) => a + b, 0);
        //
        ISPsSorted.reduce((a, b) => {
          if (ISPs[b]< 0.02* ISPSum) {
            ISPsOthers = ISPsOthers + ISPs[b] || ISPs[b];
            return a + ISPs[b];
          } else {
            ISPsPro[b] = ISPs[b];
            return a + ISPs[b];
          }
        }, 0);
        if (ISPsOthers > 0) {
          ISPsPro["Others"] = ISPsOthers;
        }

        if (network && network != "all") {
          document.getElementById("networkName").innerHTML =
            network.toLocaleUpperCase();
        } else {
          document.getElementById("networkName").innerHTML = "ALL NETWORKS";
        }
        document.getElementById("numNodes").innerHTML =":"+ ISPSum;
        if ($.fn.dataTable.isDataTable("#dataTable")) {
          //
          $("#dataTable").DataTable().destroy();
        }
        $("#dataTable").DataTable({
          dom: "tp",
          searching: false,
          pageLength: 5,
          data: Object.entries(ISPsPro),
          columns: [{ title: "ISP" }, { title: "NODES" }],
          order: [[1, "desc"]],
        });
        var lbl = new Array();
        var vl = new Array();
        $.each(ISPsPro, function (k, v) {
          lbl.push(k);
          vl.push(v);
        });
        //
        mychart.data.labels = lbl;
        mychart.data.datasets[0].data = vl;
        mychart.data.datasets[0].backgroundColor = randomColor({
          count: vl.length,
          luminosity: "bright",
          seed: "ISPs",
        });
        mychart.update();
        break;
      case "DATA CENTER":
        var DCS = {};
        var DCSPro = {};
        var DCSOthers = 0;
        if (selected) {
          try {
            selected.getAllChildMarkers().forEach((a) => {
              DCS[a.options.properties.as] =
                DCS[a.options.properties.as] + 1 || 1;
            });
          } catch (e) {
            if (e instanceof TypeError) {
              DCS[selected.options.properties.as] = 1;
            }
          }
        } else {
          if (network && network != "all") {
            const element = markerClusterGroups[network];
            element.getLayers().forEach((a) => {
              DCS[a.options.properties.as] =
                DCS[a.options.properties.as] + 1 || 1;
            });
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
        }
        var DCSSorted = Object.keys(DCS).sort((a, b) => DCS[b] - DCS[a]);
        var DCSSum = Object.values(DCS).reduce((a, b) => a + b, 0);

        DCSSorted.reduce((a, b) => {
          if (DCS[b] < 0.02 * DCSSum) {
            DCSOthers = DCSOthers + DCS[b] || DCS[b];
            return a + DCS[b];
          } else {
            DCSPro[b] = DCS[b];
            return a + DCS[b];
          }
        }, 0);
        if (DCSOthers > 0) {
          DCSPro["Others"] = DCSOthers;
        }

        if (network && network != "all") {
          document.getElementById("networkName").innerHTML =
            network.toLocaleUpperCase();
        } else {
          document.getElementById("networkName").innerHTML = "ALL NETWORKS";
        }
        document.getElementById("numNodes").innerHTML =":"+ DCSSum;
        if ($.fn.dataTable.isDataTable("#dataTable")) {
          $("#dataTable").DataTable().destroy();
        }
        $("#dataTable").DataTable({
          dom: "tp",
          searching: false,
          pageLength: 5,
          data: Object.entries(DCSPro),
          columns: [{ title: "DATA CENTER" }, { title: "NODES" }],
        });
        var lbl = new Array();
        var vl = new Array();
        $.each(DCSPro, function (k, v) {
          lbl.push(k);
          vl.push(v);
        });

        mychart.data.labels = lbl;
        mychart.data.datasets[0].data = vl;
        // debugger;
        mychart.data.datasets[0].backgroundColor = randomColor({
          count: vl.length,
          luminosity: "bright",
          seed: "DCSseed",
        });
        mychart.update();
        break;
    }
  }
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );
  return vars;
}
function getUrlParam(parameter, defaultvalue) {
  var urlparameter = defaultvalue;
  if (window.location.href.indexOf(parameter) > -1) {
    urlparameter = getUrlVars()[parameter];
  }

  if (urlparameter !== undefined) {
    return urlparameter;
  } else {
    return defaultvalue;
  }
}
