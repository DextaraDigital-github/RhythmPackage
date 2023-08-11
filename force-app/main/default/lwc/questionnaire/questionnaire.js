import { LightningElement, api, track } from 'lwc';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import createSupplierResponse from '@salesforce/apex/AssessmentController.createSupplierResponse';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import updateAccountAssessmentStatus from '@salesforce/apex/AssessmentController.updateAccountAssessmentStatus';
import getAccountAssessmentRecordData from '@salesforce/apex/AssessmentController.getAccountAssessmentRecordData';
import getQuestionRespAttributes from '@salesforce/apex/QuestionAttributeResponseController.getQuestionRespAttributes';
import insertRejectFlag from '@salesforce/apex/AssessmentController.insertRejectFlag';
import updateRejectFlag from '@salesforce/apex/AssessmentController.updateRejectFlag';
import getActionRecords from '@salesforce/apex/CAPAController.getActionRecords';
import RTM_FONTS from '@salesforce/resourceUrl/rtmfonts';
import CUS_STYLES from '@salesforce/resourceUrl/rtmcpcsldscustomstyles';
import QUE_PLAT from '@salesforce/resourceUrl/rtmvpcquestionnaireplatform';
import { loadStyle } from 'lightning/platformResourceLoader';
import awsjssdk from '@salesforce/resourceUrl/AWSJSSDK';
import { loadScript } from 'lightning/platformResourceLoader';
import getAuthentication from '@salesforce/apex/AWSS3Controller.getAuthenticationData';
import getSignedURL from '@salesforce/apex/AWSS3Controller.getFileSignedUrl';
import deleteCapa from '@salesforce/apex/CAPAController.deleteCapa';
import deleteResponse from '@salesforce/apex/AssessmentController.deleteResponse';
export default class Questionnaire extends LightningElement {
    @track showButtons = {
        Summary: false,
        Section_Navigation: {
            show: false,
            value: '',
            options: []
        },
        Save_Submit: false
    }
    sectionLimits = 5;
    questionsList = [];
    @api vendor;
    @track isPreviewComponent = false;
    @track success;
    @track requiredQuestionList = [];
    @track questionsandAnswersflag;
    @api assessment;
    @track totastmessage = '';
    @track isTemplate;
    @track showToast = false;
    @track responseMap = new Map();
    @track savedResponseMap = new Map();
    @track selectedCount = 0;
    @track supplierAssessmentName;
    @track supplierAssCreatedDate;
    @track AssessmentName;
    @track questionMap = new Map();
    @track childQuestionList = [];
    @track hierarchy = [];
    @api recordId;
    @track questionsAndAnswerss = [];
    @track questionsvaluemap = {};
    @track questionresponseafterchange;
    @track fileResponseData;
    @track showUpload;
    @track parentQuestionList = []
    @track Conversation_History__c;
    @track showChat;
    @track showAccordion;
    @track showAccordionQuestions;
    @track accordionFlag = false;
    @track accordionQuestionFlag = false;
    @track showRefreshbutton = false;
    @track showspinner;
    @track responselstMap = {};
    sectionidslist = [];
    @track buttonlabel = '[ + ]';
    assessmentStatus;
    @api objectApiName;
    @api objectName;
    @api accid;
    @track accountsId;
    @track isAccountAssessment;
    @track isSupplier;
    @api accountAssessmentStatus;
    @track showcustomerbuttons = false;
    @track showInReview = false;
    @track showSaveAndSubmit = false;
    @api accountassessmentid;
    @track loading = false;
    @track uploadingFile = false;
    @track isSupplierModalPopup = false;
    @track isCustomerModalPopup = false;
    @track actionData;
    @track accountName;
    @track accountId;
    @track showFollowButton = true;
    @api timeline;
    @track responseList = [];
    @track assessmentRecordName;
    @track filterQuestionsAndAnswers;
    @track renderFlag = true;
    @track accessKey;
    @track secretKey;
    @track region;
    @track endpoint;
    bucketName;
    @track s3;
    @track keyList = [];
    @track getFilesFlag = false;
    showFiles = false;
    documentParentId;
    isStylesLoaded = false;
    isAutoSave = false;
    countAutoSave = 0;
    ishideToast = false;
    requiredFilesLst = [];
    @track selectedActionList = [];
    layoutItemSize = 4;
    @track fileData;
    @track saveBool = false;
    filesdata = [];

    @api handleGetRespRecord(quesid) {
        this.filesdata.push(quesid);
        this.handleOnload();
    }

    //Used /* handleAccordionSection is used to handle opening and closing of a disclosure */
    handleAccordionSection() {
        if (this.accordionFlag === false) {
            this.accordionFlag = true;
            this.showAccordion = 'slds-accordion__section slds-is-open';
        }
        else {
            this.accordionFlag = false;
            this.showAccordion = 'slds-accordion__section slds-is-close';
        }
    }
    // This method is to handle expand all and collapse all in the supplier portal and customer portal.
    @api
    handleCollapseExpand(accordianId) {
        let isdispatch = (accordianId === '[ - ]' || accordianId === '[ + ]');
        if (isdispatch) {
            this.buttonlabel = accordianId;
        }
        if (this.buttonlabel === '[ - ]') {
            this.sectionidslist.forEach(secId => {
                this.template.querySelector('[data-accordian="' + secId + '"]').classList = 'slds-accordion__section slds-is-close';
            });
            this.buttonlabel = '[ + ]';
        }
        else if (this.buttonlabel === '[ + ]') {
            this.sectionidslist.forEach(secId => {
                this.template.querySelector('[data-accordian="' + secId + '"]').classList = 'slds-accordion__section slds-is-open';
            });
            this.buttonlabel = '[ - ]';
        }
        if (isdispatch) {
            const selectedEvent = new CustomEvent('expandcollapse', {
                detail: this.buttonlabel
            });
            this.dispatchEvent(selectedEvent);
        }
    }

