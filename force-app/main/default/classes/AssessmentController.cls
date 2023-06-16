/* 
* Class Name        : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : AssessmentController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Assessment__c,Response__c.
* Last Modified Date: 
*/
public with sharing class AssessmentController {

    public static SecurityCheckController safe = new SecurityCheckController();
    private static Savepoint sp;
    
    @Auraenabled
    Public static void QuestionarieList(){
    }
    
    Public static List<SObject> getAssessmentList(){
        return null;
    }

    
    /**
     * Gets the assessment information.
     * @param assessmentId This is a record id of an Assessment__c.  
    */
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getSupplierAssessmentList(String assessmentId){
        List<Sobject> getAssementTemplate = [SELECT Id,Name,Template__c,Disclosure__c,Status__c FROM Assessment__c WHERE Id =:assessmentId];
        System.debug('getAssementTemplate'+getAssementTemplate);
        return getAssementTemplate;
    }

    
    /**
     * Gets the Question__c,Section__c information of a particular Assessment_Template__c.
     * @param templateId This is a record id of an Assessment_Template__c.  
    */
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getQuestionsList(String templateId){
        List<Question__c> questionList = [SELECT Id,Name,Section__c,Question_Type__c,Required__c,
                                          Conditional_Response__c,OptionValueSet__c,Question__c,Requires_File_Upload__c,
                                          Parent_Question__c,HelpText__c,Section__r.Name,Section__r.Id,
                                          Assessment_Template__c 
                                          FROM Question__c 
                                          WHERE Assessment_Template__c =:templateId];
        return questionList;
    }

    /**
     * Gets the Response__c information of an Assessment__c.
     * @param assessmentId This is a record id of an Assessment__c.  
    */
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getSupplierResponseList(String assessmentId){
        List<SObject> SupplierResponseList=  [SELECT Id, Question__c,Assessment__c,Question__r.Question_Type__c, Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, 
                                              Conversation_History__c,LastModifiedDate,LastModifiedById FROM Response__c WHERE Assessment__c=:assessmentId and Is_Latest_Response__c= true];
        return SupplierResponseList;
    }
	/*@AuraEnabled
    public static void getSectionsandAnswers(String templateId)
    {
        List<Sobject> sectionsAndQuestions = [select id,name,(select id,name,Section__c,Section__r.Name,Question_Type__c,Question__c,Requires_File_Upload__c,
                                                              Required__c,Parent_Question__c,OptionValueSet__c,Default_Value__c,Name__c,HelpText__c
                                                              from Questions__r) from Assessment_Template__c];
    }*/


    @AuraEnabled(cacheable=true)
    Public static List<SObject> getQuestionsListSectionList(String templateId){
        return null;
    }


    /**
     * Insert or update the Response__c of a supplier(Account) for an Assessment__c.
     * @param suppResponseList Response__c wrapper.
     * @param vendorId supplier Account Id.
     * @param assesmentId record id of an Assessment__c.
     * @param isSubmit true:save & submit(update the Assessment__c status to submitted), false: only save (update the Assessment__c status to Draft)
    */
    @AuraEnabled
    Public static void createSupplierResponse(List<SObject> suppResponseList,String vendorId,String assesmentId, Boolean isSubmit){
        /*List<Response__c> responseList = new List<Response__c>();
        List<Response__c> finalresponse = new List<Response__c>();
        List<Id> questionIds = new List<Id>();
        List<Id> fileResponseId = new List<Id>();
        Map<Id,SObject> responseMap = new Map<Id,SObject>();
        List<Response__c> existingResponses = new List<Response__c>();
        System.debug('suppResponseList'+suppResponseList);
        for(Integer i=0;i<suppResponseList.size();i++)
        {
            questionIds.add((Id)suppResponseList[i].get('Rhythm__Question__c'));
        }
        System.debug('questionIds'+questionIds);
        if(questionIds.size()>0)
        {
            existingResponses = [select Id,Name,Question__c,Response__c,Files__c,Assessment__c from Response__c where Question__c IN:questionIds];
            questionIds = new List<Id>();
            for(Response__c resp :existingResponses)
            {
                if(resp.Files__c !=null)
                {
                    responseList.add(resp);
                    fileResponseId.add(resp.Question__c);
                    responseMap.put(resp.Question__c,resp);
                }
            }
        }
        System.debug('responseMap'+responseMap);
        System.debug('suppResponseList'+suppResponseList);
        System.debug('fileResponseId'+fileResponseId);
        for(Integer i=0;i<suppResponseList.size();i++)
        {
            if(fileResponseId.contains((Id)suppResponseList[i].get('Rhythm__Question__c')))
            {
                System.debug('Frst if'+responseMap.get((Id)suppResponseList[i].get('Rhythm__Question__c')));
                Response__c resp =(Response__c) responseMap.get((Id)suppResponseList[i].get('Rhythm__Question__c'));
                System.debug('resp'+resp);
                System.debug('suppResponseList'+suppResponseList[i]);
                System.debug(resp.Rhythm__Question__c ==(Id)suppResponseList[i].get('Rhythm__Question__c'));
                    if(resp.Rhythm__Question__c ==(Id)suppResponseList[i].get('Rhythm__Question__c'))
                    {
                        System.debug('Into if'+ resp.Rhythm__Files__c);
                        Response__c response = new Response__c();
            			response.Assessment__c = (Id)suppResponseList[i].get('Rhythm__Assessment__c');
            			response.Question__c =(Id)suppResponseList[i].get('Rhythm__Question__c');
            			response.Account__c = (Id)suppResponseList[i].get('Rhythm__Account__c');
            			response.Response__c = (String)suppResponseList[i].get('Rhythm__Response__c');
                        response.Is_Latest_Response__c = True;
                        response.Files__c = resp.Rhythm__Files__c;
                        finalresponse.add(response);
                    }
            }
            else
            {
                System.debug('Into else');
                	Response__c response = new Response__c();
            		response.Assessment__c = (Id)suppResponseList[i].get('Rhythm__Assessment__c');
            		response.Question__c =(Id)suppResponseList[i].get('Rhythm__Question__c');
            		response.Account__c = (Id)suppResponseList[i].get('Rhythm__Account__c');
            		response.Response__c = (String)suppResponseList[i].get('Rhythm__Response__c');
                	response.Is_Latest_Response__c = True;
                finalresponse.add(response);
            }
        }
      	for(Response__c resp : existingResponses)
        {
            resp.Is_Latest_Response__c = false;
        }
        UPDATE existingResponses;
        INSERT finalresponse;*/
        List<Id> questionIds = new List<Id>();
        System.debug('suppResponseList'+suppResponseList);
        for(Integer i=0;i<suppResponseList.size();i++)
        {
            questionIds.add((Id)suppResponseList[i].get('Rhythm__Question__c'));
        }
        System.debug('questionIds'+questionIds);
        List<Response__c> existingResponses = new List<Response__c>();
        if(questionIds.size()>0)
        {
            existingResponses = [select Id,Name,Question__c,Response__c,Files__c,Assessment__c,Flag__c,Is_Latest_Response__c from Response__c where Question__c IN:questionIds];  
        }
        for(Response__c resp :existingResponses)
        {
            resp.Is_Latest_Response__c = false;
        }
        UPDATE existingResponses;
        INSERT suppResponseList;
        
        List<Assessment__c> assessment=[SELECT Id,Name,Status__c from Assessment__c WHERE Id=:assesmentId ];
        if(isSubmit)
        {
            assessment[0].Status__c ='Submitted';
            UPDATE assessment;
        }
        else{
            assessment[0].Status__c ='Draft';
            UPDATE assessment;
        }
    }
   
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getAssessmentlist(String assessmentTemplateId2){
        //return [select Id,Disclosure__c from Assessment_Template__c where id=:assessmentTemplateId2];
        return null;
        
    }
 
    @AuraEnabled
    public static List<Object> getAssesmentRecords()
    {
        List<Assessment__c> AssessmentRecords= [SELECT Name,Target_Completion_Date__c,Status__c,
                                                Additional_Requests__c,Customer_Review__c,Number_of_Questions__c,
                                                Number_of_Suppliers_responded_back__c 
                                                FROM Assessment__c];
        //System.debug('AssessmentRecords'+AssessmentRecords);
        return AssessmentRecords;
    }
   @AuraEnabled
    public static List<Rythm__Response__c> getResponseList(string assessmentId,string questionId)
    {
        List<Response__c> responseRecords=[SELECT Conversation_History__c,createdDate 
                                            FROM Response__c 
                                            WHERE Assessment__c =:assessmentId AND Question__c=:questionId];
        
        return responseRecords;
    }
    /* getUserName method is used to get the username */
    @AuraEnabled
    public static string getUserName()
    {
        string userName=UserInfo.getName();
        return userName;
    }
     @AuraEnabled
    public static string getAccountId()
    {
        List<User> strAccId = [select Contact.AccountId from User where id=:userinfo.getuserid()];
        System.debug('sss'+strAccId[0].Contact.AccountId);
        return strAccId[0].Contact.AccountId;
    }
@AuraEnabled
    public static List<SObject> getAssessmentJunctionRecords(String accountId)
    {
        System.debug('accountId'+accountId);
        List<SObject> assessmentData = [select Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.name ,Assessment__r.Rhythm__Status__c,Assessment__r.Rhythm__Customer_Review__c,Assessment__r.Rhythm__Number_of_Questions__c,
Assessment__r.Rhythm__Number_of_Suppliers_responded_back__c,Assessment__r.Rhythm__Additional_Requests__c,Number_of_Questions__c, Number_of_Responses__c from AccountAssessmentRelation__c where Account__c=:accountId ];
        System.debug('assessmentData'+assessmentData);
        return assessmentData;
    }

    /**
     * Its used to delete a file reference in Response__c.
     * @param questionId record id of a Question__c.
     * @param name filename .
    */
    @AuraEnabled
    public static Object deleteFileAttachment(String questionId,String name)
    {
        List<Response__c> responseRecords = [SELECT Id, Question__c,Question__r.Name, Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,LastModifiedDate,LastModifiedById FROM Response__c WHERE Question__c=:questionId
                                            and Rhythm__Is_Latest_Response__c = true];
        
            List<Object> responseFilesData= (List<Object>)JSON.deserializeUntyped(responseRecords[0].Files__c);
        List<object>duplicate=new List<object>();
        for(Integer i=0;i<responseFilesData.size();i++)
        {
            Map<String,Object> mp = (Map<String,Object>)responseFilesData[i];
            String responseurl = (String)mp.get('name');
            System.debug('name'+name);
            System.debug('responseurl'+responseurl);
            System.debug('responseurl==name'+responseurl==name);
            if(responseurl==name)
            {
                Object obj = responseFilesData.remove(i);
            }
        }
        responseRecords[0].Files__c = JSON.serialize(responseFilesData);
        UPDATE responseRecords;
        return JSON.deserializeUntyped(responseRecords[0].Files__c);
        
    }


    /**
     * Its used to save the communication log of a quesiton in Response__c.
     * @param responseList JSON format of a conversation log.
     * @param assessmentId record id of an Assessment__c .
     * @param questionId record id of a Question__c .
    */
    @AuraEnabled
    public static void saveChatterResponse(string responseList,string assessmentId,string questionId)
    {
        List<Response__c> responseRecords=[SELECT Conversation_History__c,createdDate	FROM Response__c WHERE Assessment__c =:assessmentId AND Question__c=:questionId And Is_Latest_Response__c=true ];
        responseRecords[0].Conversation_History__c=responseList;
        UPDATE responseRecords;
        
    }
    


    /**
     * Its used to capture the error information of any apex/js call.
     * @param componentName LWC component name.
     * @param methodName Apex method name.
     * @param className Apex class name.
     * @param errorData stack trace information.
    */
    @AuraEnabled
    public static void errorLogRecord(string componentName,string methodName,string className,string errorData)
    {
        System.debug('hhhh');
        Rythm__ErrorTransactionLog__c errorRecord=new Rythm__ErrorTransactionLog__c();
        errorRecord.Rythm__Class_Name__c=className;
        errorRecord.Rythm__LWC_Component_Name__c=componentName;
        errorRecord.Rythm__Method_Name__c=methodName;
        errorRecord.Rythm__Error_Stack_Trace__c=errorData;
        insert errorRecord;
    }
    @AuraEnabled
    public static Boolean updateSectionSequence(list<Section__c> secList){
        UPDATE secList;
        return true;
    }


    /**
     * Its used to save the file and save the reference link in Response__c in JSON format.
     * @param resId record id of a Response__c.
     * @param fileBlob file content.
     * @param name file name.
     * @param quesId record id of a Question__c.
     * @param assessmentId record id of an Assessment__c.
    */
    @AuraEnabled    
    public static List<sObject> uploadFile(String resId, String fileBlob, String name,string quesId,string assessmentId)
    {
        try
        {
            System.debug('resId'+resId);
            System.debug('quesId'+quesId);
            System.debug('assessmentId'+assessmentId);
            String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
            Blob file=EncodingUtil.base64Decode(fileBlob.split(',')[1]);
            ContentVersion cv=new ContentVersion();
            cv.VersionData=file;
            cv.PathOnClient=name;
            INSERT cv;
            List<Response__c> srList = new List<Response__c>();
            List<ContentVersion> cvList=[SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id=:cv.Id];
            String ftype = name.substringAfter('.');
            if(quesId!=null)
            {
                System.debug('Into if condition'+resId);
                srList = [SELECT Id,Files__c,Question__c FROM Response__c WHERE Question__c =:quesId and Is_Latest_Response__c = true];
                System.debug('srList'+srList);
                String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+cvList[0].ContentDocumentId+'?operationContext=S1';
                String fileJson = '{"name":"'+name+'","url":"'+fileUrl+'","type":"'+ftype+'"}';
                srList[0].Files__c = (srList[0].Files__c == null || srList[0].Files__c.trim().length() == 0 || srList[0].Files__c=='[]') ? '['+fileJson+']' : '['+fileJson+','+srList[0].Files__c.substring(1,srList[0].Files__c.length());
                System.debug('srList'+srList);
                UPDATE srList;
            }
            else{
                System.debug('Into else condition');
                Response__c res=new Response__c();
                res.Question__c=quesId;
                res.Assessment__c=assessmentId;
                String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+cvList[0].ContentDocumentId+'?operationContext=S1';
                string fileJson = '[{"name":"'+name+'","url":"'+fileUrl+'","type":"'+ftype+'"}]';
                res.Files__c=fileJson;
                srList.add(res);
                INSERT srList;
            }
            return srList;
        }
        catch(Exception e)
        {
            //System.debug(e.getLineNumber()+' : '+e.getMessage());
            //use eror log
            return null;
        }
    }
    
}