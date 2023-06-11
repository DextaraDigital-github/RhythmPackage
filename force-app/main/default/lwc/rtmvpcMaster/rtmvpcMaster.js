import { LightningElement, track, wire, api  } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import RtmFonts from '@salesforce/resourceUrl/rtmfonts';
import RtmvpcStylesCSS from '@salesforce/resourceUrl/rtmvpcstyles';
import RtmvpcLogosymbolPic1 from '@salesforce/resourceUrl/rtmlogosymbol';
//import RtmvpcLogotypePic1 from '@salesforce/resourceUrl/rtmlogofull1';
import RtmvpcLogofullPic1 from '@salesforce/resourceUrl/rtmlogofull';



//import RtmvpcLogoPic1 from '@salesforce/contentAssetUrl/rtmvpclogo1';

export default class RtmvpcMaster extends NavigationMixin(LightningElement) {
    

    rtmvpclogosymbolpic1Url = RtmvpcLogosymbolPic1;
    rtmvpclogotypepic1Url = '';//RtmvpcLogotypePic1;
    rtmvpclogofullpic1Url = RtmvpcLogofullPic1;

     isHome = true;
    isHome = false; 
    isInbox = false; 
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
    @api activeRecId;
    @api activemenuitem;

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
        console.log(this.activeRecId);
    }

    handleRenderUI(event){
        console.log('event.detail --> ',event.detail);

                this.isHome = false; 
                this.isInbox = false; 
                this.isCalendar = false; 
                this.isAssessments = false; 
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

                if(event.detail == 'Inbox'){ this.isInbox = true; }
                else if(event.detail == 'Home') {this.isHome = true; }
                else if(event.detail == 'Calendar'){this.isCalendar = true; }
                else if(event.detail == 'Assessments'){this.isAssessments = true; }
                else if(event.detail == 'Projects'){this.isProjects = true; }
                else if(event.detail == 'RFPs'){this.isRFPs = true; }
                else if(event.detail == 'Employees'){this.isEmployees = true; }
                else if(event.detail == 'Documents'){this.isDocuments = true; }
                else if(event.detail == 'Resources'){this.isResources = true; }
                else if(event.detail == 'Profile'){this.isProfile = true; }
                else if(event.detail == 'Admin'){this.isAdmin = true; }

               console.log('this.isHome -- ',this.isHome );
                console.log('this.isInbox -- ',this.isInbox );
                console.log('this.isCalendar -- ',this.isCalendar );
                console.log('this.isAssessments -- ',this.isAssessments );
                console.log('this.isProjects -- ',this.isProjects);
                console.log('this.isRFPs -- ',this.isRFPs );
                console.log('this.isEmployees -- ',this.isEmployees );
                console.log('this.isDocuments -- ',this.isDocuments );
                console.log('this.isResources -- ',this.isResources );
                console.log('this.isProfile -- ',this.isProfile ); 
                console.log('this.isCompilance -- ',this.isCompilance ); 
                console.log('this.isAdmin -- ',this.isAdmin );
                console.log('this.isReports -- ',this.isReports ); 
                console.log('this.isDashboard -- ',this.isDashboard );
                console.log('this.isSettings -- ',this.isSettings);
               
                //setTimeout(function(){ this.changeMenu(event.detail);}.bind(this),2000);


            //      if(event.detail == 'Home') {this.isHome = true; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Inbox'){this.isHome = false; this.isInbox = true; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Calendar'){this.isHome = false; this.isInbox = false; this.isCalendar = true; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Assessments'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = true; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Projects'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = true; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'RFPs'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = true; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Employees'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = true; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Documents'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = true; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Resources'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = true; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Profile'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = true; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// //else if(event.detail == 'Compilance'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = true; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			// else if(event.detail == 'Admin'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = true; this.isReports = false; this.isDashboard = false; this.isSettings = false;}
			//else if(event.detail == 'Reports'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = true; this.isDashboard = false; this.isSettings = false;}
			//else if(event.detail == 'Dashboard'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = true; this.isSettings = false;}
			//else if(event.detail == 'Settings'){this.isHome = false; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = true;}
			//   else{this.isHome = true; this.isInbox = false; this.isCalendar = false; this.isAssessments = false; this.isProjects = false; this.isRFPs = false; this.isEmployees = false; this.isDocuments = false; this.isResources = false; this.isProfile = false; this.isCompilance = false; this.isAdmin = false; this.isReports = false; this.isDashboard = false; this.isSettings = false;}

    }

    changeMenu(menuName)
    {
        alert(menuName);
        if(event.detail == 'Inbox'){ this.isInbox = true; }
                else if(event.detail == 'Home') {this.isHome = true; }
                else if(menuName == 'Calendar'){alert('Calendar');this.isCalendar = true; }
                else if(menuName == 'Assessments'){this.isAssessments = true; }
                else if(menuName == 'Projects'){this.isProjects = true; }
                else if(menuName == 'RFPs'){this.isRFPs = true; }
                else if(menuName == 'Employees'){this.isEmployees = true; }
                else if(menuName == 'Documents'){this.isDocuments = true; }
                else if(menuName == 'Resources'){this.isResources = true; }
                else if(menuName == 'Profile'){this.isProfile = true; }
                else if(menuName == 'Admin'){this.isAdmin = true; }
    }

    toggleMenu() {
        //const header = this.template.querySelector('.header');
        const leftMenu = this.template.querySelector('[data-id="leftmenu"]');
        //header.classList.toggle('show-menu');
        leftMenu.classList.toggle('show');
      }
    connectedCallback(){
        this.isAssessments = true;
        //this.isInbox = true;
        //this.isHome = true;
        this.template.addEventListener('leftmenu', this.handleLeftMenu.bind(this));
       // this.disableBackButton();
    }
    
    // disableBackButton() {
    //     history.pushState(null, null, location.href);
    //     window.onpopstate = () => {
    //         history.go(1);
    //     };
    // }
    // handleForward() {
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__forward',
    //     });
    // }

    // handleContextMenu(event) {
    //     event.preventDefault();
    // }

    handleLeftMenu(event) {
        const targetId = event.detail;
        const targetElement = this.template.querySelector('[data-id="'+targetId+'"]');
        if(targetElement){
            targetElement.classList.remove("show");
        }
    }
    collapseMenuHandler(event)
    {
        var ele=this.template.querySelectorAll('[data-id="leftmenu"]');
        console.log('MenuLeft',ele[0].classList);
        ele[0].classList.remove("show");
    }

}