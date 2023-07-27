/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/
import { LightningElement, api, track } from 'lwc';
export default class RtmvpcRenderQuestionTemplate extends LightningElement {
    @api responses; /*questions related to particular section will be stored in this JSON wrapper */
    @track chatterMap = {};
    @api upload;
    @api isPreviewComponent;
    @api conditionaval;
    @api accountassessmentid;
    @track responsemap = {};
    @track fileresponsemap = {};
    @track showUploadProgress;
    @api assessmentid;
    @track checkedLabel;
    @api accountassessment;
    @api sectionid;
    @api accountid;
    @track customeFlagsList = [];
    @api issupplier;
    @track deletefiledata = {};
    @api recid;
    @track acceptedFormats = ['.pdf', '.png', '.pdf', '.csv', '.docx'];
    @api uploadingFile = false;
     @api showicon;
    @api timeline;
    @track conditionaldisplay= false;
    connectedCallback() {
        if(typeof this.conditionaval!=='undefined'){
            this.conditionaldisplay = true;
        }
        console.log('isSupplier',this.issupplier);
        console.log('Responses',this.responses);
        this.chatterMap.openChat = false;
        this.chatterMap.disableSendButton = true;
        if (this.responses && this.responses.length > 0) {
            this.responses.forEach(res => {
                if (res.isCheckbox) {
                    if (res.value === true)
                        this.checkedLabel = true;
                    else {
                        this.checkedLabel = false;
                    }
                }
            });
        }

    }
    /* deleteForm is used to delete the CAPA form for a question by dispatching the questionId to its parent Component
       Questionnaire */
    // deleteForm(event){
    //      let questionData=event.currentTarget.dataset.id;
    //      const selectedAction = new CustomEvent('removeicon', {
    //      detail: questionData
    // });
    // this.dispatchEvent(selectedAction);
    // }
    // handleRemove(event){
    //      const selectedAction = new CustomEvent('removeicon', {
    //      detail: event.detail
    // });
    // this.dispatchEvent(selectedAction);

    // }
      /* handleReject is used to change the status of a question to reject,rejected or approved by onClick and dispatch the
       data to its parent component (Questionnaire) */
    handleReject(event){
        console.log('koushik',this.responses);
        var quesId = event.currentTarget.dataset.id;
        var label= event.target.label;
        var rejectMap={};
        rejectMap.questionId=quesId;
        if(!this.issupplier){
            if(this.responses && this.responses.length > 0){
                this.responses.forEach(res => {
                    if(res.Id === quesId){
                        if(label === 'Reject' || label ==='Rejected'){
                         
                        rejectMap.rejectResponse = !(res.rejectButton);
                           console.log('label', rejectMap.rejectResponse);
                        this.timeline.forEach(res=>{
                              if(res.status === 'Need More Information'){                             
                                  rejectMap.needData = !(res.needData);
                              }
                          })                   
                        }
                        else{
                            rejectMap.needData = !(res.needData);
                        }
                    }
                    
                })
            }
             const selectedEvent = new CustomEvent('rejectchange', {
                 bubbles:true,
                detail:rejectMap
            });
             this.dispatchEvent(selectedEvent);
           
        }
    }

