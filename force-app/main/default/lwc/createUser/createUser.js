import { LightningElement,api,wire,track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createUser from '@salesforce/apex/UserController.createUser';
export default class CreateUser extends LightningElement {

    contactId;
    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          this.contactId = currentPageReference.state.recordId;
        }
    }

    handleCreate(){
        
        createUser({contactId:this.contactId})
        .then((result) => {
            if(result.isSuccess){
                this.showNotification('Success','User Created Successfully.','success');
                this.closeModal();
            }else{
                this.showNotification('Error',result.message,'error');
            }
        })
        .catch((error) => {
            
        });
    }

    closeModal(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    showNotification(title,message,variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

}