import { LightningElement, track, api } from 'lwc';
import getRecsCount from '@salesforce/apex/AssessmentTemplateController.getRecordsCount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'


export default class CustomRecordForm extends LightningElement {

  @api fieldsList;
  @api objName;
  @api templateId;
  @api lookupLabel;
  @track selLookupId;

  connectedCallback() {
    this.fieldsList = JSON.parse(JSON.stringify(this.fieldsList));
  }
  //record on success handler
  handleSuccess(event) {
    const selectedEvent = new CustomEvent('onrefreshdata', { detail: event.detail });
    this.dispatchEvent(selectedEvent);
    // this.handleCancel();
  }

  //for Radio option values
  fieldValueChangeHandler(event) {
    this.fieldsList.forEach(field => {
      if (field.fieldName.toString() === event.currentTarget.dataset.fieldname.toString()) {
        field.value = event.target.value.toString().split('\n').filter(function (r) { return (r != '' || r.trim() != ''); }).join('\r\n');
        console.log(this.fieldsList);
      }
    });
  }

  //get Lookup ID from custom Lookup component
  handleSelectedValue(event) {
    this.selLookupId = event.detail;
    console.log(this.selLookupId);
  }

  //To close the new modal popup
  handleCancel(event) {
    const selectedEvent = new CustomEvent('close', { detail: this.lookupId });
    this.dispatchEvent(selectedEvent);
  }

  //handle Save and new record
  handleSaveNew(event) {
    this.handleCancel();
    this.handleSubmit(event);
    const selEvent = new CustomEvent('onsavenew', { detail: event.detail });
    this.dispatchEvent(selEvent);
  }

  //handle submit for record edit form
  handleSubmit(event) {
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
            console.log('Text Area');
            field.value = event.target.value.toString().split('\n').filter(function (r) { return (r != '' || r.trim() != ''); }).join('\r\n');
            fields[field.fieldName] = field.value;
          }
        });
        if (this.selLookupId != null && this.selLookupId != '') {
          console.log(fields.Rhythm__OptionValueSet__c + 'fields.Rhythm__OptionValueSet__c');
          if ((fields.Rhythm__Question_Type__c === 'Radio' || fields.Rhythm__Question_Type__c === 'Picklist' || fields.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') && (fields.Rhythm__OptionValueSet__c === undefined || fields.Rhythm__OptionValueSet__c === null || fields.Rhythm__OptionValueSet__c === '')) {
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Error',
                message: 'Option Value Set Field is Required',
                variant: 'error',
              }),
            );
          }
          else if (!(fields.Rhythm__Question_Type__c === 'Radio' || fields.Rhythm__Question_Type__c === 'Picklist' || fields.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') && fields.Rhythm__OptionValueSet__c != undefined && fields.Rhythm__OptionValueSet__c != null && fields.Rhythm__OptionValueSet__c.length > 0) {
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
            fields.Rhythm__Assessment_Template__c = this.templateId;
            // this.fieldsList.forEach(field => {
            //   if (field.istextarea === true) {
            //     console.log('Text Area');
            //     fields[field.fieldName] = field.value;
            //   }
            // });
            getRecsCount({ objName: 'Questions' }).then(result => {
              fields.Rhythm__Question_Sequence_Number__c = (typeof result != 'undefined') ? Number(result) + 1 : '0';
              this.template.querySelector('lightning-record-edit-form').submit(fields);
              this.handleCancel();
              this.dispatchEvent(
                new ShowToastEvent({
                  title: 'Success',
                  message: 'successfully created',
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
        fields.Rhythm__Assessment_Template__c = this.templateId;
        getRecsCount({ objName: 'Questions', templateId: this.templateId }).then(result => {
          fields.Rhythm__Section_Sequence_Number__c = (typeof result != 'undefined') ? Number(result) + 1 : '0';
          this.template.querySelector('lightning-record-edit-form').submit(fields);
          this.handleCancel();
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Success',
              message: 'successfully created',
              variant: 'success',
            }),
          );
        }).catch(error => { });
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