    //Used /* handleAccordionSection is used to handle opening and closing of a section */
    handleAccordionQuestion(event) {
        let accordianClassList = this.template.querySelector('[data-accordian="' + event.currentTarget.dataset.id + '"]').classList;
        if (accordianClassList.contains('slds-accordion__section') && accordianClassList.contains('slds-is-open')) {
            accordianClassList.remove('slds-accordion__section');
            accordianClassList.remove('slds-is-open')
        } else {
            accordianClassList.add('slds-accordion__section')
            accordianClassList.add('slds-is-open');
        }
    }
    /*displayCloseIcon is used to remove the delete icon when CAPA form is deleted. This method is called from its parent
    Component (AssessmentDetail) */
    @api displayCloseIcon(deleteData) {
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (question.Id === deleteData.Rhythm__Question__c) {
                    question.saveActionForm = deleteData.saveActionForm;
                }
                question.Children.forEach(conditionalQuestion => {
                    if (conditionalQuestion.isdisplay) {
                        conditionalQuestion.questions.forEach(result => {
                            if (result.Id === deleteData.Rhythm__Question__c) {
                                result.saveActionForm = deleteData.saveActionForm;
                            }
                        })
                    }
                });
            });
        })
    }
    @api removeDeleteButton(questionid) {
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (question.Id === questionid) {
                    question.saveActionForm = false;
                }
                question.Children.forEach(conditionalQuestion => {
                    if (conditionalQuestion.isdisplay) {
                        conditionalQuestion.questions.forEach(result => {
                            if (result.Id === questionid) {
                                result.saveActionForm = false;
                            }
                        })
                    }
                });
            });
        })
    }

    /* Connectedcallback is used to get data on onload */
    connectedCallback() {
        try {
            this.loading = true;
            this.accountsId = this.accid;
            this.isTemplate = false;
            this.handleOnload();
        } catch (e) {

        }
    }
    renderedCallback() {
        Promise.all([
            loadScript(this, awsjssdk),
        ])
            .then(() => {
                setTimeout(() => {
                    this.configAWS();
                }, 100);
            });
    }
    //AWS configuration
    configAWS() {
        if (this.renderFlag == true) {
            getAuthentication({})
                .then(result => {
                    if (result) {
                        let metadataRecs = JSON.parse(JSON.stringify(result));
                        metadataRecs && metadataRecs.forEach(rec => {
                            (rec["DeveloperName"] == 'region') && (this.region = rec["Rhythm__Value__c"]);
                            (rec["DeveloperName"] == 'accessKey') && (this.accessKey = rec["Rhythm__Value__c"]);
                            (rec["DeveloperName"] == 'secretKey') && (this.secretKey = rec["Rhythm__Value__c"]);
                            (rec["DeveloperName"] == 's3bucket') && (this.bucketName = rec["Rhythm__Value__c"]);
                            (rec["DeveloperName"] == 'endpoint') && (this.endpoint = rec["Rhythm__Value__c"]);
                        });
                        const AWS = window.AWS;
                        AWS.config.update({
                            accessKeyId: this.accessKey,//Assigning access key id
                            secretAccessKey: this.secretKey,//Assigning secret access key
                            region_config: this.region
                        });
                        this.s3 = new AWS.S3({
                            params: {
                                Bucket: this.bucketName //Assigning S3 bucket name
                            }
                        });
                        this.renderFlag = false;
                        this.retrieveFilesFromS3();
                    }
                });
        }
        else {
            this.retrieveFilesFromS3();
        }
    }

    // Retrieve the files from S3 folder
    async retrieveFilesFromS3() {
        const folderName = this.objectName + '/' + this.documentParentId + '/';
        this.s3.listObjects({ Bucket: this.bucketName, Prefix: folderName }, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const files = data.Contents;
                let fileList = [];
                this.keyList = [];
                files && files.forEach(file => {
                    const objectKey = file.Key;
                    let fileName = objectKey.substring(objectKey.lastIndexOf("/") + 1);
                    let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                    if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx') {
                        fileList.push({ type: fileExtension, preview: false, key: objectKey, url: this.endpoint + '/' + objectKey, value: fileName.substring(fileName.indexOf("_") + 1) });
                    }
                    else {
                        fileList.push({ type: fileExtension, preview: true, key: objectKey, url: this.endpoint + '/' + objectKey, value: fileName.substring(fileName.indexOf("_") + 1) });
                    }
                });
                this.keyList = fileList.reverse();
                if (this.keyList.length > 0) {
                    this.showFiles = true;
                    this.getFilesFlag = true;
                }
                else {
                    this.getFilesFlag = false;
                }
                this.keyList && this.keyList.forEach(rec => {
                    rec.icon = ((rec).type === 'png') ? 'doctype:image' :
                        ((rec).type === 'pdf') ? 'doctype:pdf' :
                            ((rec).type === 'jpg') ? 'doctype:image' :
                                ((rec).type === 'jpeg') ? 'doctype:image' :
                                    ((rec).type === 'xlsx') ? 'doctype:excel' :
                                        ((rec).type === 'xls') ? 'doctype:excel' :
                                            ((rec).type === 'txt') ? 'doctype:txt' :
                                                ((rec).type === 'docx' || (rec).type === 'doc') ? 'doctype:word' : 'doctype:flash';
                });
            }
        });
    }
    //Download the file from AWS S3
    handleDownload(event) {
        if (this.isTemplate == false) {
            getSignedURL({
                location: event.target.title,
                file: event.currentTarget.dataset.id,
                expires: 30
            })
                .then(result => {
                    if (result) {
                        window.open(result);
                    }
                });
        }
    }

    /* handleOnload is used to get Sections data and corresponding Questions data and Responses data on onload */
    handleOnload() {
        this.saveBool = false;
        this.ishideToast = false;
        let isCustomerPortal = (typeof this.recordId !== 'undefined' && typeof this.objectApiName !== 'undefined');
        if (isCustomerPortal) {
            this.assessment = this.recordId;
            this.documentParentId = this.recordId;
            this.isTemplate = true;
            this.objectName = 'Rhythm__Assessment_Template__c';
        } else {
            this.layoutItemSize = 12;
            this.assessment = this.accountassessmentid;
            getAccountAssessmentRecordData({ assrecordId: this.accountassessmentid }).then(result => {
                if (typeof result[0].Rhythm__Assessment__r !== 'undefined' && typeof result[0].Rhythm__Assessment__r.Rhythm__Template__c !== 'undefined') {
                    this.documentParentId = result[0].Rhythm__Assessment__r.Rhythm__Template__c;
                    this.objectApiName = 'Rhythm__Assessment_Template__c';
                    this.objectName = 'Rhythm__Assessment_Template__c';
                }
            }).catch(error => {

            });
        }
        if (this.documentParentId != undefined) {
            Promise.all([
                loadStyle(this, RTM_FONTS + '/line-awesome/line-awesome.css'),
                loadStyle(this, RTM_FONTS + '/SourceSansPro/SourceSansPro.css'),
                loadStyle(this, CUS_STYLES),
                loadStyle(this, QUE_PLAT),
                loadScript(this, awsjssdk)
            ]).then(() => {
                this.configAWS();
            })
                .catch(error => {
                    let errormap = {};
                    errormap.componentName = 'Questionnaire';
                    errormap.methodName = 'configAWS';
                    errormap.className = 'AssessmentController';
                    errormap.errorData = error.message;
                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                });
        }
        getActionRecords({ accountAssessment: this.assessment }).then((result) => {
            this.actionData = result;
        });
        this.questionMap = new Map();
        this.questionsList = [];
        this.requiredQuestionList = [];
        this.requiredFilesLst = [];
        this.sectionidslist = [];
        let sectionName = {};
        this.questions = [];
        this.questionsAndAnswerss = [];
        if (this.isTemplate) {
            this.isSupplier = false;
            if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                this.isAccountAssessment = true;
                /* get all assessments data of a particular AccountAssessmentRelaton__c Id */
                getAccountAssessmentRecordData({ assrecordId: this.recordId }).then(result => {
                    if (typeof result[0].Rhythm__Assessment__r !== 'undefined' && typeof result[0].Rhythm__Assessment__r.Rhythm__Template__c !== 'undefined') {
                        let assessmentJunctionId = result[0].Id;
                        this.accountName = result[0].Rhythm__Account__r.Name;
                        this.accountId = result[0].Rhythm__Account__c;
                        this.assessment = result[0].Rhythm__Assessment__r.Id;
                        this.assessmentRecordName = result[0].Rhythm__Assessment__r.Name;
                        let assessmentTemplateId = result[0].Rhythm__Assessment__r.Rhythm__Template__c;
                        this.assessmentStatus = result[0].Rhythm__Status__c;
                        /* get all Sections data and Questions data of a particular Template Id */
                        getQuestionsList({ templateId: assessmentTemplateId }).then(questionResult => {
                            let resultMap = questionResult;
                            resultMap.forEach(question => {
                                if (typeof question.Rhythm__Section__r !== 'undefined') {
                                    if (typeof question.Rhythm__Section__r.Id !== 'undefined') {
                                        if (!this.sectionidslist.includes(question.Rhythm__Section__r.Id)) {
                                            this.sectionidslist.push(question.Rhythm__Section__r.Id);
                                            // sectionName.push(question.Rhythm__Section__r.Name);
                                            sectionName[question.Rhythm__Section__r.Id] = question.Rhythm__Section__r.Name;
                                        }
                                    }
                                }
                            });
                            let allQuesId = [];
                            questionResult.forEach(query => {
                                allQuesId.push(query.Id);
                            });
                            const resQuestType = questionResult.filter(query => query.Rhythm__Question_Type__c === 'Picklist' || query.Rhythm__Question_Type__c === 'Radio'
                                || query.Rhythm__Question_Type__c === 'Checkbox' || query.Rhythm__Question_Type__c === 'Picklist (Multi-Select)');
                            const ques = questionResult.filter(query => query.Rhythm__Question_Type__c !== 'Picklist' && query.Rhythm__Question_Type__c !== 'Radio'
                                && query.Rhythm__Question_Type__c !== 'Checkbox' && query.Rhythm__Question_Type__c !== 'Picklist (Multi-Select)');
                            /* This method is used to get all the responses of the questions in particular section*/
                            getSupplierResponseList({ assessmentId: assessmentJunctionId }).then(suppResult => {
                                if (suppResult && suppResult.length > 0 && suppResult[0] && suppResult[0].CreatedBy && suppResult[0].CreatedDate) {
                                    this.supplierAssessmentName = suppResult[0].CreatedBy.Name;
                                    this.supplierAssCreatedDate = suppResult[0].CreatedDate;
                                    let x = this.supplierAssCreatedDate.split('T')[0];
                                    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                                    // }
                                }
                                if (this.assessmentStatus !== 'New' && this.assessmentStatus !== 'In Progress') {
                                    suppResult.forEach(qres => {
                                        if (typeof qres.Rhythm__Question__r !== 'undefined') {
                                            this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "questionType": qres.Rhythm__Question__r.Rhythm__Question_Type__c, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Rejected__c": qres.Rhythm__Rejected__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                                        }
                                    });
                                }
                                getQuestionRespAttributes({ questionlst: allQuesId }).then(respAttr => {
                                    this.constructMultilevelhierarchy(resultMap, this.savedResponseMap, respAttr);
                                    let count = 0;
                                    let sectionsList = [];
                                    for (const seckey of this.questionMap.keys()) {

                                        sectionsList.push({ label: seckey, value: sectionName[seckey] });
                                        this.questionsList.push({ "sectionId": seckey, "section": sectionName[seckey], "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                                        count++;
                                    }
                                    //
                                    this.showButtons.Summary = false;
                                    this.showButtons.Section_Navigation.show = false;
                                    this.showButtons.Save_Submit = false;

                                    if (this.questionsList.length > this.sectionLimits) {
                                        this.showButtons.Summary = true;
                                        this.showButtons.Section_Navigation.show = true;
                                        this.showButtons.Section_Navigation.options = sectionsList;
                                        //this.showButtons.Section_Navigation.value = this.section;
                                    }
                                    this.constructQuestionsAndAnswers(this.questionsList);
                                    this.questionsList.forEach(questionWrap => {
                                        questionWrap.questions = questionWrap.questions.sort(this.compare_sort);
                                    });
                                    console.log('this.questionsAndAnswers', this.questionsAndAnswerss);
                                    //This loop is to give the Qustion number for all the Questions
                                    this.questionsAndAnswerss.forEach(questionWrap => {
                                        let sequence = 0;
                                        questionWrap.questions.forEach(question => {
                                            question.snumber = ++sequence;
                                            if (question.Children.length > 0) {
                                                question.Children.forEach(childQuestion => {
                                                    let childsequence = 0;
                                                    if (childQuestion.isdisplay && question.type !== 'Picklist (Multi-Select)') {
                                                        question.showUpload = (childQuestion.uploadrequired === 'Yes' || childQuestion.uploadrequired === 'Optional') ? true : false;
                                                    }
                                                    if (question.type === 'Picklist (Multi-Select)' && typeof question.value !== 'undefined') {
                                                        let lst = JSON.parse(question.value);
                                                        if (lst.includes(childQuestion.optionValue)) {
                                                            if ((childQuestion.uploadrequired === 'Yes' || childQuestion.uploadrequired === 'Optional')) {
                                                                question.showUpload = true;
                                                            }
                                                        }
                                                    }
                                                    childQuestion.questions.forEach(ques => {
                                                        if (ques.Children.length > 0) {
                                                            ques.Children.forEach(respAttr => {
                                                                if (respAttr.isdisplay && ques.type !== 'Picklist (Multi-Select)') {
                                                                    ques.showUpload = (respAttr.uploadrequired === 'Yes' || respAttr.uploadrequired === 'Optional') ? true : false;
                                                                }
                                                                if (ques.type === 'Picklist (Multi-Select)' && typeof ques.value !== 'undefined') {
                                                                    let lst = JSON.parse(ques.value);
                                                                    if (lst.includes(respAttr.optionValue)) {
                                                                        if ((respAttr.uploadrequired === 'Yes' || respAttr.uploadrequired === 'Optional')) {
                                                                            ques.showUpload = true;
                                                                        }
                                                                    }
                                                                }
                                                            })
                                                        }
                                                        ques.snumber = sequence + '.' + (++childsequence);
                                                    });
                                                });
                                            }
                                        })
                                        questionWrap.responsesPercentage = Math.floor((Number(questionWrap.numberOfResponses) / Number(questionWrap.numberOfQuestions)) * 100);
                                        console.log('this.questionsAndAnswers', this.questionsAndAnswerss);
                                    });
                                    if (this.accountAssessmentStatus === 'Need More Information') {
                                        //this.handleFilterFlag(true);
                                    }
                                    this.loading = false;
                                    this.filterQuestionsAndAnswers = JSON.parse(JSON.stringify(this.questionsAndAnswerss));

                                }).catch(error => {

                                });
                            }).catch(error => {

                            });

                        }).catch(error => {

                        });
                    }

                }).catch(error => {

                });
            }
            else {
                this.loading = true;
                this.isPreviewComponent = true;
                this.showRefreshbutton = true;
                this.savedResponseMap = {};
                /* get all Sections data and Questions data of a particular Template Id */
                getQuestionsList({ templateId: this.recordId }).then(questionResult => {
                    let resultMap = questionResult;
                    resultMap.forEach(question => {
                        if (typeof question.Rhythm__Section__r !== 'undefined' && typeof question.Rhythm__Section__r.Id !== 'undefined') {
                            if (!this.sectionidslist.includes(question.Rhythm__Section__r.Id)) {
                                this.sectionidslist.push(question.Rhythm__Section__r.Id);
                                //sectionName.push(question.Rhythm__Section__r.Name);
                                sectionName[question.Rhythm__Section__r.Id] = question.Rhythm__Section__r.Name;
                            }
                        }
                    });
                    let allQuesId = [];
                    questionResult.forEach(query => {
                        allQuesId.push(query.Id);
                    });

                    getQuestionRespAttributes({ questionlst: allQuesId }).then(respAttr => {
                        this.constructMultilevelhierarchy(resultMap, this.savedResponseMap, respAttr);
                        let count = 0;
                        let sectionsList = [];
                        for (const seckey of this.questionMap.keys()) {
                            sectionsList.push({ label: seckey, value: sectionName[seckey] });
                            this.questionsList.push({ "sectionId": seckey, "section": sectionName[seckey], "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                            count++;
                        }
                        this.constructQuestionsAndAnswers(this.questionsList);
                        this.questionsList.forEach(questionWrap => {
                            questionWrap.questions = questionWrap.questions.sort(this.compare_sort);
                        });

                        //This loop is to give the Qustion number for all the Questions. 
                        this.questionsList.forEach(questionWrap => {
                            let sequence = 0;
                            questionWrap.questions.forEach(question => {
                                question.snumber = ++sequence;
                                //This loop is to give all the number for all children Questions.
                                question.Children.forEach(childQuestion => {
                                    let childsequence = 0;
                                    childQuestion.questions.forEach(ques => {
                                        ques.snumber = sequence + '.' + (++childsequence);
                                        //ques.showUpload = (childQuestion.uploadrequired === 'Yes' || childQuestion.uploadrequired === 'Optional') ? true : false;
                                    });
                                });
                            })
                            questionWrap.responsesPercentage = Math.floor((Number(questionWrap.numberOfResponses) / Number(questionWrap.numberOfQuestions)) * 100);


                        });
                    }).catch(error => {
                        
                    });

                    //this.handleFilterFlag(true);
                    this.loading = false;
                }).catch(error => {
                    
                });
            }
        }
        else {
            this.isSupplier = true;
            /*This method is used to get all the assessments records*/
            getSupplierAssessmentList({ assessmentId: this.accountassessmentid }).then(result => {
                let assessmentTemplateId = result[0].Rhythm__Assessment__r.Rhythm__Template__c;
                this.accountName = result[0].Rhythm__Account__r.Name;
                this.accountId = result[0].Rhythm__Account__c;
                this.assessmentRecordName = result[0].Rhythm__Assessment__r.Name;
                this.showDisclosure = result[0].Rhythm__Assessment__r.Rhythm__Disclosure__c;
                this.AssessmentName = result[0].Name;
                this.assessmentStatus = result[0].Rhythm__Status__c;
                this.sectionidslist = [];
                /*This method is used to get all the questions with particular section*/
                getQuestionsList({ templateId: assessmentTemplateId }).then(questionResult => {
                    let resultMap = questionResult;
                    resultMap.forEach(question => {
                        if (typeof question.Rhythm__Section__r !== 'undefined' && typeof question.Rhythm__Section__r.Id !== 'undefined') {
                            if (!this.sectionidslist.includes(question.Rhythm__Section__r.Id)) {
                                this.sectionidslist.push(question.Rhythm__Section__r.Id);
                                //sectionName.push(question.Rhythm__Section__r.Name);
                                sectionName[question.Rhythm__Section__r.Id] = question.Rhythm__Section__r.Name;
                            }
                        }
                    });
                    console.log('resultMap', resultMap);
                    let allQuesId = [];
                    questionResult.forEach(query => {
                        allQuesId.push(query.Id);
                    });
                    const resQuestType = questionResult.filter(query => query.Rhythm__Question_Type__c === 'Picklist' || query.Rhythm__Question_Type__c === 'Radio'
                        || query.Rhythm__Question_Type__c === 'Checkbox' || query.Rhythm__Question_Type__c === 'Picklist (Multi-Select)');
                    const ques = questionResult.filter(query => query.Rhythm__Question_Type__c !== 'Picklist' && query.Rhythm__Question_Type__c !== 'Radio'
                        && query.Rhythm__Question_Type__c !== 'Checkbox' && query.Rhythm__Question_Type__c !== 'Picklist (Multi-Select)');
                    /* This method is used to get all the responses of the questions in particular section*/
                    getSupplierResponseList({ assessmentId: this.accountassessmentid }).then(suppResult => {
                        if (suppResult && suppResult.length > 0 && suppResult[0] && suppResult[0].CreatedBy && suppResult[0].CreatedDate) {
                            this.supplierAssessmentName = suppResult[0].CreatedBy.Name;
                            this.supplierAssCreatedDate = suppResult[0].CreatedDate;
                            let x = this.supplierAssCreatedDate.split('T')[0];
                            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                            // }
                        }
                        suppResult.forEach(qres => {
                            if (typeof qres.Rhythm__Question__r !== 'undefined') {
                                this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "questionType": qres.Rhythm__Question__r.Rhythm__Question_Type__c, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Rejected__c": qres.Rhythm__Rejected__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                            }
                        });
                        getQuestionRespAttributes({ questionlst: allQuesId }).then(respAttr => {
                            console.log('respAttr', respAttr);
                            this.constructMultilevelhierarchy(resultMap, this.savedResponseMap, respAttr);
                            let count = 0;
                            let sectionsList = [];
                            for (const seckey of this.questionMap.keys()) {
                                sectionsList.push({ label: seckey, value: sectionName[seckey] });
                                this.questionsList.push({ "sectionId": seckey, "section": sectionName[seckey], "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                                count++;
                            }
                            this.showButtons.Summary = false;
                            this.showButtons.Section_Navigation.show = false;
                            if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus === 'Review Completed' ||
                                this.accountAssessmentStatus === 'In Review') {
                                this.showButtons.Save_Submit = false;
                                this.showcustomerbuttons = false;
                                this.showButtons.Summary = true;
                            }
                            else {
                                this.showButtons.Save_Submit = true;
                            }
                            if (this.questionsList.length > this.sectionLimits) {
                                this.showButtons.Summary = true;
                                this.showButtons.Section_Navigation.show = true;
                                this.showButtons.Section_Navigation.options = sectionsList;
                            }
                            this.constructQuestionsAndAnswers(this.questionsList);
                            this.questionsList.forEach(questionWrap => {
                                questionWrap.questions = questionWrap.questions.sort(this.compare_sort);
                            });
                            this.questionsAndAnswerss.forEach(questionWrap => {
                                let sequence = 0;
                                questionWrap.questions.forEach(question => {
                                    if (question.required) {
                                        this.requiredQuestionList.push(question.Id);
                                    }
                                    question.snumber = ++sequence;
                                    //This loop is to give all the number for all children Questions.
                                    if (question.Children.length > 0) {
                                        question.Children.forEach(childQuestion => {
                                            let childsequence = 0;
                                            if (childQuestion.isdisplay && question.type !== 'Picklist (Multi-Select)') {
                                                question.showUpload = (childQuestion.uploadrequired === 'Yes' || childQuestion.uploadrequired === 'Optional') ? true : false;
                                                if (childQuestion.uploadrequired === 'Yes') {
                                                    if (typeof question.Files__c === 'undefined' || question.Files__c === '0') {
                                                        this.requiredFilesLst.push(question.Id);
                                                    }
                                                    else {
                                                        this.filesdata.push(question.Id);
                                                    }
                                                }
                                            }
                                            if (question.type === 'Picklist (Multi-Select)' && typeof question.value !== 'undefined') {
                                                let lst = JSON.parse(question.value);
                                                if (lst.includes(childQuestion.optionValue)) {
                                                    if ((childQuestion.uploadrequired === 'Yes' || childQuestion.uploadrequired === 'Optional')) {
                                                        question.showUpload = true;
                                                        if (childQuestion.uploadrequired === 'Yes') {
                                                            if (typeof question.Files__c === 'undefined' || question.Files__c === '0') {
                                                                this.requiredFilesLst.push(question.Id);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            childQuestion.questions.forEach(ques => {
                                                if (question.Rhythm__Flag__c === true) {                                                  
                                                    var status=this.timeline[0].status;
                                                    if (status === 'Need More Information') {
                                                        ques.isEditable = false;
                                                    }
                                                }
                                                if (childQuestion.isdisplay && ques.required) {
                                                    this.requiredQuestionList.push(ques.Id);
                                                }
                                                if (ques.Children.length > 0) {
                                                    ques.Children.forEach(respAttr => {
                                                        if (respAttr.isdisplay && ques.type !== 'Picklist (Multi-Select)') {
                                                            ques.showUpload = (respAttr.uploadrequired === 'Yes' || respAttr.uploadrequired === 'Optional') ? true : false;
                                                            if (respAttr.uploadrequired === 'Yes') {
                                                                if (typeof ques.Files__c === 'undefined' || ques.Files__c === '0') {
                                                                    this.requiredFilesLst.push(ques.Id);
                                                                } else {
                                                                    this.filesdata.push(ques.Id);
                                                                }
                                                            }
                                                        }
                                                        if (ques.type === 'Picklist (Multi-Select)' && typeof ques.value !== 'undefined') {
                                                            let lst = JSON.parse(ques.value);
                                                            if (lst.includes(respAttr.optionValue)) {
                                                                if ((respAttr.uploadrequired === 'Yes' || respAttr.uploadrequired === 'Optional')) {
                                                                    ques.showUpload = true;
                                                                    if (respAttr.uploadrequired === 'Yes') {
                                                                        if (typeof ques.Files__c === 'undefined' || ques.Files__c === '0') {
                                                                            this.requiredFilesLst.push(ques.Id);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                                ques.snumber = sequence + '.' + (++childsequence);
                                            });
                                        });
                                    }
                                })
                                questionWrap.responsesPercentage = Math.floor((Number(questionWrap.numberOfResponses) / Number(questionWrap.numberOfQuestions)) * 100);
                                console.log('this.questionsAndAnswers', this.questionsAndAnswerss);
                            });
                            this.loading = false;
                            this.filterQuestionsAndAnswers = JSON.parse(JSON.stringify(this.questionsAndAnswerss));

                        }).catch(error => {

                            this.totastmessage = 'Error : ' + JSON.stringify(error);
                        });
                    }).catch(error => {

                    })
                }).catch(error => {

                })
            }).catch(error => {

            });
            this.showspinner = false;
        }

    }
    compare_sort(a, b) {
        if (a.sequenceNumber < b.sequenceNumber) {
            return -1;
        } else if (a.sequenceNumber > b.sequenceNumber) {
            return 1;
        } else {
            return 0;
        }
    }
    handleuploadFile(event) {
        const selectedEvent = new CustomEvent('uploadfile', {
            detail: event.detail
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    constructQuestionsAndAnswers(questionsList) {
        let duplicatequestionList = questionsList;
        this.questionsAndAnswerss = [];
        questionsList.forEach(questionlst => {
            if ((questionsList.length > this.sectionLimits) || questionsList.length <= this.sectionLimits) {
                for (let j = 0; j < questionlst.questions.length; j++) {
                    if ((this.childQuestionList.includes(questionlst.questions[j].Id))) {
                        questionlst.questions.splice(j, 1);
                    }
                }
                questionlst.numberOfQuestions = questionlst.questions.length;
                this.questionsAndAnswerss.push(questionlst);
            }
        });
        if (this.questionsAndAnswerss.length > 0) {
            if (!this.isTemplate || this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                if (typeof this.questionsAndAnswerss[0].questions[0] !== 'undefined' && typeof this.questionsAndAnswerss[0].questions[0].Id !== 'undefined' && typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id) !== 'undefined') {
                    if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c !== 'undefined' && this.isTemplate === false) {
                        this.Rhythm__Conversation_History__c = { 'Id': this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Id, 'AssessmentId': this.assessment, 'QuestionnaireId': this.questionsAndAnswerss[0].questions[0].Id, 'chatHistory': (this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c ? JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c) : '') };
                    }
                }
                for (let i = 0; i < duplicatequestionList.length; i++) {
                    let numberOfResponses = 0;
                    let displayFlag = 0;
                    let numberofQuestions = 0;
                    for (let j = 0; j < questionsList[i].questions.length; j++) {
                        numberofQuestions++;
                        if (typeof questionsList[i].questions[j].value !== 'undefined') {
                            if (typeof questionsList[i].questions[j].defaultValue === 'undefined') {
                                if (questionsList[i].questions[j].value !== '' && questionsList[i].questions[j].value !== '[]') {
                                    numberOfResponses++;
                                }
                            }
                            else if (typeof this.accountAssessmentStatus !== 'undefined' && this.accountAssessmentStatus !== 'New') {
                                numberOfResponses++;
                            }
                        }
                        if (typeof questionsList[i].questions[j].Children !== 'undefined') {
                            questionsList[i].questions[j].Children.forEach(subQuestion => {
                                if (subQuestion.isdisplay === true) {
                                    subQuestion.questions.forEach(ques => {
                                        if (typeof ques.value !== 'undefined') {
                                            if (ques.value !== '' && ques.value !== '[]') {
                                                numberOfResponses++;
                                            }
                                        }
                                        if (ques.Rhythm__Flag__c === true) {
                                            displayFlag++;
                                        }
                                        numberofQuestions++;
                                    })
                                }
                            })
                        }
                        if (duplicatequestionList[i].questions[j].Rhythm__Flag__c === true) {
                            displayFlag++;
                        }
                    }
                    let bool = false;
                    this.timeline.forEach(res => {
                        if (res.status === 'Need More Information') {
                            bool = true;
                        }
                    });
                    if (this.isSupplier === true) {
                        if (bool) {
                            questionsList[i].displayFlag = displayFlag;
                        }
                        else {
                            questionsList[i].displayFlag = 0;
                        }
                    }
                    if (this.isSupplier === false) {
                        questionsList[i].displayFlag = displayFlag;
                    }
                    questionsList[i].numberOfQuestions = numberofQuestions;
                    if (typeof this.accountAssessmentStatus !== 'undefined' && this.accountAssessmentStatus !== 'New') {
                        questionsList[i].numberOfResponses = numberOfResponses;
                    }
                    else
                        questionsList[i].numberOfResponses = 0;
                }
            }
        }
    }

    //Used /* /onResponseChange method is used to change the wrapper and display the changed responsed for questions values on UI */
    onResponseChange(event) {
        this.requiredQuestionList = [];
        this.questionresponseafterchange = event.detail;
        if (this.questionresponseafterchange !== undefined) {
            //This loop is to iterate over the sections in the wrapper.
            this.questionsAndAnswerss.forEach(questionAnswer => {
                //This loop is to iterate over the Questions for a particular sections in the wrapper.
                questionAnswer.questions.forEach(question => {
                    if (question.required) {
                        this.requiredQuestionList.push(question.Id);
                    }
                    if (typeof this.questionresponseafterchange.parent === 'undefined' && this.questionresponseafterchange.questionId === question.Id) {
                        if (Array.isArray(this.questionresponseafterchange.option)) {
                            question.value = JSON.stringify(this.questionresponseafterchange.option);
                        }
                        else {
                            question.value = this.questionresponseafterchange.option;
                        }
                        if (question.Children.length > 0) {
                            let bool = false;
                            //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                            question.Children.forEach(subquestion => {
                                subquestion.questions.forEach(childquestion => {
                                    if (subquestion.isdisplay === true) {
                                        if (childquestion.saveActionForm || childquestion.rejectButton || childquestion.showUpload || childquestion.Rhythm__Flag__c) {
                                            var capaMap = {};
                                            var capaQuestionId = [];
                                            var rejectedQuestionId = [];
                                            if (childquestion.saveActionForm) {
                                                capaQuestionId.push(childquestion.Id);
                                            }
                                            if (childquestion.rejectButton || childquestion.showUpload || childquestion.Rhythm__Flag__c) {
                                                rejectedQuestionId.push(childquestion.Id)
                                            }
                                            capaMap.capaquestionId = capaQuestionId;
                                            capaMap.responsequestionId = rejectedQuestionId;
                                            capaMap.accountassessmentId = this.assessment;
                                            if (capaQuestionId.length > 0) {
                                                deleteCapa({ deletedata: capaMap }).then(() => {
                                                    childquestion.saveActionForm = false;
                                                    this.showToast = true;
                                                    this.success = true;
                                                    this.ishideToast = true;
                                                    this.totastmessage = 'Attachments and CAPAs added to the Conditional questions are deleted';

                                                })
                                            }
                                            if (rejectedQuestionId.length > 0) {
                                                deleteResponse({ deletedata: capaMap }).then(() => {
                                                    childquestion.rejectButton = false;
                                                    childquestion.needData = false;
                                                    childquestion.Rhythm__Flag__c = false;
                                                })
                                            }
                                        }
                                    }

                                })
                                if (subquestion.optionValue === question.value) {
                                    subquestion.isdisplay = true;
                                    question.showUpload = (subquestion.uploadrequired === 'Yes' || subquestion.uploadrequired === 'Optional') ? true : false;
                                    if (subquestion.uploadrequired === 'Yes') {
                                        this.requiredFilesLst.push(question.Id);
                                    }
                                    subquestion.questions.forEach(ques => {
                                        ques.isEditable = false;
                                        if (ques.required) {
                                            this.requiredQuestionList.push(ques.Id);
                                        }
                                    })
                                }
                                else {
                                    if (question.type === 'Picklist (Multi-Select)') {
                                        let lst = JSON.parse(question.value);
                                        if (lst.includes(subquestion.optionValue)) {
                                            if ((subquestion.uploadrequired === 'Yes' || subquestion.uploadrequired === 'Optional')) {
                                                question.showUpload = true;
                                                bool = true;
                                                if (subquestion.uploadrequired === 'Yes') {
                                                    this.requiredFilesLst.push(question.Id);
                                                }
                                            }
                                        }
                                        if (!bool) {
                                            question.showUpload = false;
                                        }
                                    }
                                    subquestion.isdisplay = false;
                                }
                            });
                        }
                    }
                    else {
                        if (this.questionresponseafterchange.parent === question.Id) {
                            let childbool = false;
                            //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                            question.Children.forEach(subquestion => {
                                subquestion.questions.forEach(ques => {
                                    if (ques.Id === this.questionresponseafterchange.questionId) {

                                        if (Array.isArray(this.questionresponseafterchange.option)) {
                                            ques.value = JSON.stringify(this.questionresponseafterchange.option);
                                        }
                                        else {
                                            ques.value = this.questionresponseafterchange.option;
                                        }
                                        if (ques.Children.length > 0) {
                                            ques.Children.forEach(respAttr => {
                                                if (respAttr.optionValue === ques.value) {
                                                    ques.showUpload = (respAttr.uploadrequired === 'Yes' || respAttr.uploadrequired === 'Optional') ? true : false;
                                                    if (respAttr.uploadrequired === 'Yes') {
                                                        this.requiredFilesLst.push(question.Id);
                                                    }
                                                }
                                                if (ques.type === 'Picklist (Multi-Select)') {
                                                    let lst = JSON.parse(ques.value);
                                                    if (lst.includes(subquestion.optionValue)) {
                                                        if ((respAttr.uploadrequired === 'Yes' || respAttr.uploadrequired === 'Optional')) {
                                                            ques.showUpload = true;
                                                            childbool = true;
                                                            if (respAttr.uploadrequired === 'Yes') {
                                                                this.requiredFilesLst.push(question.Id);
                                                            }
                                                        }
                                                    }
                                                    if (!childbool) {
                                                        ques.showUpload = false;
                                                    }
                                                }
                                               
                                            })
                                        }
                                    }
                                    else {
                                        if (subquestion.isdisplay === true) {
                                            if (ques.required === true) {
                                                this.requiredQuestionList.push(ques.Id);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                        else {
                            question.Children.forEach(subquestion => {
                                subquestion.questions.forEach(ques => {
                                    if (subquestion.isdisplay === true) {
                                        if (ques.required === true) {
                                            this.requiredQuestionList.push(ques.Id);
                                        }
                                    }
                                });

                            });
                        }
                    }
                });
            });
            this.responseMap.set(this.questionresponseafterchange.questionId, this.questionresponseafterchange.option);
            this.ishideToast = false;
            this.isAutoSave = true;
            //console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
            this.startAutoSave();
        }
    }

    /*handleFileUpload method is used to store the uploaded attachments into response records */
    handleFileUpload(event) {
        this.uploadingFile = true
        this.fileResponseData = event.detail;
        let responseId = '';
        if (this.savedResponseMap !== null) {
            if (Object.hasOwn(this.savedResponseMap, this.fileResponseData.questionId)) {
                responseId = this.savedResponseMap.get(this.fileResponseData.questionId).Id;
            }
        }
    }

    /* handledeletefile method is used to store the uploaded attachments into response records  */
    handledeletefile(event) {
        let deletefileData = event.detail;
        let deletefile = {};
        deletefile.accountAssessmentId = this.accountassessmentid;
        deletefile.questionId = deletefileData.questionId;
        deletefile.name = deletefileData.name;

    }
    /* This method is used to display the only flageed Questions and All the Questions based on selection */
    @api
    handleFilterFlag(flagFilter) {
        this.questionsAndAnswerss = JSON.parse(JSON.stringify(this.filterQuestionsAndAnswers));
        if (flagFilter) {
            this.questionsAndAnswerss.forEach(questionAnswer => {
                questionAnswer.questions = questionAnswer.questions.filter(item => (item.Rhythm__Flag__c));
                questionAnswer.questions.forEach(question => {
                    question.Children.forEach(conditionalQuestion => {
                        if (conditionalQuestion.isdisplay) {
                            conditionalQuestion.questions = conditionalQuestion.questions.filter(item => (item.Rhythm__Flag__c));
                        }
                    });
                });
            })
        }
        else {
            this.questionsList = [];
            this.questionMap = new Map();
            this.questionsAndAnswerss = [];
            this.handleOnload();
        }
    }
    @api
    handleFilterRejected() {
        this.questionsAndAnswerss = JSON.parse(JSON.stringify(this.filterQuestionsAndAnswers));
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions = questionAnswer.questions.filter(item => (item.rejectButton));
            questionAnswer.questions.forEach(question => {
                question.Children.forEach(conditionalQuestion => {
                    if (conditionalQuestion.isdisplay) {
                        conditionalQuestion.questions = conditionalQuestion.questions.filter(item => (item.rejectButton));
                    }
                });
            })
        })

    }

    /* getQuestionTemplate is used to create the basic question template for wrapper construction */
    getQuestionTemplate() {
        let question = {
            "question": "", "helptext": "", "isText": false, "isRadio": false, "isPicklist": false,
            "isMultiPicklist": false, "isDate": false, "isDateTime": false, "isCheckbox": false, "isNumber": false, "isCurrency": false, "isPhone": false, "isPercent": false,
            "isEmail": false, "isTextArea": false, "Id": "",
            "type": "Radio", "conditional": "", "optionsValueSet": "Test1, Test2", "ConditionalQuestion": "test4,test5",
            "optionsWrapper": {
                "checkboxOptions": [],
                "pickListOptions": [
                    { "label": "", "value": "" }
                ],
                "radioOptions": [],
                "multiPickListOptions": [],
                "options": []
            }
        };
        return question;
    }
    /*handleSave method is used to save the responses for particular question */
    handleSave() {
        this.ishideToast = true;
        this.isAutoSave = false;
        this.countAutoSave = 0;
        this.constructResponse(false);    
    }

    /* handleSubmit method is used to save the responses for particular question and update the assessment status to submit */
    handleSubmit() {
        this.isSupplierModalPopup = true;
    }
    submitAssessment() {
        this.ishideToast = true;
        this.isAutoSave = false;
        this.countAutoSave = 0;
        this.constructResponse(true);
        this.isSupplierModalPopup = false;
    }
    startAutoSave() {
        this.ishideToast = false;
        if (this.isAutoSave) {
            this.constructResponse(false);  
        }
    }
    closeModal() {
        this.isSupplierModalPopup = false;
    }

    /* constructResponse is used to call an apex class to store the response */
    constructResponse(isSubmit) {
        var isAssessmentValidated = false;
        var responseList = [];
        var questionsId = [];
        var flagmap = {};
        var filesmap = {};
        var responseIdlist = [];
        let questionCount = 0;
        let responseCount = 0;
        var tabledata = '<table><thead>';
        tabledata += '<tr><th>Section</th><th>Question</th><th>Responses</th><th>No.of File Attachments</th><th>Response History</th></tr>';
        tabledata += '</thead><tbody>';
        for (const seckey of this.responseMap.keys()) {
            responseIdlist.push(seckey);
        }
        //This loop is to iterate over the sections in the wrapper.
        this.questionsAndAnswerss.forEach(questionAnswer => {
            let rowdata = '';
            //This loop is to iterate over the Questions for a particular sections in the wrapper.
            questionAnswer.questions.forEach(question => {
                if (this.requiredQuestionList.includes(question.Id) &&
                    typeof question.value !== 'undefined') {
                    if (typeof this.accountAssessmentStatus === 'undefined' || this.accountAssessmentStatus === 'New') {
                        let index = this.requiredQuestionList.indexOf(question.Id);
                        this.requiredQuestionList.splice(index, 1);
                    }
                }
                question.Children.forEach(conditionalquestion => {
                    if (conditionalquestion.isdisplay) {
                        conditionalquestion.questions.forEach(subquestion => {
                            if (this.requiredQuestionList.includes(subquestion.Id) && typeof subquestion.value !== 'undefined') {
                                if (typeof this.accountAssessmentStatus === 'undefined' || this.accountAssessmentStatus === 'New') {
                                    let index = this.requiredQuestionList.indexOf(subquestion.Id);
                                    this.requiredQuestionList.splice(index, 1);
                                }
                            }
                        })
                    }
                })
                if (typeof question.defaultValue !== 'undefined') {
                    if (responseIdlist.includes(question.Id)) {
                        let index = responseIdlist.indexOf(question.Id);
                        responseIdlist.splice(index, 1);
                    }
                    else {
                        if (typeof question.value !== 'undefined') {
                            if (question.value !== question.defaultValue) {
                                this.responseMap.set(question.Id, question.value);
                            }
                            else {
                                this.responseMap.set(question.Id, question.defaultValue);
                            }
                        }
                    }
                }
                if (typeof questionAnswer.section !== 'undefined') {
                    rowdata = rowdata + '<tr><td>' + questionAnswer.section + '</td>';
                    if (typeof question.snumber !== 'undefined' && typeof question.question !== 'undefined') {
                        rowdata = rowdata + '<td>' + question.snumber + ' ' + question.question + '</td>';
                        questionCount++;
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    if (typeof question.value !== 'undefined') {
                        rowdata = rowdata + '<td>' + question.value + '</td>';
                        if (question.value !== '' && question.value !== '[]' && question.value != null) {
                            responseCount++;
                        }
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    if (typeof question.Files__c !== 'undefined') {
                        rowdata = rowdata + '<td>' + question.Files__c.length + '</td>';
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    if (typeof question.Rhythm__Conversation_History__c !== 'undefined') {
                        if (JSON.parse((question.Rhythm__Conversation_History__c).length > 0)) {
                            let str = '';
                            let convHistory = JSON.parse(question.Rhythm__Conversation_History__c);
                            convHistory.forEach(conv => {
                                str = str + conv.Name + ':' + conv.Text + '\n';
                            })
                            rowdata = rowdata + '<td>' + str + '</td>';
                        }
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    question.Children.forEach(conditionalQuestion => {
                        if (conditionalQuestion.isdisplay) {
                            rowdata = rowdata + '<tr>';
                            conditionalQuestion.questions.forEach(subquestion => {
                                if (typeof subquestion.snumber !== 'undefined' && typeof subquestion.question !== 'undefined') {
                                    rowdata = rowdata + '<td>' + subquestion.snumber + ' ' + subquestion.question + '</td>';
                                    questionCount++;
                                }
                                else {
                                    rowdata = rowdata + '<td></td>';
                                }
                                if (typeof subquestion.value !== 'undefined') {
                                    rowdata = rowdata + '<td>' + subquestion.value + '</td>';
                                    if (subquestion.value !== '' && question.value !== '[]' && subquestion.value != null) {
                                        responseCount++;
                                    }

                                }
                                else {
                                    rowdata = rowdata + '<td></td>';
                                }
                                if (typeof subquestion.Files__c !== 'undefined') {
                                    rowdata = rowdata + '<td>' + subquestion.Files__c.length + '</td>';
                                }
                                else {
                                    rowdata = rowdata + '<td></td>';
                                }
                                if (typeof subquestion.Rhythm__Conversation_History__c !== 'undefined') {
                                    if (JSON.parse((subquestion.Rhythm__Conversation_History__c).length > 0)) {
                                        let str = '';
                                        let convHistory = JSON.parse(subquestion.Rhythm__Conversation_History__c);
                                        convHistory.forEach(conv => {
                                            str = str + conv.Name + ':' + conv.Text + '\n';
                                        });
                                        rowdata = rowdata + '<td>' + str + '</td>';
                                    }
                                }
                                else {
                                    rowdata = rowdata + '<td></td>'
                                }

                            });
                            rowdata = rowdata + '</tr>';
                        }
                    })
                }
            });
            tabledata = tabledata + rowdata;
        });
        tabledata = tabledata + '</tbody></table>';
        let conversationhistory = {};
        let reject = {};
        for (const questionkey of this.responseMap.keys()) {
            questionsId.push(questionkey);
        }
        //This loop is to iterate over the sections in the wrapper.
        this.questionsAndAnswerss.forEach(questionAnswer => {
            //This loop is to iterate over the Questions for a particular sections in the wrapper.
            questionAnswer.questions.forEach(question => {
                if (questionsId.includes(question.Id)) {
                    if (typeof question.Rhythm__Flag__c !== 'undefined') {
                        flagmap[question.Id] = question.Rhythm__Flag__c;
                        conversationhistory[question.Id] = question.Rhythm__Conversation_History__c;
                    }
                    if (typeof question.rejectButton !== 'undefined') {
                        reject[question.Id] = question.rejectButton;
                    }
                    if (typeof question.Files__c !== 'undefined') {
                        filesmap[question.Id] = question.Files__c;
                    }
                    if (typeof question.value != 'undefined' && question.value != '') {
                        if (question.isEmail === true && !(question.value.match(/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/))) {
                            isAssessmentValidated = true;
                            this.showspinner = false;
                            this.showToast = true;
                            this.success = false;
                            this.totastmessage = 'Please enter the valid email:';
                        }
                        if (question.isPhone === true && !(question.value.match('[0-9]{3}-[0-9]{3}-[0-9]{4}'))) {
                            isAssessmentValidated = true;
                            this.showspinner = false;
                            this.showToast = true;
                            this.success = false;
                            this.totastmessage = 'Please enter the valid phone number in the format xxx-xxx-xxxx:';
                        }
                    }
                    //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                    question.Children.forEach(conditionalQuestion => {
                        if (conditionalQuestion.isdisplay) {
                            conditionalQuestion.questions.forEach(subQuestion => {
                                if (questionsId.includes(subQuestion.Id)) {
                                    if (typeof subQuestion.Rhythm__Flag__c !== 'undefined') {
                                        flagmap[subQuestion.Id] = subQuestion.Rhythm__Flag__c;
                                        conversationhistory[subQuestion.Id] = subQuestion.Rhythm__Conversation_History__c;
                                    }
                                    if (typeof subQuestion.Files__c !== 'undefined') {
                                        filesmap[subQuestion.Id] = subQuestion.Files__c;
                                    }
                                    if (typeof subQuestion.value !== 'undefined') {
                                        if (subQuestion.isEmail === true && !(subQuestion.value.match(/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/))) {
                                            isAssessmentValidated = true;
                                            this.showspinner = false;
                                            this.showToast = true;
                                            this.success = false;
                                            this.totastmessage = 'Please enter the valid email:';
                                        }
                                        if (subQuestion.isPhone === true && !(subQuestion.value.match('[0-9]{3}-[0-9]{3}-[0-9]{4}'))) {
                                            isAssessmentValidated = true;
                                            this.showspinner = false;
                                            this.showToast = true;
                                            this.success = false;
                                            this.totastmessage = 'Please enter the valid phone number in the format xxx-xxx-xxxx:';
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
        for (const seckey of this.responseMap.keys()) {
            let reponse = { 'sobjectType': 'Rhythm__Response__c' };
            reponse.Rhythm__AccountAssessmentRelation__c = this.accountassessmentid;
            reponse.Rhythm__Question__c = seckey;
            reponse.Rhythm__Account__c = this.vendor;
            if (typeof this.responselstMap[seckey] !== 'undefined') {
                reponse.Id = this.responselstMap[seckey];
            }
            if (Array.isArray(this.responseMap.get(seckey))) {
                reponse.Rhythm__Response__c = JSON.stringify(this.responseMap.get(seckey));
            }
            else if (this.responseMap.get(seckey) === true || this.responseMap.get(seckey) === false) {
                reponse.Rhythm__Response__c = JSON.stringify(this.responseMap.get(seckey));
            }
            else {
                reponse.Rhythm__Response__c = (this.responseMap.get(seckey));
            }
            if (typeof flagmap[seckey] !== 'undefined') {
                reponse.Rhythm__Flag__c = flagmap[seckey];
            }
            if (typeof reject[seckey] !== 'undefined') {
                reponse.Rhythm__Rejected__c = reject[seckey];
            }
            if (typeof conversationhistory[seckey] !== 'undefined' && conversationhistory[seckey].length > 0) {
                reponse.Rhythm__Conversation_History__c = conversationhistory[seckey];
            }
            reponse.Rhythm__Is_Latest_Response__c = true;
            if (this.requiredQuestionList.includes(reponse.Rhythm__Question__c)) {
                if (typeof reponse.Rhythm__Response__c === 'undefined' ||
                    (typeof reponse.Rhythm__Response__c !== 'undefined' && reponse.Rhythm__Response__c === '') ||
                    (typeof reponse.Rhythm__Response__c !== 'undefined' && reponse.Rhythm__Response__c === '[]')) {
                    isAssessmentValidated = true;
                    break;
                }
                else {
                    for (let i = 0; i < this.requiredQuestionList.length; i++) {
                        if (this.requiredQuestionList[i] === reponse.Rhythm__Question__c) {
                            this.requiredQuestionList.splice(i, 1);
                        }
                    }
                }
            }
            responseList.push(reponse);
        }
        if (isSubmit && (this.requiredQuestionList.length > 0 || this.requiredFilesLst.length > 0)) {
            isAssessmentValidated = true;
            this.showspinner = false;
            this.showToast = true;
            this.success = false;
            this.totastmessage = 'Please fill Mandatory questions ';
            if (this.requiredFilesLst.length > 0) {
                this.totastmessage = 'Please upload required file.'
            }
        }

        if (isAssessmentValidated === false) {
            this.showToast = true;
            this.success = true;
            let responseQueryMap = {};
            responseQueryMap.accountId = this.accid;
            responseQueryMap.assesmentId = this.assessment;
            responseQueryMap.accountassessmentid = this.accountassessmentid;
            console.log('responseCount', responseCount);
            console.log('questionCount', questionCount);
            responseQueryMap.percentage = Math.floor(Number(responseCount / questionCount) * 100);
            if (this.assessmentStatus !== 'Need More Information') {
                if (isSubmit) {
                    responseQueryMap.status = 'Submitted';
                }
                else {
                    responseQueryMap.status = 'In Progress';
                }
            }
            else {
                if (isSubmit) {
                    responseQueryMap.status = 'Submitted';
                    this.showButtons.Save_Submit = false;
                }
                else {
                    responseQueryMap.status = 'Need More Information';
                }
            }
            if (isSubmit) {
                responseQueryMap.submit = true;
            }
            else {
                responseQueryMap.submit = false;
            }
            responseQueryMap.pdfContnet = tabledata;
            /* This method is used to create the response for the questions*/
            createSupplierResponse({ suppResponseList: responseList, paramMap: JSON.stringify(responseQueryMap) }).then((result) => {
                result.forEach(res => {
                    this.responselstMap[res.Rhythm__Question__c] = res.Id;
                });
                if (isSubmit) {
                    this.questionsAndAnswerss.forEach(questionAnswer => {
                        questionAnswer.questions.forEach(question => {
                            if (question.Flag__c !== true) {
                                question.isEditable = true;
                            }
                            question.Children.forEach(conditionalQuestion => {
                                if (conditionalQuestion.isdisplay) {
                                    conditionalQuestion.questions.forEach(subquestion => {
                                        if (subquestion.Flag__c !== true) {
                                            subquestion.isEditable = true;
                                        }
                                    });
                                }
                            })
                        })
                    });
                }
                let filemaplst = {};
                filemaplst.data = this.questionsAndAnswerss;
                filemaplst.updateTimeline = true;
                filemaplst.files = false;
                if (!this.isAutoSave) {
                    if (this.filesdata.length > 0) {
                        filemaplst.files = isSubmit;
                    }
                    this.totastmessage = 'Responses saved successfully';
                    const selectedEvent = new CustomEvent('updatetimeline', {
                        detail: filemaplst
                    });
                    this.dispatchEvent(selectedEvent);
                    this.handleOnload();
                }
                else {
                    this.countAutoSave++;
                    if (this.countAutoSave === 1 && this.accountAssessmentStatus!=='In Progress' && this.accountAssessmentStatus!=='Need More Information') {
                       /* const selectedEvent = new CustomEvent('updatetimeline', {
                            detail: filemaplst
                        });
                        this.dispatchEvent(selectedEvent);*/
                    }
                }
            }).catch(error => {
                this.totastmessage = 'Error : Something went wrong, Please contact admin.';
            });
        }
    }
    /* Used to close the toast message populated on saving */
    closeToastHandler(event) {
        this.showToast = event.detail.showModal;
    }
    /*constructWrapperConditionalQuestion method is used to construct the wrapper for Questions and responses  */
    constructWrapperConditionalQuestion(qu, savedResp) {
        let quTemp = this.getQuestionTemplate();
        quTemp.Id = qu.Id;
        if (typeof qu.Rhythm__HelpText__c !== 'undefined') {
            quTemp.helptext = qu.Rhythm__HelpText__c;
        }
        quTemp.question = qu.Rhythm__Question__c;
        let qtype = qu.Rhythm__Question_Type__c;
        quTemp.isText = ('Text' === qtype);
        quTemp.isPercent = ('Percent' === qtype);
        quTemp.isRadio = ('Radio' === qtype);
        quTemp.isPicklist = ('Picklist' === qtype);
        quTemp.isMultiPicklist = ('Picklist (Multi-Select)' === qtype);
        quTemp.isDate = ('Date' === qtype);
        quTemp.isDateTime = ('Date/Time' === qtype);
        quTemp.isCheckbox = ('Checkbox' === qtype);
        quTemp.isNumber = ('Number' === qtype);
        quTemp.isPhone = ('Phone' === qtype);
        quTemp.isCurrency = ('Currency' === qtype);
        quTemp.isEmail = ('Email' === qtype);
        quTemp.isTextArea = ('Text Area (Rich)' === qtype);
        quTemp.type = qtype;
        quTemp.required = qu.Rhythm__Required__c;
        quTemp.inputId = qu.Id + '_inputId';
        quTemp.labelId = qu.Id + '_labelId';
        quTemp.spanId = qu.Id + '_spanId';
        quTemp.customerFlag = false;
        quTemp.capaAction = false;
        quTemp.saveActionForm = false;
        quTemp.reviewForm = false;
        quTemp.rejectButton = false;
        quTemp.needData = false;
        quTemp.disableReject = false;
        quTemp.sequenceNumber = qu.Rhythm__Question_Sequence_Number__c;
        this.actionData.forEach(res => {
            if (res.Rhythm__Question__c == quTemp.Id) {
                quTemp.saveActionForm = true;
            }
        })
        if (typeof qu.Rhythm__Default_Value__c !== 'undefined' && typeof this.recordId === 'undefined'
            && typeof this.objectApiName === 'undefined') {
            quTemp.defaultValue = qu.Rhythm__Default_Value__c;
        }
        quTemp.Rhythm__Flag__c = false;
        quTemp.parentQuestionId = qu.Rhythm__Parent_Question__c;
        if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c' || !this.isTemplate) {
            if (typeof savedResp.get(qu.Id) !== 'undefined') {
                quTemp.Rhythm__Flag__c = savedResp.get(qu.Id).Flag__c;
                quTemp.ResponseId = savedResp.get(qu.Id).Id;
                quTemp.rejectButton = savedResp.get(qu.Id).Rejected__c;
                this.responselstMap[qu.Id] = savedResp.get(qu.Id).Id;
                if (quTemp.Rhythm__Flag__c == true) {
                    this.showFollowButton = false;
                }
            }
            if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus === 'In Review' || this.accountAssessmentStatus === 'Need More Information') {
                    this.showcustomerbuttons = true;
                    this.timeline.forEach(res => {
                        if (res.status === 'Need More Information') {
                            quTemp.needData = true;
                            quTemp.capaAction = true;
                            quTemp.customerFlag = true;
                        }
                    })
                    if (this.accountAssessmentStatus === 'Submitted') {
                        this.showInReview = true;
                    }
                    if (this.accountAssessmentStatus === 'Need More Information' || this.accountAssessmentStatus === 'In Review') {
                        this.showInReview = false;
                        this.showSaveAndSubmit = true;
                        quTemp.customerFlag = true;
                        quTemp.capaAction = true;
                        if (this.accountAssessmentStatus === 'Need More Information') {
                            quTemp.needData = true;
                        }
                    }
                }
                else {
                    if (this.accountAssessmentStatus === 'Review Completed') {
                        quTemp.isEditable = true;
                        quTemp.capaAction = true;
                        quTemp.reviewForm = true;
                        quTemp.customerFlag = true;
                        quTemp.disableReject = true;
                        quTemp.needData = true;
                    }
                    else {
                        quTemp.isEditable = false;
                    }
                }
            }
            else {
                if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus === 'Need More Information' || this.assessmentStatus === 'In Review') {
                    if (this.assessmentStatus === 'Need More Information') {
                        if (quTemp.Rhythm__Flag__c) {
                            quTemp.isEditable = false;
                        }
                        else {
                            quTemp.isEditable = true;
                        }
                        quTemp.capaAction = true;
                        quTemp.customerFlag = true;
                    }
                    else {
                        this.timeline.forEach(res => {
                            if (res.status === 'Need More Information') {
                                quTemp.customerFlag = true;
                                quTemp.capaAction = true;
                            }
                        })
                        quTemp.capaAction = true;
                        quTemp.isEditable = true;
                        this.showButtons.Save_Submit = false;
                    }
                }
                else {
                    if (this.accountAssessmentStatus === 'Review Completed') {
                        quTemp.isEditable = true;
                        quTemp.capaAction = true;
                        quTemp.customerFlag = true;
                    }
                    else {
                        quTemp.isEditable = false;
                    }
                }
            }
            quTemp.conditional = qu.Rhythm__Conditional_Response__c === null ? '' : qu.Rhythm__Conditional_Response__c;
            quTemp.optionsValueSet = qu.Rhythm__OptionValueSet__c;
            let optionList = [];
            if (quTemp.optionsValueSet) {
                let optionValues = quTemp.optionsValueSet.split("\r\n");
                optionValues.forEach(opt => {
                    let optionMap = {};
                    optionMap.label = opt;
                    optionMap.value = opt;
                    optionList.push(optionMap);
                });
            }
            quTemp.optionsWrapper.options = optionList;
            quTemp.optionsWrapper.pickListOptions = optionList;
            quTemp.optionsWrapper.radioOptions = optionList;
            quTemp.optionsWrapper.multiPickListOptions = optionList;
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).value !== 'undefined') {
                quTemp.value = savedResp.get(qu.Id).value;
                if (savedResp.get(qu.Id).questionType === "Checkbox") {
                    if (savedResp.get(qu.Id).value === "true")
                        quTemp.value = true;
                    else
                        quTemp.value = false;
                }
                if (savedResp.get(qu.Id).questionType === "Picklist (Multi-Select)") {
                    if (savedResp.get(qu.Id).value.includes('[')) {
                        quTemp.optionsWrapper.selectedListOptions = JSON.parse(savedResp.get(qu.Id).value);
                        quTemp.value = JSON.stringify(quTemp.optionsWrapper.selectedListOptions);
                    }
                    else
                        quTemp.optionsWrapper.selectedListOptions = false;
                }
            }
            else {
                if (typeof qu.Rhythm__Default_Value__c !== 'undefined' && qu.Rhythm__Default_Value__c !== null && (this.objectApiName !== 'Rhythm__AccountAssessmentRelation__c' || typeof this.recordId !== 'undefined')) {
                    if (qu.Rhythm__Question_Type__c === 'Picklist') {
                        quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') {
                        quTemp.optionsWrapper.selectedListOptions = JSON.parse('[' + JSON.stringify(qu.Rhythm__Default_Value__c) + ']');
                        quTemp.value = JSON.stringify(quTemp.optionsWrapper.selectedListOptions);
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Text Area (Rich)') {
                        quTemp.value = '<p>' + JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)) + '</p>';
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Checkbox') {
                        quTemp.value = (Boolean)(JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)));
                    }
                    else {
                        quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                    }
                }
            }
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).Conversation_History__c !== 'undefined') {
                quTemp.Rhythm__Conversation_History__c = savedResp.get(qu.Id).Conversation_History__c;
            }
            else {
                quTemp.Rhythm__Conversation_History__c = [];
            }
            quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).Files__c !== 'undefined') {
                let responsedData = savedResp.get(qu.Id).Files__c;

                quTemp.Files__c = responsedData;
            }
            quTemp.showUploadProgress = false;
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).value !== 'undefined')
                this.responseMap.set(qu.Id, savedResp.get(qu.Id).value);
            quTemp.Children = [];
            if (typeof qu.Rhythm__Section__r !== 'undefined' && typeof qu.Rhythm__Section__r.Name !== 'undefined') {
                if (typeof qu.Rhythm__Parent_Question__c === 'undefined') {
                    if (this.questionMap.has(qu.Rhythm__Section__r.Id)) {
                        this.questionMap.get(qu.Rhythm__Section__r.Id).push(quTemp);
                    } else {
                        this.questionMap.set(qu.Rhythm__Section__r.Id, [quTemp]);
                    }
                }
            }
            if (this.isTemplate || this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                quTemp.isEditable = true;
            }
        } else {
            quTemp.isEditable = false;
            quTemp.conditional = qu.Rhythm__Conditional_Response__c === null ? '' : qu.Rhythm__Conditional_Response__c;
            quTemp.optionsValueSet = qu.Rhythm__OptionValueSet__c;
            let optionList = [];
            if (quTemp.optionsValueSet) {
                let optionValues = quTemp.optionsValueSet.split("\r\n");
                optionValues.forEach(opt => {
                    let optionMap = {};
                    optionMap.label = opt;
                    optionMap.value = opt;
                    optionList.push(optionMap);
                });
            }
            quTemp.optionsWrapper.options = optionList;
            quTemp.optionsWrapper.pickListOptions = optionList;
            quTemp.optionsWrapper.radioOptions = optionList;
            quTemp.optionsWrapper.multiPickListOptions = optionList;
            quTemp.value = undefined;
            if (typeof qu.Rhythm__Default_Value__c !== 'undefined' && qu.Rhythm__Default_Value__c !== null && (this.objectApiName !== 'Rhythm__AccountAssessmentRelation__c' || typeof this.recordId !== 'undefined')) {
                if (qu.Rhythm__Question_Type__c === 'Picklist') {
                    quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                }
                else if (qu.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') {
                    quTemp.optionsWrapper.selectedListOptions = JSON.parse('[' + JSON.stringify(qu.Rhythm__Default_Value__c) + ']');
                    quTemp.value = JSON.stringify(quTemp.optionsWrapper.selectedListOptions);
                }
                else if (qu.Rhythm__Question_Type__c === 'Text Area (Rich)') {
                    quTemp.value = '<p>' + JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)) + '</p>';
                }
                else if (qu.Rhythm__Question_Type__c === 'Checkbox') {
                    quTemp.value = (Boolean)(JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)));
                }
                else {
                    quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                }
            }
            if (this.isTemplate || this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                quTemp.isEditable = true;
            }
            quTemp.Rhythm__Conversation_History__c = [];
            quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
            quTemp.showUploadProgress = false;
            quTemp.Children = [];
            if (typeof qu.Rhythm__Parent_Question__c === 'undefined') {
                if (this.questionMap.has(qu.Rhythm__Section__r.Id)) {
                    this.questionMap.get(qu.Rhythm__Section__r.Id).push(quTemp);
                } else {
                    this.questionMap.set(qu.Rhythm__Section__r.Id, [quTemp]);
                }
            }
        }
        return quTemp;
    }

    // constructMultilevelhierarchy method is used to construct nested questions wrapper, based on condition of having parentQuestionId
    constructMultilevelhierarchy(queryResults, savedResp, respAttr) {
        const children = queryResults.filter(result => typeof result.Rhythm__Parent_Question__c !== 'undefined');
        const parent = queryResults.filter(result => typeof result.Rhythm__Parent_Question__c === 'undefined');
        const resQuestType = queryResults.filter(query => query.Rhythm__Question_Type__c === 'Picklist' || query.Rhythm__Question_Type__c === 'Radio'
            || query.Rhythm__Question_Type__c === 'Checkbox' || query.Rhythm__Question_Type__c === 'Picklist (Multi-Select)');
        const ques = queryResults.filter(query => query.Rhythm__Question_Type__c !== 'Picklist' && query.Rhythm__Question_Type__c !== 'Radio'
            && query.Rhythm__Question_Type__c !== 'Checkbox' && query.Rhythm__Question_Type__c !== 'Picklist (Multi-Select)');
        let childQueslst = [];
        let parentQueslst = [];
        parent.forEach(parentdata => {
            parentQueslst.push(parentdata.Id);
        });
        children.forEach(child => {
            childQueslst.push(child.Id);
        });
        ques.forEach(parentData => {
            if (!childQueslst.includes(parentData.Id)) {
                const hierarchyObj = this.constructWrapperConditionalQuestion(parentData, savedResp);
                this.hierarchy.push(hierarchyObj);
            }
        });
        if (resQuestType.length > 0) {
            resQuestType.forEach(parentdata => {
                //if (!childQueslst.includes(parentdata.Id)) {
                const hierarchyObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                this.createChildHierarchy(children, hierarchyObj, savedResp, respAttr);
                this.hierarchy.push(hierarchyObj);
                /*} else {
                    const hierarchyObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                    this.hierarchy.push(hierarchyObj);
                }*/
            });
        }

    }
    // createChildHierarchy method is used to construct nested questions wrapper for child questions accordingly with its parent Question 
    createChildHierarchy(queryResults, parentObj, savedResp, respAttr) {
        const child = queryResults.filter(result =>
            result['Rhythm__Parent_Question__c'] === parentObj.Id);
        respAttr.forEach(resp => {
            if (parentObj.type === 'Checkbox' && parentObj.Id === resp.Rhythm__QuestionId__c) {
                if (resp.Rhythm__Response_value__c === 'true') {
                    resp.Rhythm__Response_value__c = true;
                }
                else {
                    resp.Rhythm__Response_value__c = false;
                }
            }
        });
        console.log('queryResults', queryResults);
        if (child.length > 0) {
            child.forEach(childdata => {
                const childObj = this.constructWrapperConditionalQuestion(childdata, savedResp);
                this.childQuestionList.push(childObj.Id);
                this.parentQuestionList.push(parentObj.Id);
                if (childObj.type === 'Radio' || childObj.type === 'Picklist (Multi-Select)' || childObj.type === 'Checkbox' ||
                    childObj.type === 'Picklist') {
                    this.createChildHierarchy(queryResults, childObj, savedResp, respAttr);
                }
                if (parentObj.type === 'Checkbox') {
                    if (childObj.conditional === 'true') {
                        childObj.conditional = true;
                    }
                    else {
                        childObj.conditional = false;
                    }
                }

                if (parentObj.value === childObj.conditional) {
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    let childmp = {};
                    respAttr.forEach(resp => {
                        if (resp.Rhythm__Response_value__c === parentObj.value && resp.Rhythm__QuestionId__c === parentObj.Id) {
                            childmp.respAttrId = resp.Id;
                            childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                            childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                            childmp.score = resp.Rhythm__Score__c;
                            childmp.weight = resp.Rhythm__Weight__c;
                        }
                    });
                    childmp.isdisplay = true;
                    let bool = false;
                    let childlst = JSON.parse(JSON.stringify(parentObj.Children));
                    if (childlst.length > 0) {
                        console.log('childlst', childlst);
                        console.log('childObj', childObj);
                        childlst.forEach(lst => {
                            if (lst.optionValue === childObj.conditional) {
                                lst.questions.push(childObj);
                                bool = true;
                            }
                        });
                        if (bool) {
                            parentObj.Children = childlst;
                        }
                        else {
                            console.log('else', childlst, ',childObj', childObj);
                            childmp.optionValue = childObj.conditional;
                            let lst = [];
                            lst.push(childObj);
                            childmp.questions = lst;
                            parentObj.Children.push(childmp);
                        }
                    }
                    else {
                        let childmp = {};
                        console.log('respAttr', respAttr);
                        console.log('childObj', childObj);
                        console.log('parentObj', parentObj);
                        respAttr.forEach(resp => {
                            if (resp.Rhythm__Response_value__c === childObj.conditional && resp.Rhythm__QuestionId__c === parentObj.Id) {
                                childmp.respAttrId = resp.Id;
                                childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                                childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                                childmp.score = resp.Rhythm__Score__c;
                                childmp.weight = resp.Rhythm__Weight__c;
                            }
                        });
                        childmp.isdisplay = true;
                        childmp.optionValue = childObj.conditional;
                        let lst = [];
                        lst.push(childObj);
                        childmp.questions = lst;
                        console.log('childmp', childmp);
                        parentObj.Children.push(childmp);
                    }
                }
                else {
                    let displayval = false;
                    if (this.isPreviewComponent) {
                        displayval = true;
                    }
                    let childlst = JSON.parse(JSON.stringify(parentObj.Children));
                    let bool = false;
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    if (childlst.length > 0) {
                        childlst.forEach(lst => {
                            if (lst.optionValue === childObj.conditional) {
                                lst.questions.push(childObj);
                                bool = true;
                            }
                        });
                        if (bool) {
                            parentObj.Children = childlst;
                        }
                        else {
                            let childmp = {};
                            respAttr.forEach(resp => {
                                if (resp.Rhythm__Response_value__c === childObj.conditional && resp.Rhythm__QuestionId__c === parentObj.Id) {
                                    childmp.respAttrId = resp.Id;
                                    childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                                    childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                                    childmp.score = resp.Rhythm__Score__c;
                                    childmp.weight = resp.Rhythm__Weight__c;
                                }
                            });
                            childmp.isdisplay = displayval;
                            childmp.optionValue = childObj.conditional;
                            let lst = [];
                            lst.push(childObj);
                            childmp.questions = lst;
                            parentObj.Children.push(childmp);
                        }
                    }
                    else {
                        let childmp = {};
                        respAttr.forEach(resp => {
                            if (resp.Rhythm__Response_value__c === childObj.conditional && resp.Rhythm__QuestionId__c === parentObj.Id) {
                                childmp.respAttrId = resp.Id;
                                childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                                childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                                childmp.score = resp.Rhythm__Score__c;
                                childmp.weight = resp.Rhythm__Weight__c;
                            }
                        });
                        childmp.isdisplay = displayval;
                        childmp.optionValue = childObj.conditional;
                        let lst = [];
                        lst.push(childObj);
                        childmp.questions = lst;
                        parentObj.Children.push(childmp);
                    }
                }
            });
        }
        else {
            let childlst = JSON.parse(JSON.stringify(parentObj.Children));
            respAttr.forEach(resp => {
                let childmp = {};
                if (resp.Rhythm__QuestionId__c === parentObj.Id) {
                    childmp.respAttrId = resp.Id;
                    childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                    childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                    childmp.score = resp.Rhythm__Score__c;
                    childmp.weight = resp.Rhythm__Weight__c;
                    childmp.optionValue = resp.Rhythm__Response_value__c;
                    childmp.isdisplay = (parentObj.value === resp.Rhythm__Response_value__c);
                    childmp.questions = [];
                    childlst.push(childmp);
                }
            });
            parentObj.Children = childlst;
        }
    }

    /* handlechatHistory is used to dispatch the event to the parent component (rtmvpcAssessmentDetail) */
    handleFlagResponseMethod(event) {
        this.showFollowButton = true;
        this.saveBool = false;
        this.showChat = event.detail;
        this.showChat.assesmentId = this.assessment;
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (question.Id === this.showChat.questionId && typeof this.showChat.responseflag !== 'undefined') {
                    question.Rhythm__Flag__c = this.showChat.responseflag;
                }
                if (question.Rhythm__Flag__c === true) {
                    this.showFollowButton = false;
                }
                question.Children.forEach(conditionalQuestion => {
                    if (conditionalQuestion.questions.length > 0) {
                        if (question.Rhythm__Flag__c === true && question.Id === this.showChat.questionId) {
                            // this.showToast = true;
                            // this.success = false;
                            // this.totastmessage = 'Flagging the question will make the response editable, Attachments and CAPAs added to the Conditional questions will be deleted when the response is changed';

                        }
                    }
                    if (conditionalQuestion.isdisplay) {
                        conditionalQuestion.questions.forEach(subquestion => {
                            if (subquestion.Id === this.showChat.questionId && typeof this.showChat.responseflag !== 'undefined') {
                                subquestion.Rhythm__Flag__c = this.showChat.responseflag;
                            }
                            if (subquestion.Rhythm__Flag__c === true) {
                                this.showFollowButton = false;
                            }
                        })
                    }
                })
            })
        })
        this.handleselectedaction();
        this.saveBool = true;
        this.handleSaveCustomer();
        

        const selectedChat = new CustomEvent('selectconversation', {
            detail: { chat: this.showChat, actionData: this.selectedActionList, file: this.fileData }
        });
        this.dispatchEvent(selectedChat);
    }

    handleReject(event) {
        let rejectedMap = event.detail;
        this.saveBool = false;
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (question.Id === rejectedMap.questionId && typeof rejectedMap.rejectResponse !== 'undefined') {
                    question.rejectButton = rejectedMap.rejectResponse;
                }
                if (question.Id === rejectedMap.questionId && typeof rejectedMap.needData !== 'undefined') {
                    question.needData = rejectedMap.needData;
                }
                if (question.Children.length > 0) {
                    question.Children.forEach(conditionalQuestion => {
                        if (conditionalQuestion.isdisplay) {
                            conditionalQuestion.questions.forEach(subQuestion => {
                                if (subQuestion.Id === rejectedMap.questionId && typeof rejectedMap.rejectResponse !== 'undefined') {
                                    //bool = true;
                                    subQuestion.rejectButton = rejectedMap.rejectResponse;
                                }
                                if (subQuestion.Id === rejectedMap.questionId && typeof rejectedMap.needData !== 'undefined') {
                                    // bool = true;
                                    subQuestion.needData = rejectedMap.needData;
                                }
                            });
                        }
                    });
                }
            })
        });
        this.saveBool = true;
        this.handleSaveCustomer();
    }

    handleActionResponse(event) {
        let responseMap = {};
        this.responseList = [];
        var selectedChat = {};
        responseMap.Rhythm__Question__c = event.detail.quesId;
        responseMap.showCapaForm = event.detail.showCapaForm;
        responseMap.isSupplier = this.isSupplier;
        responseMap.Rhythm__AccountAssessment__c = this.recordId;
        selectedChat.accountassessmentId = this.recordId;
        selectedChat.accountType = 'vendor';
        if (this.isSupplier === true) {
            responseMap.Rhythm__AccountAssessment__c = this.accountassessmentid;
            selectedChat.accountassessmentId = this.accountassessmentid;
            selectedChat.accountType = 'supplier';
        }
        responseMap.accountName = this.accountName;
        responseMap.Rhythm__Account__c = this.accountId;
        responseMap.Rhythm__Related_Record__c = this.assessment;
        responseMap.relatedRecordName = this.assessmentRecordName;
        this.responseList.push(responseMap);
        selectedChat.questionId = event.detail.quesId;
        selectedChat.openChat = false;
        const selectedAction = new CustomEvent('selectaction', {
            detail: { action: this.responseList, chat: selectedChat }
        });
        this.dispatchEvent(selectedAction);
    }

    handleselectedaction() {
        var selectedActionMap = {};
        this.selectedActionList = [];
        selectedActionMap.Rhythm__Question__c = this.showChat.questionId;
        selectedActionMap.isSupplier = this.isSupplier;
        selectedActionMap.Rhythm__AccountAssessment__c = this.recordId;
        if (this.isSupplier === true) {
            selectedActionMap.Rhythm__AccountAssessment__c = this.accountassessmentid;
        }
        selectedActionMap.accountName = this.accountName;
        selectedActionMap.Rhythm__Account__c = this.accountId;
        selectedActionMap.Rhythm__Related_Record__c = this.assessment;
        selectedActionMap.Rhythm__Related_Record__Name = this.assessmentRecordName;
        this.selectedActionList.push(selectedActionMap);
    }
    handlechatHistory(event) {
        this.showChat = event.detail.chat;
        this.fileData = event.detail.file;
        this.handleselectedaction();
        const selectedChat = new CustomEvent('selectconversation', {
            detail: { chat: this.showChat, actionData: this.selectedActionList, file: this.fileData }
        });
        this.dispatchEvent(selectedChat);
    }
    /* summaryClickHandler is used to navigate to the sections */
    summaryClickHandler() {
        const showsummary = new CustomEvent('showsummary', {});
        this.dispatchEvent(showsummary);
    }
    /* section_navigationChangeHandler is used to navigate to the sections */
    section_navigationChangeHandler() {
        this.constructQuestionsAndAnswers(this.questionsList);
    }
    /* selectquestionHandler is used to highlight the question when flag icon is clicked */
    selectquestionHandler(event) {
        let x = this.template.querySelectorAll('c-rtmvpc-render-question-template');
        for (let i = 0; i < x.length; i++) {
            x[i].removehighlightHandler(event.detail.id);
        }
    }
    /* handleConversationData is used to Store the conversation in  the wrapper for a particular Question*/
    @api handleConversationData(chatterData) {
        //This loop is to iterate over the sections in the wrapper.
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (question.Id === chatterData.questionId) {
                    question.Rhythm__Conversation_History__c = chatterData.conversationHistory;
                }
                question.Children.forEach(subQuestion => {
                    subQuestion.questions.forEach(ques => {
                        if (ques.Id === chatterData.questionId) {
                            ques.Rhythm__Conversation_History__c = chatterData.conversationHistory;
                        }
                    })
                })
            })
        });
    }
    /*This method is to update the AccountAssessmentStatus to In Review. And to display the flags in customer portal. */
    handleStartReview() {
        let param = {};
        let status = 'In Review';
        param.assessmentStatus = status;
        param.recId = this.recordId;
        /* The Apex methd is to update the AccountAssessmentStatus to In Review */
        updateAccountAssessmentStatus({ paramMap: JSON.stringify(param) }).then(() => {
            this.showSaveAndSubmit = true;
            this.showInReview = false;
            const selectedEvent = new CustomEvent('updatetimeline', {
                detail: param
            });
            this.dispatchEvent(selectedEvent);
            setTimeout(() => { this.handleOnload() }, 350);
        }).catch(error => {

        });
        this.showcustomerbuttons = true;
        this.showInReview = false;
        this.showSaveAndSubmit = true;
    }
    handleSaveCustomer() {
        var updateRejectFlagList = [];
        var insertRejectFlagList = [];
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (typeof question.ResponseId !== 'undefined') {
                    var rejectFlagMap = {};
                    rejectFlagMap.sobjectType = 'Rhythm__Response__c';
                    rejectFlagMap.Id = question.ResponseId;
                    rejectFlagMap.Rhythm__Flag__c = question.Rhythm__Flag__c;
                    rejectFlagMap.Rhythm__Rejected__c = question.rejectButton;
                    updateRejectFlagList.push(rejectFlagMap);
                }
                if (typeof question.ResponseId === 'undefined') {
                    var flagMap = {};
                    flagMap.sobjectType = 'Rhythm__Response__c';
                    flagMap.Rhythm__Question__c = question.Id;
                    flagMap.Rhythm__Flag__c = question.Rhythm__Flag__c;
                    flagMap.Rhythm__Rejected__c = question.rejectButton;
                    flagMap.Rhythm__Is_Latest_Response__c = true;
                    flagMap.Rhythm__AccountAssessmentRelation__c = this.recordId;
                    insertRejectFlagList.push(flagMap);
                }
                if (question.Children.length > 0) {
                    question.Children.forEach(conditionalQuestion => {
                        if (conditionalQuestion.isdisplay) {
                            conditionalQuestion.questions.forEach(subQuestion => {
                                if (typeof subQuestion.ResponseId !== 'undefined') {
                                    var rejectFlagMap = {};
                                    rejectFlagMap.sobjectType = 'Rhythm__Response__c';
                                    rejectFlagMap.Id = subQuestion.ResponseId;
                                    if (question.rejectButton) {
                                        rejectFlagMap.Rhythm__Rejected__c = true;
                                        rejectFlagMap.Rhythm__Flag__c = false;
                                    }
                                    else {
                                        rejectFlagMap.Rhythm__Rejected__c = subQuestion.rejectButton;
                                        rejectFlagMap.Rhythm__Flag__c = subQuestion.Rhythm__Flag__c;
                                    }
                                    updateRejectFlagList.push(rejectFlagMap);
                                }
                                if (typeof subQuestion.ResponseId === 'undefined') {
                                    var flagMap = {};
                                    var rejectFlagMap = {};
                                    flagMap.sobjectType = 'Rhythm__Response__c';
                                    flagMap.Rhythm__Question__c = subQuestion.Id;
                                    if (question.rejectButton) {
                                        flagMap.Rhythm__Rejected__c = true;
                                        flagMap.Rhythm__Flag__c = false;
                                    }
                                    else {
                                        flagMap.Rhythm__Rejected__c = subQuestion.rejectButton;
                                        flagMap.Rhythm__Flag__c = subQuestion.Rhythm__Flag__c;
                                    }
                                    flagMap.Rhythm__Is_Latest_Response__c = true;
                                    flagMap.Rhythm__AccountAssessmentRelation__c = this.recordId;
                                    insertRejectFlagList.push(flagMap);
                                }
                            })
                        }
                    });
                }
            })
        })
        if (updateRejectFlagList.length > 0) {
            updateRejectFlag({ updateRejectFlagList: updateRejectFlagList, accountAssessment: this.recordId }).then({
            })
        }
        if (insertRejectFlagList.length > 0) {
            insertRejectFlag({ insertRejectFlagList: insertRejectFlagList, accountAssessment: this.recordId }).then({
            })
        }
        if (this.saveBool === false) {
            this.handleOnload();
        }
        this.saveBool = false;
    }
    submitReviewResponse() {
        this.handleSubmitReviewCustomer();
    }
    submitResponse() {
        this.isCustomerModalPopup = true;
    }
    customerCloseModal() {
        this.isCustomerModalPopup = false;
    }
    /* The Apex method is to update the AccountAssessmentStatus to 'Need More Information or Review Completed 
based on the flags on customer portal */
    handleSubmitCustomer() {
        let param = {};
        let boolflag = false;
        let isNeedMoreInfo = false;
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(item => {
                if (item.Children.length == 0) {
                    if (item.customerFlag && item.Rhythm__Flag__c && item.rejectButton) {
                        this.showToast = true;
                        this.success = false;
                        boolflag = true;
                        this.totastmessage = 'The question is already rejected you cannot ask for additional info';
                    }
                    else {
                        param.assessmentStatus = 'Need More Information';
                        isNeedMoreInfo = true;
                    }
                }
                if (item.Children.length > 0) {
                    if (item.customerFlag && item.Rhythm__Flag__c && item.rejectButton) {
                        this.showToast = true;
                        this.success = false;
                        boolflag = true;
                        this.totastmessage = 'The question is already rejected you cannot ask for additional info';
                    }
                    item.Children.forEach(conditionalQuestion => {
                        if (conditionalQuestion.isdisplay) {
                            conditionalQuestion.questions.forEach(subQuestion => {
                                if (subQuestion.customerFlag && subQuestion.Rhythm__Flag__c && subQuestion.rejectButton) {
                                    this.showToast = true;
                                    this.success = false;
                                    boolflag = true;
                                    this.totastmessage = 'The question is already rejected you cannot ask for additional info';
                                }
                                else {
                                    param.assessmentStatus = 'Need More Information';
                                    isNeedMoreInfo = true;
                                }
                            });
                        }
                    });
                }
            });
        });
        if (isNeedMoreInfo && boolflag === false) {
            param.recId = this.recordId;
            /* The Apex methd is to update the AccountAssessmentStatus to Need more Information or Review Completed */
            updateAccountAssessmentStatus({ paramMap: JSON.stringify(param) }).then(() => {
                const selectedEvent = new CustomEvent('updatetimeline', {
                    detail: param
                });
                this.dispatchEvent(selectedEvent);
                this.handleSaveCustomer();
            }).catch(error => {

            });
            this.showToast = true;
            this.success = true;
            this.totastmessage = 'The Assessment Status is updated to  ' + param.assessmentStatus + ' successfuly.';
        }
    }
    handleSubmitReviewCustomer() {
        let param = {};
        this.isCustomerModalPopup = false;
        this.showcustomerbuttons = false;
        this.showSaveAndSubmit = false;
        param.assessmentStatus = 'Review Completed';
        param.recId = this.recordId;
        /* The Apex methd is to update the AccountAssessmentStatus to Need more Information or Review Completed */
        updateAccountAssessmentStatus({ paramMap: JSON.stringify(param) }).then(() => {
            const selectedEvent = new CustomEvent('updatetimeline', {
                detail: param
            });
            this.dispatchEvent(selectedEvent);
            this.handleSaveCustomer();
        }).catch(error => {

        });
        this.showToast = true;
        this.success = true;
        this.totastmessage = 'The Assessment Status is updated to  ' + param.assessmentStatus + ' successfuly.';
    }
}