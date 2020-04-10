/* eslint-env browser */
/* eslint import/extensions:0 */

import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

picasso.use(picassoQ);

export default class Barchart {
  constructor() {
    this.axisPainted = false;
    this.pic = null;
    this.myfilter = null;
  }

  paintBarChart(element, layout, selectionAPI, chartFilter) {
    if (!(layout.qHyperCube
      && layout.qHyperCube.qDataPages
      && layout.qHyperCube.qDataPages[0]
      && layout.qHyperCube.qDataPages[0].qMatrix)
    ) {
      return;
    }

    if (selectionAPI.hasSelected) {
      return; // keep selected chart state
    }
    const columns = [];
    layout.qHyperCube.qDimensionInfo.forEach(info =>
      columns.push(info.qFallbackTitle));
    layout.qHyperCube.qMeasureInfo.forEach(info =>
      columns.push(info.qFallbackTitle));
    let dataMatrix = [['AuthCodeDescription', 'DateTime', 'CallType', 'Duration']];

    this.myfilter = chartFilter;
    
    let origionFilter = chartFilter.origion;

    layout.qHyperCube.qDataPages[0].qMatrix.forEach(row => {
      let authCodeDescription = row[columns.indexOf('AuthCodeDescription')].qText;
      let duration = row[columns.indexOf('Duration')].qNum;
      let callType = row[columns.indexOf('CallType')].qText;
      let dateTime = row[columns.indexOf('DateTime')].qText;

      var d = new Date(dateTime);
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);


      if (callType == "CDC_NationalMobile_PT_FAC" || callType == "CDC_International_PT_FAC") {
        if (
          (callType == "CDC_NationalMobile_PT_FAC" && origionFilter == "National") ||
          (callType == "CDC_International_PT_FAC" && origionFilter == "International") ||
          origionFilter == "NationalAndInternational"
        ) {
          let success = true;
          if (chartFilter.fromDate != null && d < chartFilter.fromDate) {
            success = false;
          }
          if (chartFilter.toDate != null && d > chartFilter.toDate) {
            success = false;
          }
          if (success) {

            dataMatrix.push([authCodeDescription == undefined ? 'Anonymous' : authCodeDescription, dateTime, callType, duration]);
          }
        }
      }

    });

    var groupBy = {};
    var result = dataMatrix.reduce(function (r, o) {
      var key = o[0] + '-' + o[2];

      if (!groupBy[key]) {
        groupBy[key] = Object.assign([], o); // create a copy of o
        r.push(groupBy[key]);
      } else {
        groupBy[key][3] += o[3];
      }

      return r;
    }, []);

    dataMatrix = [];

    var hasInternationalcalls = false;
    var hasNationalCalls = false;
    for (const [key, value] of Object.entries(groupBy)) {
      dataMatrix.push(value);

      if (value[2] == 'CDC_NationalMobile_PT_FAC') hasNationalCalls = true;

      if (value[2] == 'CDC_International_PT_FAC') hasInternationalcalls = true;
    }

    if (!hasNationalCalls) dataMatrix.splice(1, 0, ["", "", "CDC_NationalMobile_PT_FAC", 0]);

    if (!hasInternationalcalls) dataMatrix.push(["", "", "CDC_International_PT_FAC", 0]);


    // var testData = [];

    // var arr = [
    //   ['Month', 'Sales']
    // ];

    // var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // for (var m = 0; m < months.length; m++) {
    //   arr.push([
    //     months[m],
    //     parseFloat((Math.random() * 10000).toFixed(0))
    //   ]);
    // }
    // testData = [{
    //   type: 'matrix',
    //   data: arr
    // }];

