/* eslint-env browser */
/* eslint import/extensions:0 */

import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

picasso.use(picassoQ);

export default class Scatterplot {
  constructor() {
    this.axisPainted = false;
    this.pic = null;
  }

  paintScatterplot(element, layout, selectionAPI) {
    if (!(layout.qHyperCube
      && layout.qHyperCube.qDataPages
      && layout.qHyperCube.qDataPages[0]
      && layout.qHyperCube.qDataPages[0].qMatrix)
    ) {
      return;
    }

    console.log(layout.qHyperCube.qDataPages[0].qMatrix);

    if (selectionAPI.hasSelected) {
      return; // keep selected chart state
    }
    // const settings = {
    //   collections: [
    //     {
    //       key: 'coll',
    //       data: {
    //         extract: {
    //           field: 'qDimensionInfo/0',
    //           props: {
    //             movie: { value: (v) => v.qText },
    //             cost: { field: 'qMeasureInfo/0' },    //AuthCodeDescription
    //             rating: { field: 'qMeasureInfo/1' },  //Duration
    //           },
    //         },
    //       },
    //     },
    //   ],
    //   scales: {
    //     x: { data: { field: 'qMeasureInfo/0'}, expand: 0.2 },
    //     y: { data: { field: 'qMeasureInfo/1'}, expand: 1, invert: true },
    //   },
    //   components: [
    //     {
    //       key: 'xaxis',
    //       type: 'axis',
    //       scale: 'x',
    //       dock: 'bottom',
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
    //       key: 'points',
    //       type: 'point',
    //       data: { collection: 'coll' },
    //       brush: {
    //         trigger: [{
    //           on: 'tap',
    //           action: 'set',
    //           data: ['movie'],
    //           propagation: 'stop',
    //           contexts: ['highlight'],
    //         }, {
    //           on: 'over',
    //           action: 'set',
    //           data: ['movie'],
    //           propagation: 'stop',
    //           contexts: ['tooltip'],
    //         }],
    //         consume: [{
    //           context: 'highlight',
    //           style: {
    //             inactive: {
    //               fill: 'rgba(109, 232, 193, 0.3)',
    //             },
    //           },
    //         }, {
    //           context: 'tooltip',
    //         }],
    //       },
    //       settings: {
    //         x: { scale: 'x', ref: 'rating' },
    //         y: { scale: 'y', ref: 'cost' },
    //         size: 0.4,
    //         opacity: 0.8,
    //         fill: 'rgba(109, 232, 193, 1.0)',
    //       },
    //     },
    //   ],
    // };
    const columns = [];
    layout.qHyperCube.qDimensionInfo.forEach(info => 
      columns.push(info.qFallbackTitle));
    layout.qHyperCube.qMeasureInfo.forEach(info => 
      columns.push(info.qFallbackTitle));
    //console.log(columns);
    let dataMatrix = [['CallId', 'AuthCodeDescription', 'Duration']];

    layout.qHyperCube.qDataPages[0].qMatrix.forEach(row => {
      let callId = row[columns.indexOf('CallId')].qText;
      let authCodeDescription = row[columns.indexOf('AuthCodeDescription')].qText;
      let duration = row[columns.indexOf('Duration')].qText;
      dataMatrix.push([callId, authCodeDescription, duration]);
    });

    const settings = {
      scales: {
        x: { type: 'band', data: { field: 'AuthCodeDescription' }},
        y: { data: { field: 'Duration' }, expand: 0.1, invert: true },
      },
      components: [
        {
          key: 'xaxis',
          type: 'axis',
          scale: 'x',
          dock: 'bottom',
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
          key: 'yaxis',
          type: 'axis',
          scale: 'y',
          dock: 'left',
          settings: { 
            labels: { fill: '#f2f2f2' }, 
            ticks: {
              show: true,
              margin: 0,
              tickSize: 8
            },
            line: {show:true} },
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
          text: 'Duration (seconds)',
          dock: 'left',
          style: {
            text: { fill: '#f2f2f2' },
          },
        },
        // {
        //   type: 'point',
        //   data: {
        //     extract: {
        //       field: 'CallId',
        //       props: {
        //         x: { field: 'AuthCodeDescription' },
        //         y: { field: 'Duration' }
        //       },
        //     },
        //   },
        //   settings: {
        //     x: { scale: 'x' }, // use values from first measure
        //     y: { scale: 'y' }, // use values from second measure
        //   },
        // },
        {
          type: 'point',
          data: {
                extract: {
                  field: 'CallId',
                  props: {
                    id: {field: 'CallId'},
                    x: { field: 'AuthCodeDescription' },
                    y: { field: 'Duration' }
                  },
                }
              },
              brush: {
                trigger: [{
                  contexts: ['highlight'],
                  on: 'tap',
                  action: 'set'
                }],
                consume: [{
                  context: 'highlight',
                  style: {
                    inactive: {
                      opacity: 0.4
                    }
                  }
                }]
              },
          settings: {
            x: { scale: 'x' },
            y: { scale: 'y' },
            size: 0.2,
            opacity: 0.8,
            fill: 'rgba(109, 232, 193, 1.0)',
          },
        },
      ],
    }

    if (!this.pic) {
      // this.pic = picasso.chart({
      //   element,
      //   data: [{
      //     type: 'q',
      //     key: 'qHyperCube',
      //     data: layout.qHyperCube,
      //   }],
      //   settings,
      // });
      
      //console.log(dataMatrix);
      
      this.pic = picasso.chart({
        element,
        data: {
         type: 'matrix',
         data: dataMatrix
        },
        settings: settings
      });

      this.pic.brush('highlight').on('update', (added) => {
        if (added[0]) {
          selectionAPI.select(added[0].values[0]);
        } else {
          this.pic.brush('highlight').end();
          selectionAPI.clear();
        }
      });
      this.pic.brush('tooltip').on('update', (added) => {
        if (added.length) {
          const s = this.pic.getAffectedShapes('tooltip')[0];
          const rect = s.element.getBoundingClientRect();
          const p = {
            x: s.bounds.x + s.bounds.width + rect.x + 5,
            y: s.bounds.y + (s.bounds.height / 2) + (rect.y - 28),
          };
          console.log(s.data);
          Scatterplot.showTooltip(s.data.value, p);
        } else {
          Scatterplot.hideTooltip();
        }
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

  static showCallDetails(layout){
    if (!(layout.qHyperCube
      && layout.qHyperCube.qDataPages
      && layout.qHyperCube.qDataPages[0]
      && layout.qHyperCube.qDataPages[0].qMatrix)
    ) {
      return;
    }

    //console.log(layout.qHyperCube.qDataPages);

    const data = layout.qHyperCube.qDataPages[0].qMatrix.map((item) => ({
      caller: item[0].qText,
      datetime: item[1].qText,
      year: item[2].qText,
      callingPN: item[3].qText,
      originalCalledPN: item[4].qText,
      originalCalledPNPartition: item[5].qText,
      finalCalledPNPartition: item[6].qText,
      duration: item[7].qText,
      AuthCodeDescription: item[8].qText,
      AuthCodeValue: item[9].qText
    }));
    
    document.getElementsByClassName('call-id')[0].innerHTML = data[0].caller;
    document.getElementsByClassName('call-datetime')[0].innerHTML = data[0].datetime;
    document.getElementsByClassName('call-callingpn')[0].innerHTML = data[0].callingPN;
    document.getElementsByClassName('calledpn')[0].innerHTML = data[0].originalCalledPN;
    document.getElementsByClassName('calledpnp')[0].innerHTML = data[0].originalCalledPNPartition;
    document.getElementsByClassName('fcalledpnp')[0].innerHTML = data[0].finalCalledPNPartition;
    document.getElementsByClassName('duration')[0].innerHTML = data[0].duration;
    document.getElementsByClassName('authCodeDesc')[0].innerHTML = data[0].AuthCodeDescription;
    document.getElementsByClassName('authCodeValue')[0].innerHTML = data[0].AuthCodeValue;

  }

  static hideTooltip() {
    const elements = document.getElementsByClassName('tooltip');
    if (elements[0]) {
      document.body.removeChild(elements[0]);
    }
  }

  static showTooltip(text, point) {
    Scatterplot.hideTooltip();
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
