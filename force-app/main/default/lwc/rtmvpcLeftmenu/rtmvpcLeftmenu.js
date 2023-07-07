import { LightningElement, api } from 'lwc';
export default class RtmvpcLeftmenu extends LightningElement {
    @api showLeftmenu = false;
    handleRenderUI(event){ 
        const collapseMenuEvent=new CustomEvent("collapsemenu",{
            detail:'clicked'
        });
        this.dispatchEvent(collapseMenuEvent);
        const targetId = event.currentTarget.dataset.id;     
        const targetElement = this.template.querySelector('[data-id="'+targetId+'"]');
        if(targetElement){
            // Remove "active" class from all other elements
            const activeElements = this.template.querySelectorAll('.active');
            activeElements.forEach(element => {
                if(element !== targetElement){
                    element.classList.remove('active');
                }
            });
            
            // Add "active" class to target element
            targetElement.classList.add("active");
        }        
        this.dispatchEvent(new CustomEvent('leftmenu',{detail:targetId}));     
    }
   
}