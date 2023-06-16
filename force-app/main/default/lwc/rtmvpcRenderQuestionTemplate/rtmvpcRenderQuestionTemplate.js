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
    @track responsemap = {};
    @track fileresponsemap = {};
    @track showUploadProgress;
    @api assessmentId;
    @track checkedLabel;
    @api sectionid;
    @track deletefiledata = {};
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
        this.chatterMap.questionId = event.target.dataset.id;
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
        var questionId = (event.target.id).split('_');
        this.fileresponsemap['questionId'] = questionId[0];
        this.fileresponsemap['sectionId'] = this.sectionid;
        this.fileresponsemap['name'] = event.target.files[0].name;
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
                labelsList[i].style.color = "blue";
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