    const settings = {
      collections: [{
        key: 'stacked',
        data: {
          extract: {
            field: 'AuthCodeDescription',
            filter: d => d.value != '',
            props: {
              series: { field: 'CallType' },
              end: { field: 'Duration' }
            }
          },

          stack: {
            stackKey: d => d.value,
            value: d => d.end.value,
          }
        }
      }],
      scales: {
        y: {
          data: { collection: { key: 'stacked' } }, invert: true,
          ticks: {
            tight: true,
            forceBounds: true,
            distance: 100,
            count: 10,
          },
          minorTicks: {
            count: 10,
          }, min: 0
        },
        t: { data: { extract: { field: 'AuthCodeDescription' }, filter: d => d.value !== '' }, padding: 0.3 },
        c: { data: { extract: { field: 'CallType' } }, type: 'color', range: ['#3f8ab3', '#2b688a'] }
      },
      components: [{
        type: 'axis',
        dock: 'left',
        scale: 'y',
        settings: {
          labels: { fill: '#f2f2f2' },
          ticks: {
            show: true,
            margin: 0,
            tickSize: 8,
          },
          line: { show: true }
        }
      }, {
        type: 'axis',
        dock: 'bottom',
        scale: 't',
        settings: {
          labels: { fill: '#f2f2f2' },
          ticks: {
            show: true,
            margin: 0,
            tickSize: 8,
          },
          line: { show: true }
        }
      },
      {
        key: 'xtitle',
        type: 'text',
        //scale: 'x',
        text: 'Authorization Code Description',
        dock: 'bottom',
        style: {
          text: { fill: '#f2f2f2' },
        },
      },
      {
        key: 'ytitle',
        type: 'text',
        //scale: 'y',
        text: 'Duration (mins)',
        dock: 'left',
        style: {
          text: { fill: '#f2f2f2' },
        },
      },
      // {
      //   key: 'legend1',
      //   type: 'legend-cat',
      //   scale: "c2",
      //   dock: 'top',
      //   settings: {
      //     item: {
      //       label: { fill: '#f2f2f2' }
      //     },
      //     title: { 
      //       text: 'Call Type',
      //       fill: '#f2f2f2' 
      //     }
      //   },
      //   brush: {
      //     trigger: [{
      //       contexts: ['highlight'],
      //       data: ["c2"],
      //       //filter: shape => {console.log(shape); shape.type === 'circle'},
      //       on: 'tap',
      //       action: 'toggle'
      //     }],
      //     consume: [{
      //       context: ['highlight'],
      //       style: {
      //         inactive: {
      //           opacity: 0.4
      //         }
      //       }
      //     }]
      //   },
      // },
      {
        type: 'legent-cat',
        data: ['National', 'International'],
        dock: 'top',
        settings: {
          item: {
            label: {
              //show: false, 
              fill: '#f2f2f2'
            }
          },
          title: {
            //show: false,
            text: 'Call Type',
            fill: '#f2f2f2'
          }
        },
      },
      {
        // key: 'legend2',
        // type: 'legend-cat',
        // scale: 'c',
        // dock: 'top',
        // settings: {
        //   item: {
        //     label: { 
        //       show: false, 
        //       fill: '#f2f2f2' }
        //   },
        //   title: { 
        //     show: false,
        //     text: 'Call Type',
        //     fill: '#f2f2f2' 
        //   }
        // },
        // brush: {
        //   trigger: [{
        //     contexts: ['highlight'],
        //     //filter: shape => {console.log(shape); shape.type === 'circle'},
        //     on: 'tap',
        //     action: 'toggle'
        //   }],
        //   consume: [{
        //     context: ['highlight'],
        //     style: {
        //       inactive: {
        //         opacity: 0.2
        //       }
        //     }
        //   }]
        // },
      },
      {
        key: 'bars',
        type: 'box',
        data: {
          collection: 'stacked',
          extract: {
            field: 'CallId',
            props: {
              id: { field: 'CallId' },
              x: { field: 'AuthCodeDescription' },
              y: { field: 'Duration' }
            },
          }
        },
        /////////////////// Adding  ////////////////////////////
        brush: {
          trigger: [{
            contexts: ['tooltip'],
            on: 'tap',
            action: 'set'
          }],
          consume: [{
            context: 'tooltip',
            style: {
              inactive: {
                opacity: 0.4,
                fill: 'rgba(109, 232, 193, 0.3)',
              }
            }
          }]
        },
        //////////////////////// end //////////////////////////////
        settings: {
          major: { scale: 't' },
          minor: { scale: 'y', ref: 'end' },
          box: {
            fill: { scale: 'c', ref: 'series' }
          }
        },
      },
      ]
    };


