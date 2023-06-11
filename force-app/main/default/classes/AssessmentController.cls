/* Class Name   : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : AssessmentController class is used for DML operations on the objects Assessment__c,Response__c,Question__c,Section__c,Assessment_Template__c.
* Last Modified Date: 
*/
public class AssessmentController {
    @Auraenabled
    Public static void QuestionarieList(){
        //return [Select id,Name,Title__c,Type__c from Questionarie__c];
    }
    
    Public static List<SObject> getAssessmentList(){
        /*List<Supplier_Assessment__c> suppList = [SELECT ID,Project__c, Vendor__c, Assesment_Status__c, 
Submission_Date__c, Assessment_Template__c, Start_Date__c, Target_End_Date__c,Assessment_Template__r.Disclosure__c,
Frequency__c, Assessment_Type__c FROM Supplier_Assessment__c];
return suppList;
*/
        return null;
    }
    /* getSupplierAssessmentList method is used to get the assessment data*/
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getSupplierAssessmentList(String assessmentId){
        /*List<SObject> SupplierAssessment= [SELECT id,Assessment_Template__c, Assesment_Status__c,Assessment_Template__r.Disclosure__c,Name,CreatedBy.Name,CreatedDate from Assessment__c  where Id=:assessmentId];
System.debug('SupplierAssessment'+SupplierAssessment);*/ // commented by koushik
        List<Sobject> getAssementTemplate = [select id,name,Template__c,Template__r.Disclosure__c,Status__c from Assessment__c where id =:assessmentId];
        System.debug('getAssementTemplate'+getAssementTemplate);
      /*  List<Id> templateId = new List<Id>();
        for(Sobject assessmenttemplate :getAssementTemplate)
        {
            Id assessmentTempId = (ID)assessmenttemplate.get('Rhythm__Template__c');
            templateId.add(assessmentTempId);
        }
        List<Sobject> getSectionsdata=[select id,name,Template__c,Template__r.Disclosure__c,Status__c from Assessment__c where Template__c IN :templateId];
        System.debug('getSectionsdata'+getSectionsdata);*/
        return getAssementTemplate;
        
    }
    /* getQuestionsList method is used to get all the questions and sections */
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getQuestionsList(String templateId){
        List<QuestionWrapper> questionListWrapper = new List<QuestionWrapper>();
        List<Question__c> questionList = [select id,name,Section__c,Question_Type__c,
                                          Conditional_Response__c,OptionValueSet__c,Question__c,Requires_File_Upload__c,
                                          Parent_Question__c,HelpText__c,Section__r.Name,Section__r.Id,
                                          Assessment_Template__c,(select Flag__c from Responses__r) from Question__c where Assessment_Template__c =:templateId];
        /* List<Questionnaire__c> questionList = [SELECT Id, Name, Question__c, Type__c, OptionValueSet__c,Assessment_Template__c,
section__r.Name,section__r.LastModifiedDate,section__r.LastModifiedBy.Name, Parent_Question__c,(Select Id, Name, Question__c, Type__c, OptionValueSet__c,Parent_Question__c from Questions__r)
FROM Questionnaire__c 
WHERE Assessment_Template__c =:templateId
Order By Section__r.Name ASC,Question__c ASC
];
*/
        /** sridhar comment  below**/
        /* List<Assessment_Template_Junction__c> questionList = [select Id,Assessment_Template__c, Question__c,Question__r.Parent_Question__c,Question__r.Question__c,Question__r.Required__c,Question__r.Question_Type__c,Question__r.OptionValueSet__c,Question__r.Conditional_Response__c,Question__r.HelpText__c,
Section__c,Section__r.Name,
Section__r.Parent_Section__c,Section__r.Root_Section__c from Assessment_Template_Junction__c where Assessment_Template__c=:templateId];
System.debug('questionList'+questionList);
for(Assessment_Template_Junction__c ac:questionList)
{
System.debug('ac @@'+ac);
}
return questionList;
*/
        return questionList;
        /*

for(Questionnaire__c question : questionList){
QuestionWrapper qw = new QuestionWrapper();
qw.questionId = question.ID;
qw.Question = question.Question__c;
qw.Name = question.Name;
qw.Type = question.Type__c;

qw.optionValueSet= question.OptionValueSet__c;
qw.assessmentTemplate = question.Assessment_Template__c;

qw.parentQuestion = question.Parent_Question__c == null?'':question.Parent_Question__c;
qw.sectionName = question.Section__r.Name;
qw.lastModifiedDate = question.Section__r.LastModifiedDate;
qw.lastModifiedBy = question.section__r.LastModifiedBy.Name;
qw.childquestionList = question.Questions__r;
for(Questionnaire__c childQuestion : question.Questions__r){
childQuestionWrapper childQues = new childQuestionWrapper();
childQues.Question = childQuestion.Question__c;
childQues.Name     = childQuestion.Name;
childQues.parentQuestion = childQuestion.Parent_Question__c == null?'':childQuestion.Parent_Question__c;
childQues.Type = childQuestion.Type__c;
List<childQuestionWrapper> chdquesWrap = new List<childQuestionWrapper>();
chdquesWrap.add(childQues);
qw.childQuestions = chdquesWrap;
}
questionListWrapper.add(qw);
}


return questionListWrapper; */
        
    }
    /* getSupplierResponseList method is used to get response data*/
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getSupplierResponseList(String assessmentId){
        System.debug('assessmentId'+assessmentId);
        List<Sobject> SupplierResponseList=  [select Id, Question__c, Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,LastModifiedDate,LastModifiedById from Response__c where Assessment__c=:assessmentId];
        System.debug('SupplierResponseList'+SupplierResponseList);
        return SupplierResponseList;
    }
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getQuestionsListSectionList(String templateId){
        /*List<Questionnaire__c> questionList = [SELECT Id, Name, Question__c, Type__c, OptionValueSet__c,Assessment_Template__c,
section__r.Name,Parent_Question__c
FROM Questionnaire__c Where section__r.Name <> null
Order By Section__r.Name ASC,Question__c ASC
];

return questionList;
*/
        return null;
    }
    /* createSupplierResponse method is used to create and update responses */
    @AuraEnabled
    Public static void createSupplierResponse(List<SObject> suppResponseList,String vendorId,String assesmentId, Boolean isSubmit){
        List<Response__c> responseList = new List<Response__c>();
        System.debug('assesmentId'+assesmentId);
         System.debug('suppResponseList'+suppResponseList);
        
        for(Integer i=0;i<suppResponseList.size();i++)
        {
            Response__c response = new Response__c();
            response.Assessment__c = (Id)suppResponseList[i].get('Assessment__c');
            response.Question__c =(Id)suppResponseList[i].get('Rhythm__Question__c');
            response.Account__c = (Id)suppResponseList[i].get('Rhythm__Account__c');
            response.Response__c = (String)suppResponseList[i].get('Rhythm__Response__c');
            responseList.add(response);
        }
        insert responseList;
       List<Assessment__c> at=[select id,name,Status__c from Assessment__c where id=:assesmentId ];
        if(isSubmit)
        {
                at[0].Status__c ='Submitted';
                update at;
        }
        else{
            at[0].Status__c ='Draft';
                update at;
        }
        System.debug('Response inserted succes'+responseList);
       /* if(vendorId!=null && assesmentId!=null && String.isNotEmpty(vendorId) && String.isNotEmpty(assesmentId)){
            System.debug('Mani'+suppResponseList);
            List<Supplier_Response__c> suppResList = [SELECT id,Assessment__c,Questionnaire__c,Response__c,Vendor__c from Supplier_Response__c 
            WHERE Assessment__c =:assesmentId and Vendor__c=:vendorId];
            if(suppResList!=null && suppResList.size()>0){
                delete suppResList;
            }
        }
        INSERT suppResponseList;
        
        if(isSubmit==true && assesmentId!=null)
        {
            List<Supplier_Assessment__c> saList=[Select Id, Assesment_Status__c from Supplier_Assessment__c where Id=:assesmentId];
            saList[0].Assesment_Status__c='Submitted';
            update saList;
        }
        */
    }
    
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getAssessmentlist(String assessmentTemplateId2){
        //return [select Id,Disclosure__c from Assessment_Template__c where id=:assessmentTemplateId2];
        return null;
        
    }
 
