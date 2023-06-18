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
    public static List<SObject> getSupplierAssessmentList(String assessmentId){
        List<Sobject> getAssementTemplate = [SELECT Id,Name,Template__c,Disclosure__c,Status__c 
                                                FROM Assessment__c 
                                                WHERE Id =:assessmentId
                                                LIMIT 50000];
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
                                          WHERE Assessment_Template__c =:templateId
                                          LIMIT 50000];
        return questionList;
    }

    /**
     * Gets the Response__c information of an Assessment__c.
     * @param assessmentId This is a record id of an Assessment__c.  
    */
    @AuraEnabled(cacheable=true)
    public static List<SObject> getSupplierResponseList(String assessmentId){
        List<SObject> SupplierResponseList=  [SELECT Id, Question__c,Assessment__c,Question__r.Question_Type__c, 
                                              Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, 
                                              Conversation_History__c,LastModifiedDate,LastModifiedById 
                                              FROM Response__c 
                                              WHERE Assessment__c=:assessmentId AND Is_Latest_Response__c= true];
        return SupplierResponseList;
    }
	

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
    public static void createSupplierResponse(List<SObject> suppResponseList,String vendorId,String assesmentId, Boolean isSubmit){
        
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
     /**
     * Gets the Assessment__History information of a Status__c field in Assessment__c.
     * @param assessmentId This is a record id of an Assessment__c.  
    */
 	@AuraEnabled
    public static List<Sobject> getAssessmentStatus(String assessmentId)
    {
        List<Sobject> assessmentstatus =[SELECT Id, IsDeleted, ParentId, CreatedById, CreatedDate, Field, DataType, OldValue, NewValue  
                                         FROM Assessment__History 
                                         WHERE ParentId=:assessmentId AND Field ='Rhythm__Status__c' order by createdDate desc ];
        return assessmentstatus;
    }

   /**
     * Gets the all Assessment__c records information of an Assessment__c.
    */
    @AuraEnabled
    public static List<Object> getAssesmentRecords()
    {
        List<Assessment__c> AssessmentRecords= [SELECT Name,Target_Completion_Date__c,Status__c,
                                                Additional_Requests__c,Customer_Review__c,Number_of_Questions__c,
                                                Number_of_Suppliers_responded_back__c,Start_Date__c,End_Date__c,CreatedDate
                                                FROM Assessment__c LIMIT 50000];
        return AssessmentRecords;
    }
    @AuraEnabled
    public static List<Response__c> getResponseList(string assessmentId,string questionId)
    {
        List<Response__c> responseRecords=[SELECT Conversation_History__c,createdDate 
                                            FROM Response__c 
                                            WHERE Assessment__c =:assessmentId AND Question__c=:questionId AND Is_Latest_Response__c=true];
        
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
        List<SObject> assessmentData = [SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.name ,Assessment__r.Status__c,Assessment__r.Customer_Review__c,Assessment__r.Number_of_Questions__c,
                                        Assessment__r.Number_of_Suppliers_responded_back__c,Assessment__r.Additional_Requests__c,Number_of_Questions__c, Number_of_Responses__c 
                                        FROM AccountAssessmentRelation__c 
                                        WHERE Account__c=:accountId 
                                        LIMIT 50000];
        return assessmentData;
    }
    
    @AuraEnabled
    public static List<Sobject> getAccountAssessmentRecordData(String assrecordId)
    {
        List<Sobject> accountassessment = [SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.name ,
                                            Assessment__r.Status__c,Assessment__r.Customer_Review__c,
                                            Assessment__r.Number_of_Questions__c,Assessment__r.Number_of_Suppliers_responded_back__c,
                                            Assessment__r.Additional_Requests__c,Number_of_Questions__c,
                                            Assessment__r.Template__c, Number_of_Responses__c 
                                            FROM AccountAssessmentRelation__c 
                                            WHERE Id=:assrecordId ];
        return accountassessment;
    }

    /**
     * Its used to delete a file reference in Response__c.
     * @param questionId record id of a Question__c.
     * @param name filename .
    */
    @AuraEnabled
    public static Object deleteFileAttachment(String questionId,String name)
    {
        List<Response__c> responseRecords = [SELECT Id, Question__c,Question__r.Name, Assessment__r.Name,Files__c, Response__c,
                                                CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,
                                                LastModifiedDate,LastModifiedById 
                                                FROM Response__c 
                                                WHERE Question__c=:questionId AND Is_Latest_Response__c = true
                                                LIMIT 50000];
        
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
        ErrorTransactionLog__c errorRecord=new ErrorTransactionLog__c();
        errorRecord.Class_Name__c=className;
        errorRecord.LWC_Component_Name__c=componentName;
        errorRecord.Method_Name__c=methodName;
        errorRecord.Error_Stack_Trace__c=errorData;
        INSERT errorRecord;
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
                srList = [SELECT Id,Files__c,Question__c 
                          FROM Response__c 
                          WHERE Question__c =:quesId AND Is_Latest_Response__c = true];
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

    /**
     * Its used to get the suppliers.
     * @param searchKey userinput for the search.
    */
    @AuraEnabled(cacheable=true)
    public static List<Account> getAllSuppliers(string searchKey){
        List<Account> supplierList = new List<Account>();
        string query = '';
        try{
            query = 'SELECT Id,Name FROM Account';
            if(string.isBlank(searchKey)){
                query = query+' Order By CreatedDate DESC limit 10';
            }else{
                string sKey = '%'+searchKey+'%';
                query = query+' WHERE Name LIKE:sKey Order By CreatedDate DESC LIMIT 50000';
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return safe.doQuery(query);
    }


     /**
     * It is used to create assessment record with suppliers
     * @param assessmentRecord record data given by user for assessment creation.
     * @param suppliers strigified list of suppliers selected.
     * @param deleteList strigified list of suppliers removed.
    */

    @AuraEnabled
    public static ResultWrapper sendAssessment(sObject assessmentRecord, string suppliers,string deleteList){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            if (sp == null) sp = Database.setSavepoint();
            insert assessmentRecord;
            Id assessmentId = assessmentRecord.Id;
            if(string.isNotBlank(deleteList)){
                List<string> deleteSupList = (List<string>) JSON.deserialize(deleteList, List<string>.class);
                List<AccountAssessmentRelation__c> deleteAccAssRelns = new List<AccountAssessmentRelation__c>();
                for(string assRelnId:deleteSupList){
                    AccountAssessmentRelation__c assRn = new AccountAssessmentRelation__c();
                    assRn.Id = assRelnId;
                    deleteAccAssRelns.add(assRn);
                }
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteAccAssRelns);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            List<AccountAssessmentRelation__c> accountAssessRelnsList = new List<AccountAssessmentRelation__c>();
            List<Assessment_Supplier__c> assessSupList = new List<Assessment_Supplier__c>();
            List<string> suppliersList = (List<string>) JSON.deserialize(suppliers, List<string>.class);
            set<string> suppliersIds = new set<string>();
            for(string sId:suppliersList){
                suppliersIds.add(sId);
            }
            for(Account acc:[SELECT Id,Name FROM Account WHERE ID IN:suppliersIds]){
                Assessment_Supplier__c assessSup = new Assessment_Supplier__c();
                assessSup.Account__c = acc.Id;
                assessSup.Assessment__c = assessmentId;
                assessSup.Status__c = 'Inactive';
                assessSupList.add(assessSup);

                AccountAssessmentRelation__c accAssessReln = new AccountAssessmentRelation__c();
                accAssessReln.Name = acc.Name;
                accAssessReln.Account__c = acc.Id;
                accAssessReln.Assessment__c = assessmentId;
                accountAssessRelnsList.add(accAssessReln);
            }
            set<Id> successRecordsIdSet = new set<Id>();
            if(accountAssessRelnsList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(accountAssessRelnsList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
                for(Database.SaveResult result : results) {
                    if(result.isSuccess()){
                        successRecordsIdSet.add(result.getId());
                    } else {
                        for(Database.Error error : result.getErrors()) {

                        }
                    }
                }
            }
            if(assessSupList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(assessSupList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            if(successRecordsIdSet.isEmpty() == false){
                sendEmails(successRecordsIdSet);
            }
            resWrap.isSuccess = true;
            resWrap.recordId = assessmentId;
            resWrap.message = '';
            resWrap.errorCode = '';
        }catch(exception e){
            resWrap.isSuccess = false;
            resWrap.recordId = '';
            resWrap.message = e.getMessage();
            resWrap.errorCode = '';
        }
        return resWrap;
    }
    
     /**
     * It is used to send assessment email to the suppliers.
     * @param recordIdsSet AccountAssessmentRelation record ids to send emails.
    */
    public static void sendEmails(Set<Id> recordIdsSet){
        try{
            List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
            for(AccountAssessmentRelation__c assRelRec:[SELECT Id,Account__c,Account__r.Name,Account__r.Email__c,Assessment__c FROM AccountAssessmentRelation__c WHERE ID IN:recordIdsSet]){
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                List<String> sendTo = new List<String>();
                sendTo.add(assRelRec.Account__r.Email__c);
                mail.setToAddresses(sendTo);
                mail.setSubject('Sample Survey');
                String body = '<html><body>'+
                '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                '<br><br>'+'we’d like to complete a short survey.'+
                '<br><br><a href="https://ruby-site-9073-dev-ed.scratch.my.site.com/">Take the survey now.</a>'+
                                 '<br><br>'+'Kind regards,'+
                                 '<br>'+'Rhythm';
                mail.setHtmlBody(body);
                emailMessagesList.add(mail);
            }
            if(emailMessagesList.isEmpty() == false){
                Messaging.sendEmail(emailMessagesList);
            }
        }catch(exception e){

        }
    }

    /**
     * It is used to create assessment supplier records for upcoming assessment schedules
     * @param assesmentId assessment record id
     * @param suppliers strigified list of suppliers selected.
    */
    @AuraEnabled
    public static ResultWrapper addSuppliers(string assesmentId, string suppliers){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            List<Assessment_Supplier__c> assessSupList = new List<Assessment_Supplier__c>();
            List<string> suppliersList = (List<string>) JSON.deserialize(suppliers, List<string>.class);
            for(string supplierId:suppliersList){
                Assessment_Supplier__c assessSup = new Assessment_Supplier__c();
                assessSup.Account__c = supplierId;
                assessSup.Assessment__c = assesmentId;
                assessSup.Status__c = 'Inactive';
                assessSupList.add(assessSup);
            }
            if(assessSupList.isEmpty() ==false){
                Database.SaveResult[] results = safe.doInsert(assessSupList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            resWrap.isSuccess = true;
            resWrap.recordId = '';
            resWrap.message = '';
            resWrap.errorCode = '';
        }catch(exception e){
            resWrap.isSuccess = false;
            resWrap.recordId = '';
            resWrap.message = e.getMessage();
            resWrap.errorCode = '';
        }
        return resWrap;
    }


    /**
     * It is used to update assessment supplier records to send assessment email for scheduled assessments.
     * @param assesmentId assessment record id
    */

    @AuraEnabled
    public static ResultWrapper updateAssessmentSuppliers(string assessmentId){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            List<Assessment_Supplier__c> assessSuppList = new List<Assessment_Supplier__c>();
            for(Assessment_Supplier__c assesSup:[SELECT Id FROM Assessment_Supplier__c WHERE Assessment__c=:assessmentId AND Status__c='Inactive']){
                assesSup.Status__c = 'Active';
                assessSuppList.add(assesSup);
            }
            if (sp == null) sp = Database.setSavepoint();
            if(assessSuppList.isEmpty() == false){
                Database.SaveResult[] saveResult = safe.doUpdate(assessSuppList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            resWrap.isSuccess = true;
            resWrap.recordId = '';
            resWrap.message = '';
            resWrap.errorCode = '';
        }catch(exception e){
            resWrap.isSuccess = false;
            resWrap.recordId = '';
            resWrap.message = e.getMessage();
            resWrap.errorCode = '';
        }
        return resWrap;
    }

    /**
     * It is used to get assessment record
     * @param assesmentId assessment record id
    */

    @AuraEnabled(cacheable=true)
    public static List<Assessment__c> getAssessmentRecord(string assessmentId){
        string query = 'SELECT Id,Start_Date__c FROM Assessment__c WHERE Id=:assessmentId LIMIT 1';
        return safe.doQuery(query);
    }

    @AuraEnabled(cacheable=true)
    public static List<Assessment__c> getAssessmentRecordData(string accountId){
        return [SELECT Id,Start_Date__c,Name FROM Assessment__c WHERE Account__c=:accountId ];
    }


     /**
     * It is used to search the existing suppliers for assessment.
     * @param assesmentId assessment record id
     * @param searchKey user input to search supplier
    */
    @AuraEnabled(cacheable=true)
    public static List<AccountAssessmentRelation__c> getExistingSuppliersWithSearch(string assessmentId, string searchKey){
        string query = 'SELECT Id,Account__c,Account__r.Name FROM AccountAssessmentRelation__c WHERE Assessment__c=:assessmentId';
        if(string.isNotBlank(searchKey)){
            string sKey = '%'+searchKey+'%';
            query = query+' AND Account__r.Name LIKE:sKey';
        }else{
            query = query+' LIMIT 10';
        }
        return safe.doQuery(query);
    }
    
    /**
     * It is used to store the response from server
    */

    public class ResultWrapper{
        @AuraEnabled public boolean isSuccess;
        @AuraEnabled public string message;
        @AuraEnabled public string errorCode;
        @AuraEnabled public Id recordId;
    }

    /**
     * It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
        
    }
    
}