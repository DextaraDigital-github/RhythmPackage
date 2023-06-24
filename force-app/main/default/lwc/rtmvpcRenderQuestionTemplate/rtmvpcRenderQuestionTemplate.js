/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/
import { LightningElement, api, track } from 'lwc';
import getResponseFlag from '@salesforce/apex/AssessmentController.getResponseFlag';
import updateAccountAssessmentStatus from '@salesforce/apex/AssessmentController.updateAccountAssessmentStatus';

export default class RtmvpcRenderQuestionTemplate extends LightningElement {
    @api responses; /*questions related to particular section will be stored in this JSON wrapper */
    @track chatterMap = {};
    @api upload;
    @track responsemap = {};
    @track fileresponsemap = {};
    @track showUploadProgress;
    @api assessmentid;
    @track checkedLabel;
    @api sectionid;
    @api accountid;
    @track customeFlagsList=[];
    @api issupplier;
    @track deletefiledata = {};
    @api recid;
    connectedCallback() {
        console.log('responses', this.responses);
        this.chatterMap.openChat = false;
        this.chatterMap.disableSendButton = true;
        for (let i = 0; i < this.responses.length; i++) {
            if (this.responses[i].isCheckbox) {
                if (this.responses[i].value == true)
                    this.checkedLabel = true;

                else {
                    this.checkedLabel = false;
                }
            }
        }
    }
    openReview(event) {

        var quesId = event.currentTarget.dataset.id;
        var flagresponse;
        if(!this.issupplier)
        {

        for(var i=0;i<this.responses.length;i++)
        {
            if(this.responses[i].Id==quesId)
            {
                flagresponse = !(this.responses[i].Rhythm__Flag__c);
            }
        }
        
        console.log('openReview', quesId);
        console.log('this.responses', this.responses);
        getResponseFlag({ questionId: quesId, assessmentId:this.assessmentid }).then((result) => {
            console.log('result', result);
            if(result.length>0)
            {  
                flagresponse = JSON.parse(JSON.stringify(result[0].Rhythm__Flag__c));
            }
            
            this.chatterMap.questionId = quesId;
            this.chatterMap.accountType = 'vendor';
            this.chatterMap.responseflag = flagresponse;
            console.log('this.chatterMap', this.chatterMap);
            if (this.chatterMap.openChat == false) {
                this.chatterMap.openChat = true;
                this.chatterMap.disableSendButton = false;
            }
            else {
                this.chatterMap.openChat = false;
                this.chatterMap.disableSendButton = true;
            }
            const selectedEvent = new CustomEvent('selectchange', {
                detail: this.chatterMap
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);

        }).catch(error => {
            console.log('error', error);
        });
        }

    }

    /*handleChange is used to dispatch an event to its parent component(Questionnaire) and change the response and send back to the parent component*/
    handleChange(event) {
        var changedvalue = event.target.value;
        var questionId = event.currentTarget.dataset.key;
        for (var i = 0; i < this.responses.length; i++) {
            if (this.responses[i].Id == questionId && this.responses[i].isCheckbox == true) {
                if (event.target.checked) {
                    changedvalue = 'true';
                }
                else {
                    changedvalue = 'false';
                }
            }
        }
        var questionId = event.currentTarget.dataset.key;
        this.responsemap['ParentQuestion'] = this.responses[0].parentQuestionId;
        this.responsemap['SectionId'] = this.sectionid;
        this.responsemap['option'] = changedvalue;
        this.responsemap['questionId'] = questionId;
        /*This dispatch event is used to send the data to questionnaire on onchange to perform saving.*/
        const selectedEvent = new CustomEvent('valuechange', {
            bubbles: true,
            detail: this.responsemap
        });
        //dispatches event
        this.dispatchEvent(selectedEvent);
    }

    /* openChatHandler is used to dispatch an event to its parent component(Questionnaire) by sending
       the questionId to parent component to open chat conversation */
    openChatHandler(event) {
        var quesId = event.currentTarget.dataset.id;
        console.log('event.cuurentTarget.dataset.id', event.currentTarget.dataset.id);
        console.log('this.chatterMap',this.chatterMap +'');
        if(this.issupplier)
        {
            this.chatterMap.accountType = 'supplier';
        }
        else
        {
            this.chatterMap.accountType = 'vendor';

        }
        
        if (this.chatterMap.openChat == false) {
            this.chatterMap.openChat = true;
            this.chatterMap.disableSendButton = false;
        }
        else {
            if(this.chatterMap.questionId!=quesId)
            {                
                this.chatterMap.openChat = true;
                this.chatterMap.disableSendButton = false;
            }
            else
            {
                this.chatterMap.openChat = false;
                this.chatterMap.disableSendButton = true;
            }
            
        }
        this.chatterMap.questionId = quesId;
        const selectedEvent = new CustomEvent('selectchange', {
            detail: this.chatterMap
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    /* getShowUploadStatus  is used to show progressbar while uploading the file.This method will be invoked from Questionnaire component.*/
    @api
    getShowUploadStatus() {
        console.log('this.showUploadProgress',this.showUploadProgress);
        this.showUploadProgress = false;
        console.log('this.showUploadProgress',this.showUploadProgress);
    }

    /* handlechildchange is used to dispatch the value to parent component(Questionnaire) on value change*/
    handlechildchange(event) {
        const selectedEvent = new CustomEvent('valuechange', {
            bubbles: true,
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
    @api
    checkCustomerFlags()
    {
        var boolflag;
        var param={};
        var status;
        console.log('In Child');
        if(this.responses[0].customerFlag==true)
        {
            for(var i=0;i<this.responses.length;i++)
            {
                if(this.responses[i].Rhythm__Flag__c)
                {
                    boolflag = true;
                }
            }
        }
        if(boolflag)
        {
            status ='Need more information';
        }
        else
        {
            status ='Review Completed';
        }
        param.assessmentStatus = status;
        console.log('this.recid',this.recid);
        param.recId = this.recid;
        const selectedEvent = new CustomEvent('flagenable', {
                bubbles: true,
                detail: param
            });
            /* dispatches event */
            this.dispatchEvent(selectedEvent);
            //console.log('dispatch error',selectedEvent);
    }
  

    /* uploadFilesHandler is used to dispatch the file blob value to parent component(Questionnaire) with the loading on uploading the attachment*/
    uploadFilesHandler(event) {
        var x = new FileReader();
        var questionId = (event.target.id).split('_');
        this.fileresponsemap['questionId'] = questionId[0];
        this.fileresponsemap['sectionId'] = this.sectionid;
        this.fileresponsemap['name'] = event.target.files[0].name;
        if(typeof questionId[0]!='undefined')
        {
            for(var i=0;i<this.responses.length;i++)
            {
                if(this.responses[i].Id==questionId[0])
                {
                    this.fileresponsemap['type'] = this.responses[i].type;
                    this.fileresponsemap['flag'] = this.responses[i].Rhythm__Flag__c;
                    this.fileresponsemap['conversationHistory'] = this.responses[i].Rhythm__Conversation_History__c;
                }
               
            }
        }
        this.fileresponsemap['url'] = URL.createObjectURL(event.target.files[0]);
        let type = (event.target.files[0].name).split('.');
        this.fileresponsemap['type'] = type[1];
        var file = event.target.files[0].name;
        this.showUploadProgress = true;
        this.fileresponsemap['isPng'] = false;
        this.fileresponsemap['isPdf'] = false;
        this.fileresponsemap['isCsv'] = false;
        this.fileresponsemap['isDocx'] = false;
        switch (this.fileresponsemap['type']) {
            case "png": this.fileresponsemap.isPng = true; break;
            case "jpg": this.fileresponsemap.isPng = true; break;
            case "jpeg": this.fileresponsemap.isPng = true; break;
            case "pdf": this.fileresponsemap.isPdf = true; break;
            case "csv": this.fileresponsemap.isCsv = true; break;
            case "docx": this.fileresponsemap.isDocx = true; break;
            case "doc": this.fileresponsemap.isDocx = true; break;
        }
        var s = x.readAsDataURL(event.target.files[0]);
        x.addEventListener("loadend", (event) => {
            this.fileresponsemap['filedata'] = x.result;
            this.fileresponsemap['showUploadProgress'] = this.showUploadProgress;
            /*To upload file and save the file in the record */

            const selectedEvent = new CustomEvent('fileupload', {
                bubbles: true,
                detail: this.fileresponsemap
            });
            /* dispatches event */
            this.dispatchEvent(selectedEvent);
        });
    }

    /* handlefilechange is used to dispatch the file blob value to parent component(Questionnaire) with the loading on uploading the attachment*/

    handlefilechange(event) {
        const selectedEvent = new CustomEvent('fileupload', {
            bubbles: true,
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }

    /* deleteFile is used to dispatch the removed file value to parent component(Questionnaire) for removing */

    deleteFile(event) {
        this.deletefiledata['questionId'] = event.target.dataset.id;
        this.deletefiledata['name'] = event.target.dataset.key;
        this.deletefiledata['sectionId'] = this.sectionid;
        const selectedEvent = new CustomEvent('deleteattachment', {
            bubbles: true,
            detail: this.deletefiledata
        });
        this.dispatchEvent(selectedEvent);
    }

    /* handledeletefile is used to dispatch the removed file value to parent component(Questionnaire) for removing */
    handledeletefile(event) {
        const selectedEvent = new CustomEvent('deleteattachment', {
            bubbles: true,
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }

    /* highlightQuestionHandler method is used to highlight the selected question and remove highligh for other questions in same section. It also sends an event to parent component to remove highlight for questions in other sections, if any.*/
    highlightQuestionHandler(event) {
        var labelsList = this.template.querySelectorAll('.qactivelabelcont');
        for (var i = 0; i < labelsList.length; i++) {
            if (labelsList[i].dataset.id.toString() === event.currentTarget.dataset.id.toString()) {
                labelsList[i].style.color = "#2D67C5";
                labelsList[i].style.backgroundColor = "#f4f6f9";
                labelsList[i].style.fontWeight = "500";
            }
            else {
                labelsList[i].style.color = "";
                labelsList[i].style.backgroundColor = "";
                labelsList[i].style.fontWeight = "";
            }
        }
        /*To highlight the question when clicked on the flag */

        const selectquestion = new CustomEvent('selectquestion', {
            detail: {
                id: event.currentTarget.dataset.id
            }
        });
        this.dispatchEvent(selectquestion);
    }

    /* selectquestionHandler method is used to dispatch an event to its parent component till it reaches the questionnaire component, in case of any nested questions */
    selectquestionHandler(event) {
        const selectquestion = new CustomEvent('selectquestion', {
            detail: {
                id: event.detail.id
            }
        });
        this.dispatchEvent(selectquestion);
    }

    /* removehighlightHandler method is used to remove highlight for questions. This method will be invoked from questionnaire component*/
    @api
    removehighlightHandler(id) {
        if (typeof id != 'undefined') {
            var labelsList = this.template.querySelectorAll('.qactivelabelcont');
            for (var i = 0; i < labelsList.length; i++) {
                if (labelsList[i].dataset.id.toString() != id.toString()) {
                    labelsList[i].style.color = "";
                    labelsList[i].style.backgroundColor = "";
                    labelsList[i].style.fontWeight = "";
                }
            }
        }
    }

}