    //console.log(element);
    if (!this.pic) {
      this.pic = picasso.chart({
        element,
        data: {
          type: 'matrix',
          data: dataMatrix
        },
        settings,
      });

      // this.pic.brush('highlight').on('update', (added) => {

      //   if (added[0]) {
      //     console.log("this.pic.brush('highlight') IF called!");
      //     selectionAPI.select(added[0].values[0]);
      //     var filteredData = dataMatrix;
      //     console.log(filteredData);
      //     if(added[0].values[0] == "CDC_NationalMobile_PT_FAC"){
      //       filteredData = dataMatrix.filter(c => c[1] === "CDC_NationalMobile_PT_FAC" || c[1] === "CallType");
      //       filteredData.splice(1, 0, ["", "CDC_International_PT_FAC", 0]);
      //     } else if (added[0].values[0] == "CDC_International_PT_FAC") {
      //       filteredData = dataMatrix.filter(c => c[1] ==="CDC_International_PT_FAC" || c[1] === "CallType");
      //       filteredData.push(["", "CDC_NationalMobile_PT_FAC", 0]);
      //     }

      //     console.log(filteredData);
      //     this.pic.update({
      //       data: {
      //         type: 'matrix',
      //         data: filteredData
      //        },
      //       settings,
      //     });


      //   } else {
      //     console.log("this.pic.brush('highlight') ELSE called!");
      //     this.pic.brush('highlight').end();
      //     selectionAPI.clear();
      //   }
      // });


      // this.pic.brush('tooltip').on('update', (added) => {
      //   console.log("this.pic.brush('tooltip') called!")
      //   console.log(added);
      //   if (added.length) {
      //     const s = this.pic.getAffectedShapes('tooltip')[0];
      //     const rect = s.element.getBoundingClientRect();
      //     const p = {
      //       x: s.bounds.x + s.bounds.width + rect.x + 5,
      //       y: s.bounds.y + (s.bounds.height / 2) + (rect.y - 28),
      //     };
      //     console.log(s.data);
      //     Barchart.showTooltip(s.data.value, p);
      //   } else {
      //     Barchart.hideTooltip();
      //   }
      // });


      ///////////////////////////// Adding ////////////////////
      this.pic.brush('tooltip').on('update', (added) => {
        if (added.length) {
          selectionAPI.select(added[0].values[0]);
          const s = this.pic.getAffectedShapes('tooltip')[0];
          const rect = s.element.getBoundingClientRect();
          const p = {
            x: s.bounds.x + s.bounds.width + rect.x + 5,
            y: s.bounds.y + (s.bounds.height / 2) + (rect.y - 28),
          };
          Barchart.showTooltip(s.data.value, p);
        } else {
          this.pic.brush('tooltip').end();
          Barchart.hideTooltip();
        }
      });
      ////////////////////////////////////////////////////


    } else {
      this.pic.update({
        data: {
          type: 'matrix',
          data: dataMatrix
        },
        settings,
      });
    }

  }

  static showCallDetails(layout, value,myfilter,layout2) {

    if (!(layout.qHyperCube
      && layout.qHyperCube.qDataPages
      && layout.qHyperCube.qDataPages[0]
      && layout.qHyperCube.qDataPages[0].qMatrix)
    ) {
      return;
    }

    console.log(layout);
    console.log(layout2);

    var length=layout.qHyperCube.qDataPages[0].qMatrix.length;
    var mapData=[];
    for(let i=0;i<length;i++){
        var item=layout.qHyperCube.qDataPages[0].qMatrix[i];
        var item2=layout2.qHyperCube.qDataPages[0].qMatrix[i];
        var row={
          caller: item[0].qText,
          datetime: item[1].qText,
          origion: item[2].qText,
          duration: item[3].qNum,
          number: item2[2].qNum+"",
        }
        mapData.push(row);
    }

var data=mapData;

    // const data = layout.qHyperCube.qDataPages[0].qMatrix.map((item) => ({
    //   caller: item[0].qText,
    //   datetime: item[1].qText,
    //   origion: item[2].qText,
    //   duration: item[3].qNum,
    //   // originalCalledPN: item[4].qText,
    //   // originalCalledPNPartition: item[5].qText,
    //   // finalCalledPNPartition: item[6].qText,
    //   // duration: item[7].qText,
    //   // AuthCodeDescription: item[8].qText,
    //   // AuthCodeValue: item[9].qText
    // }));

    let callsTable = "";

    let caller = value;
    let totalDuration = 0;
    data.forEach((d) => {


      if (d.origion == "CDC_NationalMobile_PT_FAC" || d.origion == "CDC_International_PT_FAC") {
        if (
          (d.origion == "CDC_NationalMobile_PT_FAC" && myfilter.origion == "National") ||
          (d.origion == "CDC_International_PT_FAC" && myfilter.origion == "International") ||
          myfilter.origion == "NationalAndInternational"
        ) {

          var dt = new Date(d.datetime);
          dt.setHours(0);
          dt.setMinutes(0);
          dt.setSeconds(0);

          let success = true;
          if (myfilter.fromDate != null && dt < myfilter.fromDate) {
            success = false;
          }
          if (myfilter.toDate != null && dt > myfilter.toDate) {
            success = false;
          }
          if (success) {

            if (((d.caller == undefined) ? "Anonymous" : d.caller) == value) {

              callsTable += "<tr>";
              callsTable += "<td>" + d.datetime + "</td>";
              callsTable += "<td>" + (d.origion == 'CDC_International_PT_FAC' ? 'International' : 'National') + "</td>";
              callsTable += "<td>" + parseFloat(((d.duration) / 60)).toFixed(2) + "</td>";
              callsTable += "<td>" + d.number + "</td>";
              callsTable += "</tr>";

              totalDuration = totalDuration + d.duration;
            }

          }
        }
      }





    });
    let fulltable = "<table><tr><th>Date & Time</th><th>Origion</th><th>Duration (mins)</th><th>Phone Number</th></tr>" + callsTable + "</table>";

    document.getElementsByClassName('table-calls')[0].innerHTML = fulltable;
    document.getElementsByClassName('authCodeDesc')[0].innerHTML = caller;
    document.getElementsByClassName('duration')[0].innerHTML = parseFloat(((totalDuration) / 60)).toFixed(2);
  }

  static hideTooltip() {
    const elements = document.getElementsByClassName('tooltip');
    if (elements[0]) {
      document.body.removeChild(elements[0]);
    }
  }

  static showTooltip(text, point) {
    Barchart.hideTooltip();
    const currentTooltip = document.createElement('div');
    currentTooltip.appendChild(document.createTextNode(text));
    currentTooltip.style.position = 'absolute';
    currentTooltip.style.top = '-99999px';
    currentTooltip.style.left = '-99999px';
    currentTooltip.classList.add('tooltip');

    document.body.appendChild(currentTooltip);

    // Reposition the tooltip
    currentTooltip.style.top = `${point.y}px`;
    currentTooltip.style.left = `${(point.x + 5)}px`;
  }


  // static hideTooltip() {
  //   console.log("hideTooltip")
  //   const elements = document.getElementsByClassName('tooltip');
  //   if (elements[0]) {
  //     document.body.removeChild(elements[0]);
  //   }
  // }

  // static showTooltip(text, point) {
  //   Barchart.hideTooltip();
  //   const currentTooltip = document.createElement('div');
  //   currentTooltip.appendChild(document.createTextNode(text));
  //   currentTooltip.style.position = 'absolute';
  //   currentTooltip.style.top = '-99999px';
  //   currentTooltip.style.left = '-99999px';
  //   currentTooltip.classList.add('tooltip');

  //   document.body.appendChild(currentTooltip);

  //   // Reposition the tooltip
  //   currentTooltip.style.top = `${point.y}px`;
  //   currentTooltip.style.left = `${(point.x + 5)}px`;
  // }
}