    handleRejectButton(event){
        console.log('koushik123');
         const selectedEvent = new CustomEvent('rejectchange', {
                bubbles : true,
                detail:event.detail
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);
           
            
        }

 

     /* openActionForm is used to open the CAPA form and dispatch the questionId to its parent component(Questionnaire) */
    openActionForm(event)
    {
        console.log('openaction',event.currentTarget.dataset.id);
        let actionMap={};
        actionMap.quesId=event.currentTarget.dataset.id;
        actionMap.showCapaForm=false;
 
         const selectedEvent = new CustomEvent('actionchange', {
                detail: actionMap
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);

    }
    handleActionChange(event){
        const selectedEvent = new CustomEvent('actionchange', {
                detail: event.detail
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);


    }

    openReview(event) {
        var quesId = event.currentTarget.dataset.id;
        var flagresponse;
        if (!this.issupplier) {
            if (this.responses && this.responses.length > 0) {
                this.responses.forEach(res => {
                    if (res.Id === quesId) {
                        flagresponse = !(res.Rhythm__Flag__c);
                    }
                })
            }
            this.chatterMap.questionId = quesId;
            this.chatterMap.accountType = 'vendor';
            this.chatterMap.responseflag = flagresponse;
            if (this.chatterMap.openChat === false) {
                this.chatterMap.openChat = true;
                this.chatterMap.disableSendButton = false;
            }
            else {
                this.chatterMap.openChat = false;
                this.chatterMap.disableSendButton = true;
            }
            console.log('this.chatterMap',this.chatterMap);
            const selectedEvent = new CustomEvent('flagchange', {
                detail: this.chatterMap
            });
            this.dispatchEvent(selectedEvent);
        }
    }
    handlecustomerFlag(event)
    {
        const selectedEvent = new CustomEvent('flagchange', {
                detail: event.detail
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);
    }

    /*handleChange is used to dispatch an event to its parent component(Questionnaire) and change the response and send back to the parent component*/
    handleChange(event) {
        var changedvalue = event.target.value;
        let questionId = event.currentTarget.dataset.key;
        let parentQuestionId;
        if (this.responses && this.responses.length > 0) {
            this.responses.forEach(res => {
                if ((typeof changedvalue === 'undefined' || changedvalue === '' || changedvalue === '[]') && res.Id === questionId) {
                    if (typeof res.defaultValue !== 'undefined') {
                        changedvalue = res.defaultValue;
                    }
                }
                if (res.Id === questionId) {
                    if(typeof res.conditional!=='undefined'){
                        parentQuestionId = res.parentQuestionId;
                    }
                    if (res.isCheckbox === true) {
                        if (event.target.checked) {
                            changedvalue = true;
                        }
                        else {
                            changedvalue = false;
                        }
                    }
                }
            });
        }
        console.log('parentQuestionId',parentQuestionId);
        this.responsemap.parent = parentQuestionId;
        this.responsemap.SectionId = this.sectionid;
        this.responsemap.option = changedvalue;
        this.responsemap.questionId = questionId;
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
    openChatHandler() {


    }

    /* getShowUploadStatus  is used to show progressbar while uploading the file.This method will be invoked from Questionnaire component.*/
    @api
    getShowUploadStatus() {
        this.showUploadProgress = false;
    }

    /* handlechildchange is used to dispatch the value to parent component(Questionnaire) on value change*/
    handlechildchange(event) {
        const selectedEvent = new CustomEvent('valuechange', {
            bubbles: true,
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }

    /* uploadFilesHandler is used to dispatch the file blob value to parent component(Questionnaire) with the loading on uploading the attachment*/
    uploadFilesHandler(event) {
        var x = new FileReader();
        var questionId = (event.currentTarget.dataset.id);
        this.fileresponsemap.questionId = questionId;
        this.fileresponsemap.sectionId = this.sectionid;
        this.fileresponsemap.name = event.target.files[0].name;
        if (typeof questionId !== 'undefined') {
            if (this.responses && this.responses.length > 0) {
                this.responses.forEach(res => {
                    if (res.Id === questionId) {
                        this.fileresponsemap.type = res.type;
                        this.fileresponsemap.flag = res.Rhythm__Flag__c;
                        this.fileresponsemap.conversationHistory = res.Rhythm__Conversation_History__c;
                    }
                })
            }
        }
        let type = (event.target.files[0].name).split('.');
        this.fileresponsemap.type = type[1];
        this.showUploadProgress = true;
        this.fileresponsemap.isPng = false;
        this.fileresponsemap.isPdf = false;
        this.fileresponsemap.isCsv = false;
        this.fileresponsemap.isDocx = false;
        switch (this.fileresponsemap.type) {
            case "png": this.fileresponsemap.isPng = true; break;
            case "jpg": this.fileresponsemap.isPng = true; break;
            case "jpeg": this.fileresponsemap.isPng = true; break;
            case "pdf": this.fileresponsemap.isPdf = true; break;
            case "csv": this.fileresponsemap.isCsv = true; break;
            case "docx": this.fileresponsemap.isDocx = true; break;
            case "doc": this.fileresponsemap.isDocx = true; break;
            default: console.log('default');
        }
        x.addEventListener("loadend", () => {
            this.fileresponsemap.filedata = x.result;
            this.fileresponsemap.showUploadProgress = this.showUploadProgress;
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
        this.deletefiledata.questionId = event.target.dataset.id;
        this.deletefiledata.name = event.target.dataset.key;
        this.deletefiledata.sectionId = this.sectionid;
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

    handleQuestionHighlight(event)
    {
        let child = this.template.querySelectorAll('c-rtmvpc-render-question-template');
        if(typeof child != 'undefined' && child.length > 0)
        {
            child[0].removehighlightHandler('id');
        }
        const removequeshighlight = new CustomEvent('removequeshighlight',{detail:'id'});
        this.dispatchEvent(removequeshighlight);
        this.highlightQuestionHandler(event);
    }
    /* highlightQuestionHandler method is used to highlight the selected question and remove highligh for other questions in same section. It also sends an event to parent component to remove highlight for questions in other sections, if any.*/
    highlightQuestionHandler(event) {
        var labelsList = this.template.querySelectorAll('.qactivelabelcont');
        if (labelsList && labelsList.length > 0) {
            labelsList.forEach(label => {
                if (typeof event != 'undefined' && label.dataset.id.toString() === event.currentTarget.dataset.id.toString()) {
                    label.style.color = "#2D67C5";
                    label.style.backgroundColor = "#f4f6f9";
                    label.style.fontWeight = "500";
                }
                else {
                    label.style.color = "";
                    label.style.backgroundColor = "";
                    label.style.fontWeight = "";
                }
            })
        }

        /*To highlight the question when clicked on the flag */
        const selectquestion = new CustomEvent('selectquestion', {
            detail: {
                id: event.currentTarget.dataset.id
            }
        });
        this.dispatchEvent(selectquestion);
        let quesId = event.currentTarget.dataset.id;
        if (this.issupplier) {
            this.chatterMap.accountType = 'supplier';
        }
        else {
            this.chatterMap.accountType = 'vendor';
        }

        if (this.chatterMap.openChat === false) {
            this.chatterMap.openChat = true;
            this.chatterMap.disableSendButton = false;
        }
        else {
            if (this.chatterMap.questionId !== quesId) {
                this.chatterMap.openChat = true;
                this.chatterMap.disableSendButton = false;
            }
            else {
                this.chatterMap.openChat = false;
                this.chatterMap.disableSendButton = true;
            }
        }
        this.chatterMap.questionId = quesId;
         this.chatterMap.showCapaForm=true;
        const selectedEvent = new CustomEvent('selectchange', {
            detail: this.chatterMap
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);

    }
    handleConversationHistory(event)
    {
        const selectedEvent = new CustomEvent('selectchange', {
            detail: event.detail
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
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
        if (typeof id !== 'undefined') {
            let labelsList = this.template.querySelectorAll('.qactivelabelcont');
            if (labelsList && labelsList.length > 0) {
                labelsList.forEach(label => {
                    if (label.dataset.id.toString() !== id.toString()) {
                        label.style.color = "";
                        label.style.backgroundColor = "";
                        label.style.fontWeight = "";
                    }
                })
            }
        }
    }

    @api
    fileUploadHandler() {
        this.uploadingFile = true;
    }
}