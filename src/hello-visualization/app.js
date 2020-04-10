/* eslint-env browser */

import Halyard from 'halyard.js';
import angular from 'angular';
import enigma from 'enigma.js';
import enigmaMixin from 'halyard.js/dist/halyard-enigma-mixin';
import qixSchema from 'enigma.js/schemas/3.2.json';
import template from './app.html';
//import Scatterplot from './scatterplot';
import Barchart from './barchart';
import Linechart from './linechart';
import 'babel-polyfill';

const halyard = new Halyard();

angular.module('app', []).component('app', {
  bindings: {},
  controller: ['$scope', '$q', '$http', function Controller($scope, $q, $http) {
    $scope.dataSelected = false;
    $scope.showFooter = false;

    $scope.toggleFooter = () => {
      $scope.showFooter = !$scope.showFooter;
      if (!$scope.showFooter && $scope.dataSelected) {
        this.clearAllSelections();
      }
    };

    $scope.openGithub = () => {
      window.open('https://github.com/qlik-oss/core-get-started');
    };

    this.connected = false;
    this.painted = false;
    this.connecting = true;
    this.logined=false;
    this.validEP=true;

    let app = null;
    //let scatterplotObject = null;
    let barchartObject = null;
    let linechartObject = null;
    let callObject=null;

    //chart origion filter
    let chartFilter={origion:"NationalAndInternational",fromDate:null,toDate:null};

    const select = async (value) => {
      
     // const field = await app.getField('AuthCodeDescription');
      //console.log(field);
      //field.select(value);

      $scope.dataSelected = true;
      const layout = await this.getCallInfo();
      const layout2 = await this.getCallInfo2();
      Barchart.showCallDetails(layout,value,chartFilter,layout2);
      $scope.showFooter = true;
      $scope.$digest();
    };

    // const scatterplotProperties = {
    //   qInfo: {
    //     qType: 'visualization',
    //     qId: '',
    //   },
    //   type: 'my-picasso-scatterplot',
    //   labels: true,
    //   qHyperCubeDef: {
    //     qDimensions: [{
    //       qDef: {
    //         qFieldDefs: ['CallId'],
            
    //         qSortCriterias: [{
    //           qSortByExpression: 1,
    //           qExpression: {
    //           qv: "Duration"
    //           }
    //         }]
    //       },
    //     }],
    //     qMeasures: [{
    //       qDef: {
    //         qDef: '[AuthCodeDescription]',
    //         qLabel: 'AuthCodeDescription'
            
    //       }
    //     },
    //     {
    //       qDef: {
    //         qDef: '[Duration]',
    //         qLabel: 'Duration'
    //       },
    //       qSortBy: {
    //         qSortByNumeric: 1,
    //       },
    //     }],
    //     qInitialDataFetch: [{
    //       qTop: 0, qHeight: 50, qLeft: 0, qWidth: 3,
    //     }],
    //     qSuppressZero: false,
    //     qSuppressMissing: true,
    //   },
    // };

    // const scatterplot = new Scatterplot();

    // const paintScatterPlot = (layout) => {
    //   scatterplot.paintScatterplot(document.getElementById('chart-container-scatterplot'), layout, {
    //     select,
    //     clear: () => this.clearAllSelections(),
    //     hasSelected: $scope.dataSelected,
    //   });
    //   this.painted = true;
    // };



    const barchartProperties = {
      qInfo: {
        qType: 'visualization',
        qId: '',
      },
      type: 'my-picasso-barchart',
      labels: true,
      qHyperCubeDef: {
        qDimensions: [{
          qDef: {
            qFieldDefs: ['AuthCodeDescription'],
            qSortCriterias: [{
            qSortByExpression: 1,
            qExpression: {
                qv: "Duration"
              }
            }]
          },
        },
        {
          qDef: {
            qFieldDefs: ['DateTime'],
            qSortCriterias: [{
            qSortByExpression: 1,
            qExpression: {
                qv: "Duration"
              }
            }]
          },
        },
        {
          qDef: {
            qFieldDefs: ['CallType'],
            qSortCriterias: [{
            qSortByExpression: 1,
            qExpression: {
                qv: "Duration"
              }
            }]
          },
        }
      ],
        qMeasures: [{
          qDef: {
            qDef: 'Sum([Duration])/60',
            qLabel: 'Duration'
          },
          qSortBy: {
            qSortByNumeric: 1,
          },
        }
      ],
        qInitialDataFetch: [{
          qTop: 0, qHeight: 2500, qLeft: 0, qWidth: 4,
        }],
        qSuppressZero: true,
        qSuppressMissing: true,
      },
    };

    const barchart = new Barchart();
    const paintBarChart = (layout) => {

      barchart.paintBarChart(document.getElementById('chart-container-barchart'), layout, {
            select,
            clear: () => this.clearAllSelections(),
            hasSelected: $scope.dataSelected,
          },chartFilter);
      this.painted = true;
    };

    const linechartProperties = {
      qInfo: {
        qType: 'visualization',
        qId: '',
      },
      type: 'my-picasso-linechart',
      labels: true,
      qHyperCubeDef: {
        qDimensions: [{
          qDef: {
            qFieldDefs: ['Year'],
            qSortCriterias: [{
              qSortByAscii: 1,
            }],
          },
        },
        {
          qDef: {
            qFieldDefs: ['DateTime'],
            qSortCriterias: [{
              qSortByAscii: 1,
            }],
          },
        },
        {
          qDef: {
            qFieldDefs: ['CallType'],
            qSortCriterias: [{
              qSortByAscii: 1,
            }],
          },
        }
      ],
        qMeasures: [{
          qDef: {
            qDef: 'Sum([Duration])/60',
            qLabel: 'Duration'
          },
          qSortBy: {
            qSortByNumeric: 1,
          },
        }],
        qInitialDataFetch: [{
          qTop: 0, qHeight: 2500, qLeft: 0, qWidth: 4,
        }],
        qSuppressZero: true,
        qSuppressMissing: true,
      },
    };

    const linechart = new Linechart();

    const paintLineChart = (layout) => {
      linechart.paintLinechart(document.getElementById('chart-container-linechart'), layout,chartFilter);
      this.painted = true;
    };

    this.generateGUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // eslint-disable-next-line no-bitwise
      const r = Math.random() * 16 | 0;
      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });

    this.$onInit = () => {
      const config = {
        Promise: $q,
        schema: qixSchema,
        mixins: enigmaMixin,
        url: `ws://${window.location.hostname}:19076/app/${this.generateGUID()}`,
      };
      
      //Add local data: Calls 2
      // const filePathMetrics2 = '/data/MOCK_DATA_3.csv'
      

      // const tableMetrics2 = new Halyard.Table(filePathMetrics2, {
      //   name: 'Calls',
      //   fields: [
      //     {src: 'globalCallID_callId', name:'CallId', type: 'string'},
      //     //{src: 'dateTimeOrigination', name: 'DateTime', type: 'timeStamp' },
      //     //{src: 'Year', name:'Year'},
      //     {expr: "TimeStamp(Date#('19700101', 'YYYYMMDD') + ([dateTimeOrigination] / 86400))", name:'DateTime'},
      //     {expr: "Year(TimeStamp(Date#('19700101', 'YYYYMMDD') + ([dateTimeOrigination] / 86400)))", name:'Year'},
      //     {src: 'duration', name: 'Duration' },
      //     {src: 'authCodeDescription', name: 'AuthCodeDescription'},
      //     {src: 'originalCalledPartyNumberPartition', name: 'CallType'}
      //   ]
      // });

      const tableMetrics2 = new Halyard.Table('/data/newData2.csv', {
        name: 'Calls',
        fields: [
          {src: 'globalCallID_callId', name:'CallId', type: 'string'},
          //{src: 'dateTimeOrigination', name: 'DateTime', type: 'timeStamp' },
          //{src: 'Year', name:'Year'},
          {expr: "TimeStamp(Date#('19700101', 'YYYYMMDD') + ([dateTimeOrigination] / 86400))", name:'DateTime'},
          {expr: "Year(TimeStamp(Date#('19700101', 'YYYYMMDD') + ([dateTimeOrigination] / 86400)))", name:'Year'},
          {src: 'duration', name: 'Duration' },
          {src: 'originalCalledPartyNumber', name: 'PhoneNumber'},
          {src: 'authCodeDescription', name: 'AuthCodeDescription',},
          {src: 'originalCalledPartyNumberPartition', name: 'CallType'}
        ]
      });

      halyard.addTable(tableMetrics2);
      
      // Add web data
      (async () => {
        let qix;
        try {
          qix = await enigma.create(config).open();
          this.connected = true;
          this.connecting = false;
        } catch (error) {
          this.error = 'Could not connect to QIX Engine';
          this.connecting = false;
          console.log('Could not connect to QIX Engine');
        }

        try {
          app = await qix.createSessionAppUsingHalyard(halyard);
        } catch (error) {
          console.log(error);
          this.error = 'Could not create session app';
          this.connected = false;
          this.connecting = false;
          console.log('Could not connect to QIX Engine');
        }
       await app.getAppLayout();



        // scatterplotObject = await app.createSessionObject(scatterplotProperties);

        // const updateScatterPlot = (async () => {
        //    const layout = await scatterplotObject.getLayout();
        //    paintScatterPlot(layout);
        // });

        // scatterplotObject.on('changed', updateScatterPlot);
        // updateScatterPlot();





        barchartObject = await app.createSessionObject(barchartProperties);
        const updateBarChart = (async () => {
          const layout = await barchartObject.getLayout();
          paintBarChart(layout);
        });

        barchartObject.on('change', updateBarChart);
        updateBarChart();

        linechartObject = await app.createSessionObject(linechartProperties);
        const linechartUpdate = (async () => {
          const layout = await linechartObject.getLayout();
          paintLineChart(layout);
        });

        linechartObject.on('changed', linechartUpdate);
        linechartUpdate();

        document.getElementById('bothOrigion').addEventListener("click", function(){
          chartFilter.origion="NationalAndInternational"
          updateBarChart();
          linechartUpdate();
        });
        document.getElementById('nationalOrigion').addEventListener("click", function(){
          chartFilter.origion="National"
          updateBarChart();
          linechartUpdate();
        });
        document.getElementById('internationalOrigion').addEventListener("click", function(){
          chartFilter.origion="International";
          updateBarChart();
          linechartUpdate();
        });
        document.getElementById("dateFrom").addEventListener("change",function(){
          let v= document.getElementById("dateFrom").value;
          if(v+""!=""){
            var d=new Date(v);
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            chartFilter.fromDate=d;
          }
          else{
            chartFilter.fromDate=null;
          }
          updateBarChart();
          linechartUpdate();
        });
        document.getElementById("dateTo").addEventListener("change",function(){
          let v= document.getElementById("dateTo").value;
          if(v.value+""!=""){
            var d=new Date(v);
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            chartFilter.toDate=d;

          }else{
            chartFilter.toDate=null;
          }
          updateBarChart();
          linechartUpdate();
        });

        const LoginNow=()=>{
          chartFilter.origion="NationalAndInternational"
          updateBarChart();
          linechartUpdate();
          this.logined=true;
          this.validEP=true;
          localStorage.setItem("logined","true");
        }

        const CheckLogin=()=>{
          var item= localStorage.getItem("logined");
          if(item=="true"){
            LoginNow();
          }
        }
        CheckLogin();
        $scope.logoutNow=()=>{
          this.logined=false;
          this.validEP=true;
          localStorage.removeItem("logined");
        }
        $scope.PrintDetails=()=>
        {
            var mywindow = window.open('', 'PRINT', 'height=400,width=600');
        
            mywindow.document.write('<html><head><title>ROSHN - Calls Log</title>');
            mywindow.document.write('</head><body >');
            mywindow.document.write('<h1>ROSHN - Calls Log</h1>');
            mywindow.document.write(document.getElementsByClassName('info-wrapper')[0].innerHTML);
            mywindow.document.write('</body></html>');
        
            mywindow.document.close(); // necessary for IE >= 10
            mywindow.focus(); // necessary for IE >= 10*/
        
            mywindow.print();
            mywindow.close();
        
            return true;
        }

        $scope.login = () => {
          var email= document.getElementById("email").value;
          var password= document.getElementById("password").value;
          if(email=="user@gmail.com"&&password=="123"){
            LoginNow();
          }
          else{
            this.validEP=false;
          }

        };

      })();
    };

    this.clearAllSelections = () => {
      if ($scope.dataSelected) {
        $scope.dataSelected = false;
        app.clearAll();
      }
      $scope.showFooter = false;
    };

    this.getCallInfo = async () => {
      const fullDataProperties = {
        qInfo: {
          qType: 'visualization',
          qId: '',
        },
        type: 'my-picasso-barchart',
        labels: true,
        qHyperCubeDef: {
          qDimensions: [{
            qDef: {
              qFieldDefs: ['AuthCodeDescription'],
            },
          },
          {
            qDef: {
              qFieldDefs: ['DateTime']
            },
          },
          {
            qDef: {
              qFieldDefs: ['CallType']
            },
          },
          {
            qDef: {
              qFieldDefs: ['Duration']
            },
          },
          {
            qDef: {
              qFieldDefs: ['PhoneNumber']
            },
          }
          
        ],
          qMeasures: [{
            qDef: {
              qDef: '[Duration]',
              qLabel: 'Duration'
            },
            qSortBy: {
              qSortByNumeric: 1,
            },
          }],
          qInitialDataFetch: [{qHeight: 2500, qWidth: 4 }],
          qSuppressZero: true,
          qSuppressMissing: true,
        },
      };
      const model = await app.createSessionObject(fullDataProperties);
      return model.getLayout();
    };

    this.getCallInfo2 = async () => {
      const fullDataProperties = {
        qInfo: {
          qType: 'visualization',
          qId: '',
        },
        type: 'my-picasso-barchart',
        labels: true,
        qHyperCubeDef: {
          qDimensions: [{
            qDef: {
              qFieldDefs: ['AuthCodeDescription'],
            },
          },
          {
            qDef: {
              qFieldDefs: ['Duration']
            },
          },
          {
            qDef: {
              qFieldDefs: ['PhoneNumber']
            },
          }
          
        ],
          qMeasures: [{
            qDef: {
              qDef: '[Duration]',
              qLabel: 'Duration'
            },
            qSortBy: {
              qSortByNumeric: 1,
            },
          }],
          qInitialDataFetch: [{qHeight: 2500, qWidth: 3 }],
          qSuppressZero: true,
          qSuppressMissing: true,
        },
      };
      const model = await app.createSessionObject(fullDataProperties);
      return model.getLayout();
    };





  }],
  template,
});

angular.bootstrap(document, ['app']);
