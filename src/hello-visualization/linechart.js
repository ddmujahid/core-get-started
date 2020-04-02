/* eslint-env browser */
/* eslint import/extensions:0 */

import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

picasso.use(picassoQ);

export default class Linechart {
  constructor() {
    this.axisPainted = false;
    this.pic = null;
  }

  paintLinechart(element, layout,chartFilter) {
    if (!(layout.qHyperCube
      && layout.qHyperCube.qDataPages
      && layout.qHyperCube.qDataPages[0]
      && layout.qHyperCube.qDataPages[0].qMatrix)
    ) {
      return;
    }

    const columns = [];
    layout.qHyperCube.qDimensionInfo.forEach(info => 
      {
      columns.push(info.qFallbackTitle)});
    layout.qHyperCube.qMeasureInfo.forEach(info => 
      columns.push(info.qFallbackTitle));
    
    let dataMatrix = [['Duration', 'Year']];

    layout.qHyperCube.qDataPages[0].qMatrix.forEach(row => {
      let duration = row[columns.indexOf('Duration')].qText;
      let year = row[columns.indexOf('Year')].qText;
      let dateTime = row[columns.indexOf('DateTime')].qText;
      let callType = row[columns.indexOf('CallType')].qText;

      var d=new Date(dateTime);
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);

      let origionFilter=chartFilter.origion;
       
       //console.log(callType+":"+dateTime+":"+duration);
       if(callType=="CDC_NationalMobile_PT_FAC" || callType=="CDC_International_PT_FAC"){
         if(
           (callType=="CDC_NationalMobile_PT_FAC" && origionFilter=="National")||
           (callType=="CDC_International_PT_FAC" && origionFilter=="International")||
           origionFilter=="NationalAndInternational"
           )
         {
          let success=true;
          if(chartFilter.fromDate!=null&&d<chartFilter.fromDate){
            success=false;
          }
          if(chartFilter.toDate!=null&&d>chartFilter.toDate){
            success=false;
          }
        if(success){

            dataMatrix.push([Number.parseFloat(duration), (Number.parseFloat(year+"."+quarter_of_the_year(d)))]);
        }
         }
       }

    });
  function quarter_of_the_year(date) 
  {
    var month = date.getMonth() + 1;
    return (Math.ceil(month / 3));
  }
  console.log(dataMatrix);
  console.log(+new Date(2020,9,2))

    var groupBy = {};
    var result = dataMatrix.reduce(function(r, o) {
      var key = o[1] + '-' + o[1];
      
      if(!groupBy[key]) {
        groupBy[key] = Object.assign([], o); // create a copy of o
        r.push(groupBy[key]);
      } else {
        groupBy[key][0] += o[0];
      }
    
      return r;
    }, []);

    dataMatrix = [];

    for (const [key, value] of Object.entries(groupBy)) {
      dataMatrix.push(value);
    }

    dataMatrix.splice(1, 0, [2,2019]);


    //console.log(layout.qHyperCube);
    // const settings = {
    //   collections: [
    //     {
    //       key: 'coll',
    //       data: {
    //         extract: {
    //           field: 'qDimensionInfo/0',
    //           value: (v) => v.qNum,
    //           props: {
    //             movie: { value: (v) => v.qText },
    //             movieCount: { field: 'qMeasureInfo/0' },
    //           },
    //         },
    //       },
    //     },
    //   ],
    //   scales: {
    //     x: { data: { field: 'qDimensionInfo/0' }, expand: 2 },
    //     y: { data: { field: 'qMeasureInfo/0' }, expand: 0.1, invert: true },
    //   },
    //   components: [
    //     {
    //       key: 'xaxis',
    //       type: 'axis',
    //       scale: 'x',
    //       dock: 'bottom',
    //       formatter: {
    //         type: 'd3-number',
    //       },
    //       settings: { labels: { fill: '#f2f2f2' } },

    //     },
    //     {
    //       key: 'yaxis',
    //       type: 'axis',
    //       scale: 'y',
    //       dock: 'left',
    //       settings: { labels: { fill: '#f2f2f2' } },
    //     },

    //     {
    //       key: 'xtitle',
    //       type: 'text',
    //       scale: 'x',
    //       dock: 'bottom',
    //       style: {
    //         text: { fill: '#f2f2f2' },
    //       },
    //     },
    //     {
    //       key: 'ytitle',
    //       type: 'text',
    //       scale: 'y',
    //       dock: 'left',
    //       style: {
    //         text: { fill: '#f2f2f2' },
    //       },
    //     },
    //     {
    //       key: 'lines',
    //       type: 'line',
    //       data: { collection: 'coll' },

    //       settings: {

    //         coordinates: {
    //           major: { scale: 'x' },
    //           minor: { scale: 'y', ref: 'movieCount' },
    //         },
    //         layers: {
    //           line: {},
    //         },
    //       },
    //     }],
    // };
    //console.log(dataMatrix);
    const settings = {
      scales: {
        y: {data: { field: 'Duration' }, invert: true, expand: 0.2 ,
        ticks: { 
          tight: false,
          forceBounds: false,
          distance: 100,
          count:10,
        },
        minorTicks: {  
          count: 10, 
        },min:0
       },

        t: { data: { extract: { field: 'Year' } }, type: 'band' }
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
         line: {show:true} }
      },{
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
         line: {show:true} },
      },
      {
        key: 'xtitle',
        type: 'text',
        //scale: 'x',
        text: 'Year',
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
      {
        key: 'lines',
        type: 'line',
        data: {
          extract: {
            field: 'Year',
            props: {
              v: { field: 'Duration' }
            }
          }
        },
        settings: {
          coordinates: {
            major: { scale: 't' },
            minor: { scale: 'y', ref: 'v' }
          },
          layers: {
            line: {}
          }
        }
      }
    ]
    };

    if (!this.pic) {
      this.pic = picasso.chart({
        element,
        data: {
          type: 'matrix',
          data: dataMatrix
         },
        settings,
      });
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

  static hideTooltip() {
    const elements = document.getElementsByClassName('tooltip');
    if (elements[0]) {
      document.body.removeChild(elements[0]);
    }
  }

  static showTooltip(text, point) {
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
}
