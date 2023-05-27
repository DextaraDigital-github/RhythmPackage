import { LightningElement, wire, track, api } from 'lwc';
import getDataForCharts from '@salesforce/apex/rtmvpcRelatedListsController.getDataForCharts';
export default class RtmvpcCharts extends LightningElement {
    @api chartConfiguration;
    @api chartDataList;
    @api chartType;
    @api chartName;
    @api chartProperties;
    @api vendorId = 'a14DE00000CRco1YAD';

    connectedCallback() {
        // this.chartType = 'pie';
        // this.chartName = 'Assessments Status';

        if (this.chartType) {
            console.log(this.chartType);
            console.log('1if - chartdata',this.chartDataList);


            if (this.chartDataList) {
                console.log('2if - chartdata',this.chartDataList);
                let chartData = [];
                let chartLabels = [];
                let datasetsList = [];
                let optionsJson = {
                    align: 'start',
                    responsive: true,
                    legend: {
                        position: 'top'
                    },
                    animation: {
                        animateScale: true
                    }
                }
                console.log('chartdata',this.chartDataList);
                JSON.parse(JSON.stringify(this.chartDataList)).forEach(res => {
                    chartData.push(res.value);
                    console.log('Value1',res.value);
                    chartLabels.push(res.label);
                    console.log('Value1',res.label);
                });
                console.log(chartLabels,chartData);
                if (this.chartType === 'pie') {
                    datasetsList = [
                        {
                            label: this.chartName,
                            backgroundColor: ["#FFB03B", "#4FD2D2", "#94E7A8", "rgb(255, 99, 132)", "#52B7D8", "rgb(255, 205, 86)"],
                            data: chartData,
                        },
                    ]
                }
                else if (this.chartType === 'doughnut') {
                    datasetsList = [
                        {
                            label: this.chartName,
                            //"#3296ED","#4ED4CD" "#9D53F2","#77B9F2","#26ABA4","#C398F5",
                            backgroundColor: ["#9D53F2", "#77B9F2", "#26ABA4", "#C398F5", "#3296ED", "#4ED4CD"],
                            data: chartData,
                        },
                    ]
                }
                else if (this.chartType === 'bar') {
                    datasetsList = [
                        {
                            label: this.chartName,
                            barPercentage: 0.5,
                            barThickness: 6,
                            maxBarThickness: 8,
                            minBarLength: 2,
                            backgroundColor: "#FFB03B",
                            data: chartData,
                        },
                    ];
                    if (this.chartProperties && this.chartProperties.chartType === 'Stacked') {
                        optionsJson.scales = {
                            xAxes: [{
                                stacked: true
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        };
                    }
                }
                else if (this.chartType === 'horizontalBar') {
                    datasetsList = [
                        {
                            axis: 'y',
                            label: this.chartName,
                            barPercentage: 0.5,
                            barThickness: 6,
                            maxBarThickness: 8,
                            maxBarLength: 2,
                            minBarLength: 2,
                            backgroundColor: "#3296ED",
                            data: chartData,
                        },
                    ]
                }
                this.chartConfiguration = {
                    type: this.chartType,
                    data: {
                        labels: chartLabels,
                        datasets: datasetsList,
                    },
                    options: optionsJson,
                };
            }


            
            else {
                getDataForCharts({ vendorId: this.vendorId, chartName: this.chartName })
                    .then(result => {
                        let chartData = [];
                        let chartLabels = [];
                        let datasetsList = [];
                        let optionsJson = {
                            align: 'start',
                            responsive: true,
                            legend: {
                                position: 'top'
                            },
                            animation: {
                                animateScale: true
                            }
                        }
                        result.forEach(res => {
                            chartData.push(res.value);
                            chartLabels.push(res.label);
                        });
                        if (this.chartType === 'pie') {
                            datasetsList = [
                                {
                                    label: this.chartName,
                                    backgroundColor: ["#FFB03B", "#4FD2D2", "#94E7A8", "rgb(255, 99, 132)", "#52B7D8", "rgb(255, 205, 86)"],
                                    data: chartData,
                                },
                            ]
                        }
                        else if (this.chartType === 'doughnut') {
                            datasetsList = [
                                {
                                    label: this.chartName,
                                    //"#3296ED","#4ED4CD" "#9D53F2","#77B9F2","#26ABA4","#C398F5",
                                    backgroundColor: ["#9D53F2", "#77B9F2", "#26ABA4", "#C398F5", "#3296ED", "#4ED4CD"],
                                    data: chartData,
                                },
                            ]
                        }
                        else if (this.chartType === 'bar') {
                            datasetsList = [
                                {
                                    label: this.chartName,
                                    barPercentage: 0.5,
                                    barThickness: 6,
                                    maxBarThickness: 8,
                                    minBarLength: 2,
                                    backgroundColor: "#FFB03B",
                                    data: chartData,
                                },
                            ];
                            if (this.chartProperties && this.chartProperties.chartType === 'Stacked') {
                                optionsJson.scales = {
                                    xAxes: [{
                                        stacked: true
                                    }],
                                    yAxes: [{
                                        stacked: true
                                    }]
                                };
                            }
                        }
                        else if (this.chartType === 'horizontalBar') {
                            datasetsList = [
                                {
                                    axis: 'y',
                                    label: this.chartName,
                                    barPercentage: 0.5,
                                    barThickness: 6,
                                    maxBarThickness: 8,
                                    maxBarLength: 2,
                                    minBarLength: 2,
                                    backgroundColor: "#3296ED",
                                    data: chartData,
                                },
                            ]
                        }
                        this.chartConfiguration = {
                            type: this.chartType,
                            data: {
                                labels: chartLabels,
                                datasets: datasetsList,
                            },
                            options: optionsJson,
                        };
                    }).catch(error => {
                        this.error = error;
                        console.log('error => ' + JSON.stringify(error));
                        this.chartConfiguration = undefined;
                    });
            }
        }
    }
}



// import { LightningElement, wire, track, api } from 'lwc';
// import getDataForBarChart from '@salesforce/apex/rtmvpcRelatedListsController.getDataForBarChart';
// import getDataForHorizontalBarChart from '@salesforce/apex/rtmvpcRelatedListsController.getDataForHorizontalBarChart';
// import getDataForPolarChart from '@salesforce/apex/rtmvpcRelatedListsController.getDataForPolarChart';
// import getDataForDoughnutChart from '@salesforce/apex/rtmvpcRelatedListsController.getDataForDoughnutChart';
// export default class RtmvpcCharts extends LightningElement {
//     @api chartConfiguration;
//     @api chartType;
//     @api label;

//     connectedCallback() {
//         // this.chartType = 'Assessments Status';
//         console.log('Came');
//         if (this.chartType === 'polar') {
//             console.log('polar');
//             getDataForPolarChart({ vendorId: 'a0h5i000004oqZEAAY' })
//                 .then(result => {
//                     let chartData = [];
//                     let chartLabels = Object.keys(result);
//                     console.log(JSON.stringify(result));
//                     for (var key in result) {
//                         chartData.push(result[key]);
//                     }
//                     console.log(chartData);
//                     console.log(chartLabels);
//                     this.chartConfiguration = {
//                         type: 'polarArea',
//                         data: {
//                             labels: chartLabels,
//                             datasets: [
//                                 {
//                                     label: 'Polar chart',
//                                     backgroundColor: ['rgb(255, 205, 86)', 'rgb(255, 99, 132)'],
//                                     data: chartData,
//                                 },
//                             ],
//                         },
//                         options: {
//                             responsive: true,
//                             lanimation: {
//                                 animateScale: true
//                             }
//                         },
//                     };
//                 }).catch(error => {
//                     this.error = error;
//                     console.log('error => ' + JSON.stringify(error));
//                     this.chartConfiguration = undefined;
//                 });
//         }
//         else if (this.chartType === 'horizontal') {
//             console.log('Horizontal');
//             getDataForHorizontalBarChart({ vendorId: 'a0h5i000004oqZEAAY' })
//                 .then(result => {
//                     let chartData = [];
//                     let chartLabels = [];
//                     console.log('Horizontal-->', JSON.stringify(result));
//                     for (var key in result) {
//                         console.log(key);
//                         chartLabels.push(key);
//                         chartData.push(result[key]);
//                         console.log(chartLabels);
//                     }
//                     this.chartConfiguration = {
//                         type: 'horizontalBar',
//                         data: {
//                             labels: chartLabels,
//                             datasets: [
//                                 {
//                                     label: 'Incidents by Project',
//                                     backgroundColor: "#F59623",
//                                     data: chartData,
//                                 },
//                             ],
//                         },
//                         options: {
//                             responsive: true,
//                             legend: {
//                                 position: 'top'
//                             },
//                             animation: {
//                                 animateScale: true
//                             }
//                         },
//                     };
//                 }).catch(error => {
//                     this.error = error;
//                     console.log('error => ' + JSON.stringify(error));
//                     this.chartConfiguration = undefined;
//                 });
//         }
//         else if (this.chartType === 'bar') {
//             console.log('Came2');
//             getDataForBarChart({ vendorId: 'a0h5i000004oqZEAAY' })
//                 .then(result => {
//                     let chartData = [];
//                     let chartLabels = [];
//                     result.forEach(emp => {
//                         chartData.push(emp.Alerts_Count__c);
//                         chartLabels.push(emp.Name);
//                     });
//                     this.chartConfiguration = {
//                         type: 'bar',
//                         data: {
//                             labels: chartLabels,
//                             datasets: [
//                                 {
//                                     axis: 'y',
//                                     label: 'Alerts by Employee',
//                                     barPercentage: 0.5,
//                                     barThickness: 6,
//                                     maxBarThickness: 8,
//                                     minBarLength: 2,
//                                     backgroundColor: "#F59623",
//                                     data: chartData,
//                                 },
//                             ],
//                         },
//                         options: {
//                             responsive: true,
//                             legend: {
//                                 position: 'top'
//                             },
//                             animation: {
//                                 animateScale: true
//                             }
//                         },
//                     };
//                 }).catch(error => {
//                     this.error = error;
//                     console.log('error => ' + JSON.stringify(error));
//                     this.chartConfiguration = undefined;
//                 });
//         }
//         else if (this.chartType === 'doughnut' || this.chartType === 'pie') {
//             getDataForDoughnutChart({ vendorId: 'a0h5i000004oqZEAAY', chart: this.chartType })
//                 .then(result => {
//                     let chartData = [];
//                     let chartLabels = [];
//                     let chartDatasets = [];
//                     var label = '';
//                     console.log(JSON.stringify(result));
//                     if (this.chartType === 'doughnut') {
//                         result.forEach(obj => {
//                             chartData.push(obj["expr0"]);
//                             chartLabels.push(obj.Status);
//                             label = 'Project status';
//                         });
//                         chartDatasets = [
//                             {
//                                 label: label,
//                                 backgroundColor: ['#C7F296', '#94E7A8', '#51D2BB', '#27AAB0', '#116985', '#053661'],
//                                 data: chartData
//                             },
//                         ];
//                     }
//                     else if (this.chartType === 'pie') {
//                         result.forEach(obj => {
//                             chartData.push(obj["expr0"]);
//                             chartLabels.push(obj.Status__c);
//                             label = 'Task Status';
//                         });
//                         chartDatasets = [
//                             {
//                                 label: label,
//                                 backgroundColor: ['#52B7D8', '#E287B2', '#FFB03B', '#54A77B', '#4FD2D2', '#E16032'],
//                                 data: chartData
//                             },
//                         ];
//                     }
//                     this.chartConfiguration = {
//                         type: this.chartType,
//                         data: {
//                             labels: chartLabels,
//                             datasets: chartDatasets,
//                         },
//                         options: {
//                             responsive: true,
//                             legend: {
//                                 position: 'right'
//                             },
//                             animation: {
//                                 animateScale: true,
//                                 animateRotate: true
//                             }
//                         },
//                     };
//                 }).catch(error => {
//                     this.error = error;
//                     console.log('error => ' + JSON.stringify(error));
//                     this.chartConfiguration = undefined;
//                 });
//         }
//         else if (this.chartType === 'Employees vs Onsite') {
//             getDataForPolarChart({ vendorId: 'a0h5i000004oqZEAAY' })
//                 .then(result => {
//                     let chartData = [];
//                     let chartLabels = [];
//                     var label = '';
//                     for (var key in result) {
//                         chartLabels.push(key);
//                         chartData.push(result[key]);
//                     }
//                     label = 'Vendor Employees vs Onsite Employees';
//                     this.chartConfiguration = {
//                         type: 'doughnut',
//                         data: {
//                             labels: chartLabels,
//                             datasets: [
//                                 {
//                                     label: label,
//                                     backgroundColor: [
//                                         'rgb(255,99,132)',
//                                         'rgb(255,159,64)',
//                                         'rgb(255,205,86)',
//                                         'rgb(75,192,192)',
//                                     ],
//                                     data: chartData
//                                 },
//                             ],
//                         },
//                         options: {
//                             responsive: true,
//                             legend: {
//                                 position: 'right'
//                             },
//                             animation: {
//                                 animateScale: true,
//                                 animateRotate: true
//                             }
//                         },
//                     };
//                 }).catch(error => {
//                     this.error = error;
//                     console.log('error => ' + JSON.stringify(error));
//                     this.chartConfiguration = undefined;
//                 });
//         }
//         else if (this.chartType === 'Assessments Status') {
//             getDataForDoughnutChart({ vendorId: 'a0h5i000004oqZEAAY', chart: this.chartType })
//                 .then(result => {
//                     let chartData = [];
//                     let chartLabels = [];
//                     var label = '';
//                     result.forEach(obj => {
//                         chartData.push(obj["statusCount"]);
//                         chartLabels.push(obj.Assesment_Status__c);
//                         label = 'Assessments Status';
//                     });
//                     this.chartConfiguration = {
//                         type: 'pie',
//                         data: {
//                             labels: chartLabels,
//                             datasets: [
//                                 {
//                                     label: label,
//                                     backgroundColor: [
//                                         'rgb(255,99,132)',
//                                         'rgb(255,159,64)',
//                                         'rgb(255,205,86)',
//                                         'rgb(75,192,192)',
//                                     ],
//                                     data: chartData
//                                 },
//                             ],
//                         },
//                         options: {
//                             responsive: true,
//                             legend: {
//                                 position: 'right'
//                             },
//                             animation: {
//                                 animateScale: true,
//                                 animateRotate: true
//                             }
//                         },
//                     };
//                 }).catch(error => {
//                     this.error = error;
//                     console.log('error => ' + JSON.stringify(error));
//                     this.chartConfiguration = undefined;
//                 });
//         }
//     }
// }