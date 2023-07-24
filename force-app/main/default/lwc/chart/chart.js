import {LightningElement, api, track} from 'lwc';
//import chartjs2 from '@salesforce/resourceUrl/chartjs2';
//import {loadScript} from 'lightning/platformResourceLoader';
//import {ShowToastEvent} from 'lightning/platformShowToastEvent';
//import { loadScript } from 'c/resourceLoader';

export default class Chart extends LightningElement {
 @api loaderVariant = 'base';
 @api chartConfig;

 @track isChartJsInitialized;
 /*renderedCallback() {
  if (this.isChartJsInitialized) {
   return;
  }

  Promise.all([loadScript(chartjs2)])
   .then(() => {
    this.isChartJsInitialized = true;
    const ctx = this.template.querySelector('canvas.barChart').getContext('2d');
    this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfig)));
    this.chart.canvas.parentNode.style.height = 'auto';
    this.chart.canvas.parentNode.style.width = '100%';
   })
   .catch(error => {     
    this.dispatchEvent(
     new ShowToastEvent({
      title: 'Error loading ChartJS',
      message: JSON.stringify(error),
      variant: 'error',
     })
    );
   });

 }
 */
}