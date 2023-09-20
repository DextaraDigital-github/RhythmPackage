import { LightningElement, track, api } from 'lwc';
import getRecsCount from '@salesforce/apex/AssessmentTemplateController.getRecordsCount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class CustomRecordForm extends LightningElement {

  @api fieldsList;
  @api objName;
  @api templateId;
  @api lookupLabel;
  @track selLookupId;
  @track newFlag = false;
  @track disbaleSave = false;
  @api sectionId;
  @api sectionName;

  connectedCallback() {
    this.fieldsList = JSON.parse(JSON.stringify(this.fieldsList));
  }

  //record on success handler
  handleSuccess(event) {
    this.sectionName = null;
    const selectedEvent = new CustomEvent('onrefreshdata', { detail: event });
    this.dispatchEvent(selectedEvent);
    if (this.newFlag === true) {
      const selEvent = new CustomEvent('savenew');
      this.dispatchEvent(selEvent);
    }
  }

  //To close the new modal popup
  handleCancel(event) {
    const selectedEvent = new CustomEvent('close', { detail: event });
    this.dispatchEvent(selectedEvent);
  }

  //handle Save and new record
  handleSaveNew(event) {
    this.newFlag = true;
    this.handleSubmit(event);
  }

  //handle submit for record edit form
  handleSubmit(event) {
    this.disbaleSave = true;
    var isVal = true;
    this.template.querySelectorAll('lightning-input-field').forEach(element => {
      isVal = isVal && element.reportValidity();
    });

    if (isVal) {
      // event.preventDefault();
      const fields = event.detail.fields;
      if (this.objName === 'Rhythm__Question__c') {
        this.fieldsList.forEach(field => {
          if (field.istextarea === true) {
            field.value = event.target.value.toString().split('\n').filter(function (r) { return (r !== '' || r.trim() !== ''); }).join('\r\n');
            fields[field.fieldName] = field.value;
          }
        });
        if (this.selLookupId !== null && this.selLookupId !== '') {
          if ((fields.Rhythm__Question_Type__c === 'Radio' || fields.Rhythm__Question_Type__c === 'Picklist' || fields.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') && (fields.Rhythm__OptionValueSet__c === undefined || fields.Rhythm__OptionValueSet__c === null || fields.Rhythm__OptionValueSet__c === '')) {
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Error',
                message: 'Option Value Set Field is Required',
                variant: 'error',
              }),
            );
          }
          else if (!(fields.Rhythm__Question_Type__c === 'Radio' || fields.Rhythm__Question_Type__c === 'Picklist' || fields.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') && fields.Rhythm__OptionValueSet__c !== undefined && fields.Rhythm__OptionValueSet__c !== null && fields.Rhythm__OptionValueSet__c.length > 0) {
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Error',
                message: 'Filling Option Value Set is not Required for this Question Type.',
                variant: 'error',
              }),
            );

          }
          else {
            fields.Rhythm__Section__c = this.selLookupId;
            if (typeof this.templateId !== 'undefined') {
              fields.Rhythm__Assessment_Template__c = this.templateId;
            }
            getRecsCount({ objName: 'Questions' }).then(result => {
              fields.Rhythm__Question_Sequence_Number__c = (typeof result !== 'undefined') ? Number(result) + 1 : '0';
              this.template.querySelector('lightning-record-edit-form').submit(fields);
              this.handleCancel(event);
              this.dispatchEvent(
                new ShowToastEvent({
                  title: 'Success',
                  message: 'Successfully Created',
                  variant: 'success',
                }),
              );
            }).catch(error => {
            });
          }
        }
        else {
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Section is Required',
              message: 'Section is Required',
              variant: 'error',
            }),
          );
        }
      }
      else if (this.objName === 'Rhythm__Section__c') {
        if (this.sectionName != '' && this.sectionName != ' ') {
          if (typeof this.templateId !== 'undefined') {
            if (typeof fields !== 'undefined') {
              fields.Rhythm__Assessment_Template__c = this.templateId;
            }
          }
          if (this.sectionId != null && this.sectionId != undefined) {
            fields.Id === this.sectionId;
          }
          getRecsCount({ objName: 'Questions', templateId: this.templateId }).then(result => {
            //fields.Rhythm__Section_Sequence_Number__c = (typeof result !== 'undefined') ? Number(result) + 1 : '0';
            this.template.querySelector('lightning-record-edit-form').submit(fields);
            this.handleCancel(event);
            if (this.sectionId != null && this.sectionId != undefined) {
              this.dispatchEvent(
                new ShowToastEvent({
                  title: 'Success',
                  message: 'Successfully Updated',
                  variant: 'success',
                }),
              );
            }
            else {
              this.dispatchEvent(
                new ShowToastEvent({
                  title: 'Success',
                  message: 'Successfully Created',
                  variant: 'success',
                }),
              );
            }

            this.handleCancel(event);

          }).catch(error => {
          });
        }
        else {
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Error creating record',
              message: 'Please enter all the required fields',
              variant: 'error',
            }),
          );
        }
      }
    }
    else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error creating record',
          message: 'Please enter all the required fields',
          variant: 'error',
        }),
      );
    }
  }
}