    @AuraEnabled
    public static List<Object> getAssesmentRecords()
    {
        List<Assessment__c> AssessmentRecords= [select Name,Target_Completion_Date__c,Status__c,
                                                Additional_Requests__c,Customer_Review__c,Number_of_Questions__c,
                                                Number_of_Suppliers_responded_back__c from Assessment__c];
        System.debug('AssessmentRecords'+AssessmentRecords);
        return AssessmentRecords;
    }
    @AuraEnabled
    public static List<Response__c> getResponseList(string assessmentId,string questionId)
    {
        List<Response__c> responseRecords=[select Conversation_History__c,createdDate from Response__c where Assessment__c =:assessmentId AND Question__c=:questionId];
        
        return responseRecords;
    }
    /* getUserName method is used to get the username */
    @AuraEnabled
    public static string getUserName()
    {
        string userName=UserInfo.getName();
        return userName;
    }
    /* deleteFileAttachment method is used to delete the file and file data from the response record*/
    @AuraEnabled
    public static Object deleteFileAttachment(String questionId,String name)
    {
        System.debug('questionId'+questionId);
        System.debug('url'+name);
        
        List<Response__c> responseRecords = [select Id, Question__c,Question__r.Name, Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,LastModifiedDate,LastModifiedById from Response__c where Question__c=:questionId];
        List<Object> responseFilesData= (List<Object>)JSON.deserializeUntyped(responseRecords[0].Files__c);
        List<object>duplicate=new List<object>();
        System.debug(responseFilesData);
        for(Integer i=0;i<responseFilesData.size();i++)
        {
            Map<String,Object> mp = (Map<String,Object>)responseFilesData[i];
            String responseurl = (String)mp.get('name');
            System.debug('ssurl'+responseurl);
            if(responseurl==name)
            {
                System.debug('obj1'+responseFilesData);
                Object obj = responseFilesData.remove(i);
                System.debug('obj'+responseFilesData);
            }
        }
        responseRecords[0].Files__c = JSON.serialize(responseFilesData);
        update responseRecords;
        System.debug(responseFilesData);
        System.debug(JSON.deserializeUntyped(responseRecords[0].Files__c));
        return JSON.deserializeUntyped(responseRecords[0].Files__c);
    }
    /* saveChatterResponse method is used to save the conversation history in the response record*/
    @AuraEnabled
    public static void saveChatterResponse(string responseList,string assessmentId,string questionId)
    {
        List<Response__c> responseRecords=[select Conversation_History__c,createdDate	from Response__c where Assessment__c =:assessmentId AND Question__c=:questionId];
        responseRecords[0].Conversation_History__c=responseList;
        update responseRecords;
        
    }
    /* errorLogRecord method is used to catch the errors and  create the ErrorTransactionLog__c records with that errors*/
    @AuraEnabled
    public static void errorLogRecord(string componentName,string methodName,string className,string errorData)
    {
        ErrorTransactionLog__c errorRecord=new ErrorTransactionLog__c();
        errorRecord.Class_Name__c=className;
        errorRecord.LWC_Component_Name__c=componentName;
        errorRecord.Method_Name__c=methodName;
        errorRecord.Error_Stack_Trace__c=errorData;
        insert errorRecord;
    }
    @AuraEnabled
    public static Boolean updateSectionSequence(list<Section__c> secList){
        
        system.debug('secList  '+secList);
        update secList;
        /* list<Rhythm__Section__c> lst = new list<Rhythm__Section__c>();
for(Rhythm__Section__c sec:secList)
{    
system.debug(sec.get('id'));
Rhythm__Section__c rc=new Rhythm__Section__c();
rc.id=(Id)sec.get('id');
rc.Rhythm__Section_Sequence_Number__c=sec.Rhythm__Section_Sequence_Number__c;
lst.add(rc);
}*/
        //system.debug('ids list :'+idlist);
        /* List<Rhythm__Section__c> lstww=[select Id,Rhythm__Section_Sequence_Number__c from Rhythm__Section__c where Id IN : idlist];
for(Integer i=0;i<lstww.size();i++)
{
Rhythm__Section__c rc=new Rhythm__Section__c();
rc.id=(Id)lstww[i].get('id');
rc.Rhythm__Section_Sequence_Number__c=secList[i].Rhythm__Section_Sequence_Number__c;
lst.add(rc);
}*/
        /*update lst;
System.debug('section updated list '+lst);*/
        return true;
        
    }
    /* uploadFile method  is used to upload the file and store the file data in response records*/
    @AuraEnabled    
    public static List<sObject> uploadFile(String resId, String fileBlob, String name,string quesId,string assessmentId)
    {
        try
        {
            String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
            Blob file=EncodingUtil.base64Decode(fileBlob.split(',')[1]);
            ContentVersion cv=new ContentVersion();
            cv.VersionData=file;
            cv.PathOnClient=name;
            insert cv;
            List<Response__c> srList = new List<Response__c>();
            List<ContentVersion> cvList=[Select Id, ContentDocumentId from ContentVersion where Id=:cv.Id];
            String ftype = name.substringAfter('.');
            if(resId !=null)
            {
                srList = [Select Id,Files__c	from Response__c where Id=:resId];
                
                String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+cvList[0].ContentDocumentId+'?operationContext=S1';
                
                String fileJson = '{"name":"'+name+'","url":"'+fileUrl+'","type":"'+ftype+'"}';
                srList[0].Files__c = (srList[0].Files__c == null || srList[0].Files__c.trim().length() == 0 || srList[0].Files__c=='[]') ? '['+fileJson+']' : '['+fileJson+','+srList[0].Files__c.substring(1,srList[0].Files__c.length());
                update srList;
            }
            else{
                Response__c res=new Response__c();
                res.Question__c=quesId;
                res.Assessment__c=assessmentId;
                String fileUrl = 'https://page-power-5077-dev-ed.scratch.lightning.force.com/sfc/servlet.shepherd/document/download/'+cvList[0].ContentDocumentId+'?operationContext=S1';
                string fileJson = '{"name":"'+name+'","url":"'+fileUrl+'","type":"'+ftype+'"}';
                res.Files__c=fileJson;
                srList.add(res);
                insert srList;                
            }
            System.debug('srList'+srList);
            /*List<ContentVersion> cv=[Select Id, ContentDocumentId from ContentVersion where Id=:a.Id];
ContentDocumentLink cdl=new ContentDocumentLink();
cdl.ContentDocumentId=cv[0].ContentDocumentId;
cdl.LinkedEntityId=Id.valueOf(resId);
cdl.ShareType = 'I';
cdl.Visibility='AllUsers';
insert cdl;*/
            return srList;
        }
        catch(Exception e)
        {
            System.debug(e.getLineNumber()+' : '+e.getMessage());
            return null;
        }
    }
    
    
    public class QuestionWrapper{
        @AuraEnabled
        public Id questionId{get;set;}
        @AuraEnabled
        public String Question{get;set;}
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String parentQuestion{get;set;}
        @AuraEnabled
        public String Type{get;set;}
        @AuraEnabled
        public String sectionName{get;set;}
        @AuraEnabled
        public String conditionalValue{get;set;}
        @AuraEnabled
        public String assessmentTemplate{get;set;}
        @AuraEnabled
        public String optionValueSet{get;set;}
        @AuraEnabled
        public datetime lastModifiedDate{get;set;}
        @AuraEnabled
        public String lastModifiedBy{get;set;}
        @AuraEnabled
        public List<SObject> childquestionList {get;set;}
        @AuraEnabled
        public List<childQuestionWrapper> childQuestions{get;set;}
    }
    public class childQuestionWrapper{
        @AuraEnabled
        public String Question{get;set;}
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String parentQuestion{get;set;}
        @AuraEnabled
        public String Type{get;set;}
    }   
}