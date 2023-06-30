import { LightningElement } from 'lwc';
import { loadStyle} from 'lightning/platformResourceLoader';
import RtmFonts from '@salesforce/resourceUrl/rtmfonts';
import RtmvpcStylesCSS from '@salesforce/resourceUrl/rtmvpcstyles';
import myResource from '@salesforce/resourceUrl/rtmlogofull';
import bgLogin from '@salesforce/resourceUrl/bglogin';
export default class RtmvpcRhythmLoginPage extends LightningElement {

rhythmLogoUrl = myResource;
rhythmLoginBGUrl = bgLogin;


renderedCallback() {        
        Promise.all([            
            loadStyle(this, RtmFonts + '/line-awesome/line-awesome.css'),
            loadStyle(this, RtmFonts + '/SourceSansPro/SourceSansPro.css'),
            loadStyle(this, RtmvpcStylesCSS ),
            //loadScript(this, leaflet + '/leaflet.js'),
            ]);
    }

}