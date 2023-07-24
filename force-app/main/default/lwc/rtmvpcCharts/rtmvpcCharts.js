import { LightningElement } from 'lwc';
//import getDataForCharts from '@salesforce/apex/rtmvpcRelatedListsController.getDataForCharts';
export default class RtmvpcCharts extends LightningElement {
    // @api chartConfiguration;
    // @api chartDataList;
    // @api chartType;
    // @api chartName;
    // @api chartProperties;
    // @api vendorId = 'a14DE00000CRco1YAD';

    // connectedCallback() {
    //     if (this.chartType) {
    //         console.log(this.chartType);
    //         console.log('1if - chartdata',this.chartDataList);


    //         if (this.chartDataList) {
    //             console.log('2if - chartdata',this.chartDataList);
    //             let chartData = [];
    //             let chartLabels = [];
    //             let datasetsList = [];
    //             let optionsJson = {
    //                 align: 'start',
    //                 responsive: true,
    //                 legend: {
    //                     position: 'top'
    //                 },
    //                 animation: {
    //                     animateScale: true
    //                 }
    //             }
    //             console.log('chartdata',this.chartDataList);
    //             JSON.parse(JSON.stringify(this.chartDataList)).forEach(res => {
    //                 chartData.push(res.value);
    //                 console.log('Value1',res.value);
    //                 chartLabels.push(res.label);
    //                 console.log('Value1',res.label);
    //             });
    //             console.log(chartLabels,chartData);
    //             if (this.chartType === 'pie') {
    //                 datasetsList = [
    //                     {
    //                         label: this.chartName,
    //                         backgroundColor: ["#FFB03B", "#4FD2D2", "#94E7A8", "rgb(255, 99, 132)", "#52B7D8", "rgb(255, 205, 86)"],
    //                         data: chartData,
    //                     },
    //                 ]
    //             }
    //             else if (this.chartType === 'doughnut') {
    //                 datasetsList = [
    //                     {
    //                         label: this.chartName,
    //                         backgroundColor: ["#9D53F2", "#77B9F2", "#26ABA4", "#C398F5", "#3296ED", "#4ED4CD"],
    //                         data: chartData,
    //                     },
    //                 ]
    //             }
    //             else if (this.chartType === 'bar') {
    //                 datasetsList = [
    //                     {
    //                         label: this.chartName,
    //                         barPercentage: 0.5,
    //                         barThickness: 6,
    //                         maxBarThickness: 8,
    //                         minBarLength: 2,
    //                         backgroundColor: "#FFB03B",
    //                         data: chartData,
    //                     },
    //                 ];
    //                 if (this.chartProperties && this.chartProperties.chartType === 'Stacked') {
    //                     optionsJson.scales = {
    //                         xAxes: [{
    //                             stacked: true
    //                         }],
    //                         yAxes: [{
    //                             stacked: true
    //                         }]
    //                     };
    //                 }
    //             }
    //             else if (this.chartType === 'horizontalBar') {
    //                 datasetsList = [
    //                     {
    //                         axis: 'y',
    //                         label: this.chartName,
    //                         barPercentage: 0.5,
    //                         barThickness: 6,
    //                         maxBarThickness: 8,
    //                         maxBarLength: 2,
    //                         minBarLength: 2,
    //                         backgroundColor: "#3296ED",
    //                         data: chartData,
    //                     },
    //                 ]
    //             }
    //             this.chartConfiguration = {
    //                 type: this.chartType,
    //                 data: {
    //                     labels: chartLabels,
    //                     datasets: datasetsList,
    //                 },
    //                 options: optionsJson,
    //             };
    //         }


            
    //         else {
    //             getDataForCharts({ vendorId: this.vendorId, chartName: this.chartName })
    //                 .then(result => {
    //                     let chartData = [];
    //                     let chartLabels = [];
    //                     let datasetsList = [];
    //                     let optionsJson = {
    //                         align: 'start',
    //                         responsive: true,
    //                         legend: {
    //                             position: 'top'
    //                         },
    //                         animation: {
    //                             animateScale: true
    //                         }
    //                     }
    //                     result.forEach(res => {
    //                         chartData.push(res.value);
    //                         chartLabels.push(res.label);
    //                     });
    //                     if (this.chartType === 'pie') {
    //                         datasetsList = [
    //                             {
    //                                 label: this.chartName,
    //                                 backgroundColor: ["#FFB03B", "#4FD2D2", "#94E7A8", "rgb(255, 99, 132)", "#52B7D8", "rgb(255, 205, 86)"],
    //                                 data: chartData,
    //                             },
    //                         ]
    //                     }
    //                     else if (this.chartType === 'doughnut') {
    //                         datasetsList = [
    //                             {
    //                                 label: this.chartName,
    //                                 backgroundColor: ["#9D53F2", "#77B9F2", "#26ABA4", "#C398F5", "#3296ED", "#4ED4CD"],
    //                                 data: chartData,
    //                             },
    //                         ]
    //                     }
    //                     else if (this.chartType === 'bar') {
    //                         datasetsList = [
    //                             {
    //                                 label: this.chartName,
    //                                 barPercentage: 0.5,
    //                                 barThickness: 6,
    //                                 maxBarThickness: 8,
    //                                 minBarLength: 2,
    //                                 backgroundColor: "#FFB03B",
    //                                 data: chartData,
    //                             },
    //                         ];
    //                         if (this.chartProperties && this.chartProperties.chartType === 'Stacked') {
    //                             optionsJson.scales = {
    //                                 xAxes: [{
    //                                     stacked: true
    //                                 }],
    //                                 yAxes: [{
    //                                     stacked: true
    //                                 }]
    //                             };
    //                         }
    //                     }
    //                     else if (this.chartType === 'horizontalBar') {
    //                         datasetsList = [
    //                             {
    //                                 axis: 'y',
    //                                 label: this.chartName,
    //                                 barPercentage: 0.5,
    //                                 barThickness: 6,
    //                                 maxBarThickness: 8,
    //                                 maxBarLength: 2,
    //                                 minBarLength: 2,
    //                                 backgroundColor: "#3296ED",
    //                                 data: chartData,
    //                             },
    //                         ]
    //                     }
    //                     this.chartConfiguration = {
    //                         type: this.chartType,
    //                         data: {
    //                             labels: chartLabels,
    //                             datasets: datasetsList,
    //                         },
    //                         options: optionsJson,
    //                     };
    //                 }).catch(error => {
    //                     this.error = error;
    //                     console.log('error => ' + JSON.stringify(error));
    //                     this.chartConfiguration = undefined;
    //                 });
    //         }
    //     }
    // }
}


