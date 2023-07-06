import { LightningElement } from 'lwc';

export default class RtmvpcEmployees extends LightningElement {
    
    // @api navList = [{"level":0,"tableLabel":"Employees"}];
    // @api activeNavItem;
    // @api navName='';
    // gotobannerHandler(event)
    // {
    //     this.navList=JSON.parse(JSON.stringify(event.detail));
    //     console.log('Employees ',JSON.stringify(this.navList));
    //     this.activeNavItem = undefined;
    //     if(this.navList.length>1)
    //     {
    //         this.activeNavItem = this.navList.pop();
    //     }
    //     else if(this.navList.length===0)
    //     {
    //         this.navList = [{"level":0,"tableLabel":"Employees"}];
    //     }
    // }
    // gotobannerOnBackClickHandler(event)
    // {
    //     this.activeNavItem = undefined;
    //     this.navList=JSON.parse(JSON.stringify(event.detail));
    //     console.log('Projects',JSON.stringify(this.navList));
    //     if(this.navList.length>1)
    //     {
    //         this.activeNavItem = this.navList.pop();
    //     }
    //     else
    //     {
    //         this.navList = [{"level":0,"tableLabel":"Employees"}];
    //     }
    // }
}