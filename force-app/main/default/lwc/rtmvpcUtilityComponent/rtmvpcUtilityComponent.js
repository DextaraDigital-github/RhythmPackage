import { LightningElement, track, api } from 'lwc';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';


    const LogRecord=(component,method,classDetail,errorDetail) =>{
         console.log('rrhrr',component);
          errorLogRecord({componentName:component,methodName:method,className:classDetail,errorData:errorDetail}).then((result) => {
           console.log('success');
           
       }).catch((err) => {
             console.log('error');
        
       });
      
    };
   
export {LogRecord};