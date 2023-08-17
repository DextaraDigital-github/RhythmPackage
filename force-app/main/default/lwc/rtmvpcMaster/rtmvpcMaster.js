import { LightningElement, track,wire} from 'lwc';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { loadStyle } from 'lightning/platformResourceLoader';
import RtmFonts from '@salesforce/resourceUrl/rtmfonts';
import RtmvpcStylesCSS from '@salesforce/resourceUrl/rtmvpcstyles';
import RtmvpcLogosymbolPic1 from '@salesforce/resourceUrl/rtmlogosymbol';
//import RtmvpcLogotypePic1 from '@salesforce/resourceUrl/rtmlogofull1';
import RtmvpcLogofullPic1 from '@salesforce/resourceUrl/rtmlogofull';
import getUserName from '@salesforce/apex/AssessmentController.getUserName';
import getCommunityURL from '@salesforce/apex/AssessmentController.getCommunityURL';

//import RtmvpcLogoPic1 from '@salesforce/contentAssetUrl/rtmvpclogo1';

export default class RtmvpcMaster extends NavigationMixin(LightningElement) {
    rtmvpclogosymbolpic1Url = RtmvpcLogosymbolPic1;
    rtmvpclogotypepic1Url = '';//RtmvpcLogotypePic1;
    rtmvpclogofullpic1Url = RtmvpcLogofullPic1;

    isHome = false; 
    isInbox = false;
     isAction = false; 
    isCalendar = false; 
    isAssessments = false; 
    isProjects = false; 
    isRFPs = false; 
    isEmployees = false; 
    isDocuments = false; 
    isResources = false; 
    isProfile = false; 
    isCompilance = false; 
    isAdmin = false; 
    isReports = false; 
    isDashboard = false; 
    isSettings = false;
    @track userName;
    @track logoutURL;
    @track activeRecId;
    @track activemenuitem;

    
    handleUserName()
    {
        /*getUserName is used to get the username */
      getUserName({}).then((result) => {
         this.userName = result;
      });
      getCommunityURL({}).then((resultURL) => {
         this.logoutURL = resultURL;
      });      
    }

    renderedCallback() {        
        Promise.all([            
            loadStyle(this, RtmFonts + '/line-awesome/line-awesome.css'),
            loadStyle(this, RtmFonts + '/SourceSansPro/SourceSansPro.css'),
            loadStyle(this, RtmvpcStylesCSS ),
            //loadScript(this, leaflet + '/leaflet.js'),
            ]);
            

    }

    openTaskHandler(event)
    {
        this.activeRecId=event.detail.assessmentId;
        this.activemenuitem=event.detail.category;
        if(typeof this.activeRecId !='undefined')
        {
            this.isHome = false; 
            this.isInbox = false; 
            this.isCalendar = false; 
            this.isAssessments = true; 
            this.isProjects = false; 
            this.isRFPs = false; 
            this.isEmployees = false; 
            this.isDocuments = false; 
            this.isResources = false; 
            this.isProfile = false; 
            this.isCompilance = false; 
            this.isAdmin = false; 
            this.isReports = false; 
            this.isDashboard = false; 
            this.isSettings = false;
        }
        this.template.querySelector('c-rtmvpc-leftmenu').changeactivemenuitem();
    }

    handleRenderUI(event){
        let data;
        this.isHome = false; 
        this.isInbox = false; 
        this.isCalendar = false; 
        this.isAssessments = false; 
        this.isProjects = false; 
        this.isRFPs = false; 
        this.isEmployees = false; 
        this.isDocuments = false; 
         this.isAction = false;
        this.isResources = false; 
        this.isProfile = false; 
        this.isCompilance = false; 
        this.isAdmin = false; 
        this.isReports = false; 
        this.isDashboard = false; 
        this.isSettings = false;
          console.log('this.isAssessments',this.isAssessments);
        if (event.detail === 'Inbox') {
            this.isInbox = true;
            data = 'Rhythm__Inbox__c';
           
        }
        else if(event.detail === 'Home') {this.isHome = true; }
        else if(event.detail === 'Calendar'){this.isCalendar = true; }
       
       else if (event.detail === 'Assessments') {
            this.isAssessments = true;
            data = 'Rhythm__Assessments__c';
        }
        else if(event.detail === 'Projects'){this.isProjects = true; }
        else if(event.detail === 'RFPs'){this.isRFPs = true; }
        else if(event.detail === 'Employees'){this.isEmployees = true; }
        else if(event.detail === 'Documents'){this.isDocuments = true; }
        else if(event.detail === 'Resources'){this.isResources = true; }
        else if(event.detail === 'Profile'){this.isProfile = true; }
        else if(event.detail === 'Admin'){this.isAdmin = true; }
        else if (event.detail === 'Action') {
            this.isAction = true;
            data = 'Rhythm__Action__c';
        }
        console.log('this.isAssessments',this.isAssessments);

        const pageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Home' // Replace with your community page name
            },
            state: {
                // Define your parameters here
                navigate: data
            }
        };
        // Navigate to the community page
        this[NavigationMixin.Navigate](pageRef);
        if(this.isAssessments === true)
        {
             this.template.querySelector('c-rtmvpc-assessments').handleInbox();
        }

    }

    changeMenu(menuName)
    {
        //if(event.detail === 'Inbox'){ this.isInbox = true; }
        if(menuName === 'Home') {this.isHome = true; }
        //else if(menuName === 'Calendar'){}
        else if(menuName === 'Assessments'){this.isAssessments = true; }
        else if(menuName === 'Projects'){this.isProjects = true; }
        else if(menuName === 'RFPs'){this.isRFPs = true; }
        else if(menuName === 'Employees'){this.isEmployees = true; }
        else if(menuName === 'Documents'){this.isDocuments = true; }
        else if(menuName === 'Resources'){this.isResources = true; }
        else if(menuName === 'Profile'){this.isProfile = true; }
        else if(menuName === 'Admin'){this.isAdmin = true; }
    }
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        console.log('current', typeof currentPageReference.state?.Rhythm__Action__c);

        if (typeof currentPageReference.state?.Rhythm__Action__c !== 'undefined') {
            this.urlId = currentPageReference.state?.Rhythm__Action__c;
            console.log('inaction');
        }
        if (typeof currentPageReference.state?.navigate !== 'undefined') {
            this.openClicked = currentPageReference.state?.navigate;
            console.log('inaction', this.openClicked);
        }
    }

    toggleMenu() {
        const leftMenu = this.template.querySelector('[data-id="leftmenu"]');
        leftMenu.classList.toggle('show');
      }
    connectedCallback(){
        if (typeof this.urlId === 'undefined') {
            this.isAssessments = true;
        }
        if (typeof this.openClicked !== 'undefined') {
            this.isAssessments = false;
            if (this.openClicked === 'Rhythm__Inbox__c') { this.isInbox = true; }
            if (this.openClicked === 'Rhythm__Action__c') { this.isAction = true; }
            if (this.openClicked === 'Rhythm__Assessments__c') { this.isAssessments = true; }

        }
        if (typeof this.urlId !== 'undefined') {

            console.log('this.isAction', this.isAction);
            this.isAction = true;
        }
        this.template.addEventListener('leftmenu', this.handleLeftMenu.bind(this));
    }
    handleLeftMenu(event) {
        const targetId = event.detail;
        const targetElement = this.template.querySelector('[data-id="'+targetId+'"]');
        if(targetElement){
            targetElement.classList.remove("show");
        }
    }
    collapseMenuHandler()
    {
        var ele=this.template.querySelectorAll('[data-id="leftmenu"]');
        ele[0].classList.remove("show");
    }

}