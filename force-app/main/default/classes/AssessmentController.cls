/** 
* Class Name        : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description       : AssessmentController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Assessment__c,Response__c.
* Last Modified Date: 
*/
public with sharing class AssessmentController {
    
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work
    
    /**
    * @description Gets the assessment information.
    * @param assessmentId This is a record id of an Assessment__c. 
    * @return 
    */
    @AuraEnabled
    public static List<SObject> getSupplierAssessmentList(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<AccountAssessmentRelation__c> acctAssessmntList =  [SELECT Id,Assessment__r.Name,Assessment__r.Template__c,
                                                                    Assessment__r.Disclosure__c,Status__c
                                                                    FROM AccountAssessmentRelation__c
                                                                    WHERE Id=:assessmentId
                                                                    WITH SECURITY_ENFORCED
                                                                    LIMIT 1];
            return acctAssessmntList;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description Gets the Question__c,Section__c information of a particular Assessment_Template__c.
    * @param templateId This is a record id of an Assessment_Template__c.
    * @return  
    */
    @AuraEnabled
    public static List<SObject> getQuestionsList(String templateId){
        try{
            templateId = String.escapeSingleQuotes(templateId);
            List<Question__c> questionList = [SELECT Id,Name,Section__c,Question_Type__c,
                                            Required__c,Default_Value__c,Conditional_Response__c,
                                            OptionValueSet__c,Question__c,Requires_File_Upload__c,
                                            Parent_Question__c,HelpText__c,Section__r.Name,Section__r.Id,Assessment_Template__c
                                            FROM Question__c
                                            WHERE Assessment_Template__c =:templateId
                                            WITH SECURITY_ENFORCED
                                            ORDER BY  Section__r.Section_Sequence_Number__c,Question_Sequence_Number__c];
            
            return questionList;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    
    
    /**
    * @description Gets the Response__c information of an AccountAssessmentRelation__c.
    * @param assessmentId This is a record id of an AccountAssessmentRelation__c. 
    * @return 
    */
    @AuraEnabled
    public static List<SObject> getSupplierResponseList(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<Response__c> responseList = [SELECT Id, Question__c,Assessment__c,Question__r.Question_Type__c,
                                                Assessment__r.Name,Files__c, Response__c,
                                                CreatedDate, Flag__c, Conversation_History__c,LastModifiedDate,LastModifiedById
                                                FROM Response__c
                                                WHERE AccountAssessmentRelation__c= :assessmentId
                                                AND Is_Latest_Response__c= true
                                                WITH SECURITY_ENFORCED];
            return responseList;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }

    /**
    * @description Insert or update the Response__c of a supplier(Account) for an Assessment__c.
    * @param suppResponseList Response__c wrapper.
    * @param paramMap
    * @return 
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> createSupplierResponse(List<SObject> suppResponseList,String paramMap){
        try{
            Map<String,object> queryMap = (Map<String,Object>)JSON.deserializeUntyped(paramMap);
            String accAssmtId =(string)queryMap.get('accountassessmentid');
            accAssmtId = String.escapeSingleQuotes(accAssmtId);
            List<Id> questionIds = new List<Id>();
            Map<Id,SObject> suppResponseMap = new Map<Id,SObject>();
            for(SObject response:suppResponseList){
                questionIds.add((Id)response.get('Rhythm__Question__c'));
                suppResponseMap.put((Id)response.get('Rhythm__Question__c'),response);
            }
            List<Response__c> existingResponses = new List<Response__c>();
            if(!questionIds.isEmpty()){
                existingResponses = [SELECT Id,Name,Question__c,Response__c,Files__c,Assessment__c,
                                        Flag__c,Is_Latest_Response__c,AccountAssessmentRelation__c
                                        FROM Response__c
                                        WHERE Question__c IN:questionIds
                                        AND AccountAssessmentRelation__c=:accAssmtId
                                        AND Is_Latest_Response__c = true
                                        WITH SECURITY_ENFORCED];
            }
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if (Schema.sObjectType.Response__c.isUpdateable()) {
                for(Response__c resp :existingResponses){
                    ((Response__c)suppResponseMap.get(resp.Question__c)).put('Files__c', resp.Files__c);
                    if (Schema.sObjectType.Response__c.fields.Is_Latest_Response__c.isUpdateable()) {
                        resp.Is_Latest_Response__c = false;
                    }
                }
                if(suppResponseMap.values().isEmpty() == false && Schema.sObjectType.Response__c.isCreateable()){
                    Database.SaveResult[] results = safe.doInsert(suppResponseMap.values());
                    List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                    if(errorsList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join(errorsList, ', ' ));
                    }
                }
                Database.SaveResult[] saveResult = safe.doUpdate(existingResponses);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
                List<AccountAssessmentRelation__c> assessment = [SELECT Id,Name,Follow_Up_Requests__c,Status__c,
                                                                Assessment__c,Account__c,PdfConvertor__c
                                                                FROM AccountAssessmentRelation__c
                                                                WHERE Id=:accAssmtId
                                                                WITH SECURITY_ENFORCED];
                if(!assessment.isEmpty() && Schema.sObjectType.AccountAssessmentRelation__c.isUpdateable()){
                    if (Schema.sObjectType.AccountAssessmentRelation__c.fields.Status__c.isUpdateable()) {
                        assessment[0].Status__c =(String)queryMap.get('status');
                    }
                    if (Schema.sObjectType.AccountAssessmentRelation__c.fields.PdfConvertor__c.isUpdateable()) {
                        assessment[0].PdfConvertor__c =(String)queryMap.get('pdfContnet');
                    }
                    if((String)queryMap.get('status')=='Submitted' && 
                        Schema.sObjectType.AccountAssessmentRelation__c.fields.Submission_Date__c.isUpdateable()){
                        assessment[0].Submission_Date__c = DateTime.now();
                    }
                    Database.SaveResult[] updResult = safe.doUpdate(assessment);
                    List<String> upderrorList = SecurityCheckController.safeClassExceptionHandlerInsert(updResult);
                    if(upderrorList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( upderrorList, ', ' ));
                    }
                }
            }
            return suppResponseList;
        }catch(exception e){
            string errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description  Update the Assessment Status
    * @param paramMap Map with the values to update
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> updateAccountAssessmentStatus(String paramMap)
    {
        try{
            Map<String,object> queryMap = (Map<String,Object>)JSON.deserializeUntyped(paramMap);
            String accAssmtId =(String)queryMap.get('recId');
            accAssmtId = String.escapeSingleQuotes(accAssmtId);
            List<AccountAssessmentRelation__c> accountAssessment = [SELECT Id,Name,Status__c,Assessment__c,Account__c
                                                                    FROM AccountAssessmentRelation__c
                                                                    WHERE Id=:accAssmtId
                                                                    WITH SECURITY_ENFORCED];
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(accountAssessment.isEmpty() == false){
                for(AccountAssessmentRelation__c assessment : accountAssessment){
                    assessment.Status__c = (String)queryMap.get('assessmentStatus');
                }
                Database.SaveResult[] saveResult = safe.doUpdate(accountAssessment);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            return accountAssessment;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }

    /**
    * @description Gets the Assessment__History information of a Status__c field in Assessment__c.
    * @param assessmentId This is a record id of an Assessment__c.
    * @param objectName Name of an object.
    * @return
    */
    @AuraEnabled
    public static List<SObject> getAssessmentStatus(String assessmentId, String objectName){
        try{
            string fName = 'Rhythm__Status__c';
            fName = String.escapeSingleQuotes(fName);
            assessmentId = String.escapeSingleQuotes(assessmentId);
            objectName = String.escapeSingleQuotes(objectName);
            List<SObject> assessmentstatus = [SELECT Object_Field_Name__c,Object_Field_Value__c,
                                                Object_Name__c,object_Record_Id__c,Activity_User__c,CreatedDate
                                                FROM FieldHistoryTracking__c
                                                WHERE object_Record_Id__c=:assessmentId
                                                AND Object_Name__c=:objectName
                                                AND Object_Field_Name__c=:fName
                                                WITH SECURITY_ENFORCED
                                                ORDER BY CreatedDate DESC];
            return assessmentstatus;
        }catch(exception e){
            string errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
   
     /**
    * @description Gets the all Assessment__c records information of an Assessment__c.
    * @return
    */
    @AuraEnabled
    public static List<Object> getAssesmentRecords()
    {
        try{
            List<Assessment__c> assessmentRecords = [SELECT Name,Target_Completion_Date__c,Status__c,Additional_Requests__c,
                                                    Customer_Review__c,Number_of_Questions__c,Start_Date__c,
                                                    End_Date__c,CreatedDate,CreatedUser__c
                                                    FROM Assessment__c
                                                    WITH SECURITY_ENFORCED
                                                    LIMIT 100];
            return assessmentRecords;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }


    /**
    * @description Get the response record data for the supplier.
    * @param accountId This is the account id.
    * @param assessmentId This is the assessment id.
    * @return
    */
    @AuraEnabled
    public static List<Object> getAccountAssesmentRecords(String accountId, String assessmentId)
    {
        try{
            accountId = String.escapeSingleQuotes(accountId);
            assessmentId =  String.escapeSingleQuotes(assessmentId);
            List<AccountAssessmentRelation__c> accountAssessment = [SELECT Id,IsDeleted,Name,Account__c,Assessment__c,Assessment__r.name,
                                                Assessment__r.Status__c,Assessment__r.Customer_Review__c,CreatedDate,
                                                Assessment__r.Number_of_Questions__c,Status__c,Start_Date__c,End_Date__c,
                                                Assessment__r.Additional_Requests__c,Number_of_Questions__c,Assessment__r.CreatedDate,
                                                Assessment__r.Template__c, Number_of_Responses__c,Assessment__r.CreatedBy.Name,Assessment__r.CreatedUser__c
                                                FROM AccountAssessmentRelation__c
                                                WHERE Account__c=:accountId
                                                AND Assessment__c=:assessmentId
                                                WITH SECURITY_ENFORCED
                                                ORDER BY CreatedDate DESC];
            return accountAssessment;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }

    /**
    * @description Gets the Response__c information of all fields in Response__c for a particular Question__c, Assessment__c.
    * @param responseWrapper This is the wrapper with response data.
    * @return
    */
    @AuraEnabled
    public static List<Response__c> getResponseList(String responseWrapper)
    {
        try{
            Map<String,Object> responseMap = (Map<String,Object>)JSON.deserializeUntyped(responseWrapper);
            String quesId = (String)responseMap.get('questionId');
            quesId = String.escapeSingleQuotes(quesId);
            String accAssmtId = (String)responseMap.get('accountassessmentId');
            accAssmtId = String.escapeSingleQuotes(accAssmtId);
            
            List<Response__c> responseRecords = [SELECT Conversation_History__c,createdDate
                                                FROM Response__c
                                                WHERE AccountAssessmentRelation__c=:accAssmtId
                                                AND Question__c=:quesId
                                                AND Is_Latest_Response__c=true
                                                WITH SECURITY_ENFORCED];
            return responseRecords;
        }catch(exception e){
            string errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /** 
    * @description getUserName method is used to get the username
	* @return
	*/
    @AuraEnabled
    public static String getUserName()
    {
        String userName=UserInfo.getName();
        return userName;
    }

    /**
    * @description Gets the AccountId information of a user who logged in to portal.
    * @return
    */ 
    @AuraEnabled
    public static String getAccountId()
    {
        try{
            String userId = userinfo.getuserid();
            userId = String.escapeSingleQuotes(userId);
            List<User> userList =  [SELECT Contact.AccountId
                                    FROM User
                                    WHERE Id=:userId
                                    WITH SECURITY_ENFORCED];
            if(userList.isEmpty() == false){
                return userList[0].Contact.AccountId;
            }else{
                String errorMsg = 'User Not Found';
                throw new AuraHandledException(errorMsg);
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description To get the community url.
    * @return
    */
    @AuraEnabled
    public static string getCommunityURL()
    {
        try{
            String relativeUrlBase = URL.getSalesforceBaseUrl().toExternalForm()+'/login';
            return relativeUrlBase;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    
    /**
    * @description To get the response information of all fields in AccountAssessmentRelation__c for a particular Account__c.
    * @param accountId This is a record id of an Account__c.
    * @return
    */
    @AuraEnabled
    public static List<SObject> getAssessmentJunctionRecords(String accountId)
    {
        try{
            accountId = String.escapeSingleQuotes(accountId);
            List<AccountAssessmentRelation__c> assessmentData = [SELECT Id,IsDeleted,Name,Account__c,Assessment__c,Assessment__r.name,
                                                                Assessment__r.Status__c,Assessment__r.Customer_Review__c,Assessment__r.Number_of_Questions__c,
                                                                Assessment__r.CreatedBy.Name,Status__c,End_Date__c,Completed__c,Follow_Up_Requests__c
                                                                FROM AccountAssessmentRelation__c
                                                                WHERE Account__c=:accountId
                                                                WITH SECURITY_ENFORCED
                                                                ORDER BY CreatedDate DESC];
            return assessmentData;
        }catch(exception e){
            String errorMsg = e.getMessage();
            AuraHandledException auraEx = new AuraHandledException(errorMsg);
            auraEx.setMessage(errorMsg);
            throw auraEx;
        }
    }


    
    /**
    * @description To get the response data
    * @param assrecordId record id of a AccountAssessmentRelation__c.
    * @return
    */
    @AuraEnabled
    public static List<Sobject> getAccountAssessmentRecordData(String assrecordId)
    {
        try{
            assrecordId = String.escapeSingleQuotes(assrecordId);
            List<AccountAssessmentRelation__c> accountassessment =  [SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.Name,
                                                                    Assessment__r.Status__c,Assessment__r.Customer_Review__c,CreatedDate,
                                                                    Assessment__r.Number_of_Questions__c,Start_Date__c,End_Date__c,Status__c,
                                                                    Assessment__r.Additional_Requests__c,Number_of_Questions__c,Assessment__r.CreatedDate,
                                                                    Assessment__r.Template__c, Number_of_Responses__c,Assessment__r.CreatedBy.Name,
                                                                    Assessment__r.CreatedUser__c,CreatedBy.Name
                                                                    FROM AccountAssessmentRelation__c
                                                                    WHERE Id=:assrecordId
                                                                    WITH SECURITY_ENFORCED];
            return accountassessment;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description Its used to update a flag in Response__c.
    * @param questionId record id of a Question__c.
    * @param accountAssessmentId record id of a AccountAssessmentRelation__c.
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> getResponseFlag(String questionId, String accountAssessmentId)
    {
        try{
            questionId = String.escapeSingleQuotes(questionId);
            accountAssessmentId = String.escapeSingleQuotes(accountAssessmentId);
            List<Response__c> supplierResponseList =   [SELECT Id, Question__c,Assessment__c,Question__r.Question_Type__c,
                                                        Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c,
                                                        Conversation_History__c,LastModifiedDate,LastModifiedById
                                                        FROM Response__c
                                                        WHERE Question__c=:questionId
                                                        AND AccountAssessmentRelation__c=:accountAssessmentId
                                                        AND Is_Latest_Response__c= true
                                                        WITH SECURITY_ENFORCED];
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(!supplierResponseList.isEmpty() && Schema.sObjectType.Response__c.isUpdateable())
            {
                for(Response__c response :supplierResponseList)
                {
                    if (Schema.sObjectType.Response__c.fields.Flag__c.isUpdateable()) {
                        response.Flag__c = !(response.Flag__c);
                    }
                }	
                Database.SaveResult[] saveResult = safe.doUpdate(supplierResponseList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
                return supplierResponseList;
            }else if(Schema.sObjectType.Response__c.isUpdateable()){
                Response__c response = new Response__c();
                if (Schema.sObjectType.Response__c.fields.Question__c.isUpdateable()) {
                    response.Question__c = questionId;
                }
                if (Schema.sObjectType.Response__c.fields.AccountAssessmentRelation__c.isUpdateable()) {
                response.AccountAssessmentRelation__c = accountAssessmentId;
                }
                if (Schema.sObjectType.Response__c.fields.Flag__c.isUpdateable()) {
                response.Flag__c = true;
                }
                if (Schema.sObjectType.Response__c.fields.Is_Latest_Response__c.isUpdateable()) {
                response.Is_Latest_Response__c = true;
                }
                List<Response__c> responseList = new List<Response__c>();
                responseList.add(response);
                if(responseList.isEmpty() == false){
                    Database.SaveResult[] results = safe.doInsert(responseList);
                    List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                    if(errorsList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join(errorsList, ', ' ));
                    }
                }
                return (new List<Response__c>());
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        return (new List<Response__c>());
    }
    
    /**
    * @description Its used to delete a file reference in Response__c.
    * @param deleteMap wrapper with question id, assessment id and file details.
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static Object deleteFileAttachment(String deleteMap)
    {
        try{
            Map<String,Object> filemap = (Map<String,Object>) JSON.deserializeUntyped(deleteMap);
            String quesId = (String)filemap.get('questionId');
            quesId = String.escapeSingleQuotes(quesId);
            String accAssmtId = (String)filemap.get('accountAssessmentId');
            accAssmtId = String.escapeSingleQuotes(accAssmtId);
            List<Response__c> responseRecords = [SELECT Id,Question__c,Question__r.Name,Assessment__r.Name,
                                                Files__c,Response__c,CreatedBy.Name,CreatedDate,Flag__c,
                                                Conversation_History__c,LastModifiedDate,LastModifiedById
                                                FROM Response__c
                                                WHERE Question__c=:quesId
                                                AND AccountAssessmentRelation__c=:accAssmtId
                                                AND Is_Latest_Response__c= true
                                                WITH SECURITY_ENFORCED
                                                LIMIT 50000];
            List<Object> responseFilesData= (List<Object>)JSON.deserializeUntyped(responseRecords[0].Files__c);
            if (sp == null){
                sp = Database.setSavepoint();
            }
            for(Integer i=0;i<responseFilesData.size();i++)
            {
                Map<String,Object> mp = (Map<String,Object>)responseFilesData[i];
                String responseurl = (String)mp.get('name');
                if(responseurl==(String)filemap.get('name'))
                {
                    responseFilesData.remove(i);
                }
            }
            responseRecords[0].put('Rhythm__Files__c',JSON.serialize(responseFilesData));
            Database.SaveResult[] saveResult = safe.doUpdate(responseRecords);
            List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
            if(errorList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
            }
            return responseRecords[0].Files__c;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    
    /**
    * @description Its used to save the communication log of a quesiton in Response__c.
    * @param chatWrapperstring wrapper with question id, assessment id and chatter data.
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static Boolean saveChatterResponse(String chatWrapperstring)// responseList,string assessmentId,string questionId)
    {
        try{
            Map<String,Object> chatMap = (Map<String,Object>)JSON.deserializeUntyped(chatWrapperstring);
            String quesId = (String)chatMap.get('questionId');
            quesId = String.escapeSingleQuotes(quesId);
            String accAssmtId = (String)chatMap.get('accountassessmentId');
            accAssmtId = String.escapeSingleQuotes(accAssmtId);
            List<Response__c> responseRecords = [SELECT Conversation_History__c,createdDate
                                                FROM Response__c
                                                WHERE AccountAssessmentRelation__c=:accAssmtId
                                                AND Question__c=:quesId
                                                AND Is_Latest_Response__c=true
                                                WITH SECURITY_ENFORCED];
            if (sp == null){ 
                sp = Database.setSavepoint();
            }
            if(!responseRecords.isEmpty()){
                responseRecords[0].put('Conversation_History__c',JSON.serialize(chatMap.get('responseList')));
                Database.SaveResult[] saveResult = safe.doUpdate(responseRecords);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }else{
                Response__c response = new Response__c();
                response.Question__c = (String)chatMap.get('questionId');
                response.Conversation_History__c = JSON.serialize(chatMap.get('responseList'));
                response.AccountAssessmentRelation__c=(String)chatMap.get('accountassessmentId');
                response.Is_Latest_Response__c = true;
                List<Response__c> responseList = new List<Response__c>();
                responseList.add(response);
                Database.SaveResult[] results = safe.doInsert(responseList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        return true;
    }
    
     /**
    * @description Its used to capture the error information of any apex/js call.
    * @param errorLogWrapper wrapper with error details to insert the error log rcord.
    * @return 
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static ErrorTransactionLog__c errorLogRecord(String errorLogWrapper)
    {
        try{
            Map<String,Object> errorLogMap = (Map<String,Object>)JSON.deserializeUntyped(errorLogWrapper);
            ErrorTransactionLog__c errorRecord=new ErrorTransactionLog__c();
            if (Schema.sObjectType.ErrorTransactionLog__c.fields.Class_Name__c.isCreateable()) {
                errorRecord.Class_Name__c=(String)errorLogMap.get('className');
            }
            if (Schema.sObjectType.ErrorTransactionLog__c.fields.LWC_Component_Name__c.isCreateable()) {
                errorRecord.LWC_Component_Name__c=(String)errorLogMap.get('componentName');
            }
            if (Schema.sObjectType.ErrorTransactionLog__c.fields.Method_Name__c.isCreateable()) {
                errorRecord.Method_Name__c=(String)errorLogMap.get('methodName');
            }
            if (Schema.sObjectType.ErrorTransactionLog__c.fields.Error_Stack_Trace__c.isCreateable()) {
                errorRecord.Error_Stack_Trace__c=(String)errorLogMap.get('errorData');
            }
            List<ErrorTransactionLog__c> errLogList = new List<ErrorTransactionLog__c>();
            errLogList.add(errorRecord);
            if (sp == null){ 
                sp = Database.setSavepoint();
            }
            if(errLogList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(errLogList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            return errorRecord;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        
    }
    

 
    /**
    * @description Its used to save the file and save the reference link in Response__c in JSON format.
    * @param fileResp wrapper with questionid, assessmentid and file data to upload.
    * @return
    */
    @AuraEnabled 
    /* sfge-disable-stack ApexFlsViolationRule */   
    public static List<SObject> uploadFile(String fileResp)
    {
        try{
            Map<String,Object> filemap = (Map<String,Object>) JSON.deserializeUntyped(fileResp);
            String quesId = (String)filemap.get('quesId');
            quesId = String.escapeSingleQuotes(quesId);
            String accAssmtId = (String)filemap.get('assessmentId');
            accAssmtId = String.escapeSingleQuotes(accAssmtId);
            String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
            String fileblob = (String)filemap.get('fileBlob');
            Blob file=EncodingUtil.base64Decode(fileblob.split(',')[1]);
            ContentVersion cv=new ContentVersion();
            cv.VersionData=file;
            cv.PathOnClient=(String)filemap.get('name');
            List<ContentVersion> cvList = new List<ContentVersion>();
            cvList.add(cv);
            if (sp == null){
                sp = Database.setSavepoint();
            }
            string cvId = ''; 
            if(cvList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(cvList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
                cvId = cvList[0].Id;
            }
            List<Response__c> srList = new List<Response__c>();
            cvId = String.escapeSingleQuotes(cvId);
            String ftype = ((String)filemap.get('name')).substringAfter('.');
            if(String.isNotBlank(quesId) && String.isNotBlank(accAssmtId)){
                List<String> errorList = new List<String>();
                
                List<ContentVersion> newcvList = [SELECT Id,ContentDocumentId FROM ContentVersion WHERE Id=:cvId WITH SECURITY_ENFORCED];
                ContentDocumentLink cDocLink = new ContentDocumentLink();
                cDocLink.ContentDocumentId = newcvList[0].ContentDocumentId;//Add ContentDocumentId
                cDocLink.LinkedEntityId = accAssmtId;//Add attachment parentId
                cDocLink.ShareType = 'V';//V - Viewer permission. C - Collaborator permission. I - Inferred permission.
                cDocLink.Visibility = 'AllUsers';//AllUsers, InternalUsers, SharedUsers
                List<ContentDocumentLink> cdlList = new List<ContentDocumentLink>{cDocLink};
                Database.SaveResult[] cdlSResult = safe.doInsert(cdlList);
                errorList = SecurityCheckController.safeClassExceptionHandlerInsert(cdlSResult);
                
                srList = [SELECT Id,Files__c,Question__c
                            FROM Response__c
                            WHERE Question__c =:quesId
                            AND AccountAssessmentRelation__c =:accAssmtId
                            AND Is_Latest_Response__c = true
                            WITH SECURITY_ENFORCED];
                if(srList.isEmpty() == false){
                    String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+newcvList[0].ContentDocumentId+'?operationContext=S1';
                    String fileJson = '{"name":"'+(String)filemap.get('name')+'","url":"'+fileUrl+'","type":"'+ftype+'"}';
                    srList[0].Files__c = (srList[0].Files__c == null || srList[0].Files__c.trim().length() == 0 || srList[0].Files__c=='[]') ? '['+fileJson+']' : '['+fileJson+','+srList[0].Files__c.substring(1,srList[0].Files__c.length());
                    Database.SaveResult[] saveResult = safe.doUpdate(srList);
                    errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                }
                else{
                    Response__c res=new Response__c();
                    res.Question__c= quesId;
                    res.AccountAssessmentRelation__c= accAssmtId;
                    String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+newcvList[0].ContentDocumentId+'?operationContext=S1';
                    String fileJson = '[{"name":"'+(String)filemap.get('name')+'","url":"'+fileUrl+'","type":"'+ftype+'"}]';
                    res.Files__c = fileJson;
                    res.Is_Latest_Response__c = true;
                    srList.add(res);
                    Database.SaveResult[] saveResult = safe.doInsert(srList);
                    errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                }
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            return srList;
        }
        catch(Exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description Its used to get the suppliers.
    * @param existingData user input to search new suppliers.
    * @param searchKey user input to search new suppliers.
    * @param exSearchKey user input to search existing suppliers.
    * @return
    */
    @AuraEnabled(cacheable=true)
    public static List<Account> getAllSuppliers(String existingData, String searchKey, String exSearchKey){
        Set<String> selSet = new Set<String>();
        Set<Id> existingSups = new Set<Id>();
        String recordTypeId = String.valueOf(Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId());
        selSet.add(existingData);
        String query = '';
        exSearchKey = String.escapeSingleQuotes(exSearchKey);
        searchKey = String.escapeSingleQuotes(searchKey);
        try{
            if(String.isNotBlank(existingData)){
                existingSups = (Set<Id>) JSON.deserialize(existingData, Set<Id>.class);
            }
            query = 'SELECT Id,Name FROM Account WHERE RecordTypeId = \''+recordTypeId+'\'';
            String filter = '';
            if(string.isNotBlank(searchKey)){
                String sKey ='\'%'+searchKey+'%\'';
                filter += ' AND (((Name LIKE '+sKey+') ';
            }
            if(string.isNotBlank(existingData))
            {
                if(string.isNotBlank(searchKey))
                {
                    filter += ' AND (Id NOT IN :existingSups)) OR ((Id IN :existingSups) ';
                }
                else
                {
                    filter += ' AND ((Id NOT IN :existingSups) OR ((Id IN :existingSups) ';
                }
                if(string.isNotBlank(exSearchKey))
                {
                    string sKey = '\'%'+exSearchKey+'%\'';
                	filter += ' AND (Name LIKE '+sKey+') ';
                }
            }
            if(String.isNotBlank(filter))
            {
                filter+=' ))';
            }
            query = query+filter+' ORDER BY CreatedDate DESC';
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        Map<String, Object> bindVariables = new Map<String, Object>{'existingSups' => existingSups};
        return safe.doQueryWithBinds(query,bindVariables);
    }
    
   /**
    * @description It is used to create assessment record with suppliers
    * @param assessmentRecord record data given by user for assessment creation.
    * @param operationType it is used to check creation or updation of the assessment.
    * @param suppliers strigified list of suppliers selected.
    * @param existingSups strigified list of existingSups.
    * @param deleteList strigified list of suppliers removed.
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static ResultWrapper sendAssessment(SObject assessmentRecord,String operationType, String suppliers,String existingSups, String deleteList){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            String assessmentId = '';
            List<SObject> assmtList = new List<sObject>();
            List<String> errorList =  new List<String>();
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(operationType.equalsIgnoreCase('new') && assessmentRecord != null){
                assmtList.add(assessmentRecord);
                Database.SaveResult[] saveResult = safe.doInsert(assmtList);
                errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
            }else{
                assessmentId = assessmentRecord.Id;          
            }
            if(errorList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
            }
            else if (assmtList.isEmpty() == false && assmtList[0].Id != null){
                assessmentId = assmtList[0].Id;
                     
            }
         
            Date asmtStartDate = (Date)assessmentRecord.get('Start_Date__c');
            Date asmtEndDate = (Date)assessmentRecord.get('End_Date__c') != null?(Date)assessmentRecord.get('End_Date__c'):null;
            Set<String> suppliersList = new Set<String>();
            Set<String> deleteSupList = new Set<String>();
            Set<String> existingSupList = new Set<String>();
            Set<String> suppliersIds = new Set<String>();
            if(String.isNotBlank(suppliers)){
                suppliersList = (set<string>) JSON.deserialize(suppliers, set<string>.class);
            }
            if(String.isNotBlank(existingSups)){
                existingSupList = (set<string>) JSON.deserialize(existingSups, set<string>.class);
            }
            for(String newSupId:suppliersList){
                suppliersIds.add(newSupId);
            }
            if(String.isNotBlank(deleteList)){
                deleteSupList = (set<string>) JSON.deserialize(deleteList, set<string>.class);
                List<Assessment_Supplier__c> assSuppList=  [SELECT Id
                                                            FROM Assessment_Supplier__c
                                                            WHERE Account__c IN:deleteSupList
                                                            WITH SECURITY_ENFORCED];
                if(assSuppList.isEmpty() == false){
                    List<Database.DeleteResult> deleteResult = safe.doDelete(assSuppList);
                    errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                }
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            List<AccountAssessmentRelation__c> accountAssessRelnsList = new List<AccountAssessmentRelation__c>();
            List<Assessment_Supplier__c> assessSupList = new List<Assessment_Supplier__c>();
            
            Date todayDate = Date.Today();
            List<Account> accList = [SELECT Id,Name
                                    FROM Account
                                    WHERE ID IN:suppliersIds
                                    WITH SECURITY_ENFORCED];
            if(accList.isEmpty() == false){
                for(Account acc:accList){
                    Assessment_Supplier__c assessSup = new Assessment_Supplier__c();
                    assessSup.Account__c = acc.Id;
                    assessSup.Assessment__c = assessmentId;
                    assessSup.Status__c = 'Active';
                    assessSupList.add(assessSup);
                    boolean isSave = false;
                    if(asmtEndDate != null && todayDate.daysBetween(asmtStartDate) <=0 && todayDate.daysBetween(asmtEndDate) >=0){
                        isSave = true;
                    }else if(todayDate.daysBetween(asmtStartDate) <=0){
                        isSave = true;
                    }
                    if(isSave){
                        AccountAssessmentRelation__c accAssessReln = new AccountAssessmentRelation__c();
                        accAssessReln.Name = acc.Name;
                        accAssessReln.Account__c = acc.Id;
                        accAssessReln.Assessment__c = assessmentId;
                        accAssessReln.Start_Date__c = asmtStartDate;
                        //if(asmtEndDate != null){
                            accAssessReln.End_Date__c = asmtEndDate;
                        //}
                        accAssessReln.Status__c = 'New';
                        accountAssessRelnsList.add(accAssessReln);
                    }
                }
            }
            if(sp == null){ 
                sp = Database.setSavepoint();
            }
            List<String> errorsList = new List<String>();
            if(assessSupList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(assessSupList);
                errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            }
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }

            Set<Id> successRecordsIdSet = new Set<Id>();
            if(accountAssessRelnsList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(accountAssessRelnsList);
                errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                for(Database.SaveResult result : results){
                    if(result.isSuccess()){
                        successRecordsIdSet.add(result.getId());
                    }
                }
            }
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
            if(successRecordsIdSet.isEmpty() == false){
                sendEmails(successRecordsIdSet,'');
            }
            resWrap.isSuccess = true;
            resWrap.recordId = assessmentId;
            resWrap.message = '';
            resWrap.errorCode = '';
        }catch(exception e){
            resWrap.isSuccess = false;
            resWrap.message = e.getMessage();
            resWrap.errorCode = '';
            String errorMsg = e.getMessage();
           
            throw new AuraHandledException(ErrorMsg);
        }
        return resWrap;
    }
    
    /**
    * @description It is used to send assessment email to the suppliers.
    * @param recordIdsSet AccountAssessmentRelation record ids to send emails.
    * @param source To send new assessment email or send flagged email notification.
    */
    public static void sendEmails(Set<Id> recordIdsSet, String source){
        try{
            Configuration__mdt siteData = Configuration__mdt.getInstance('Site_URL');
            List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
            List<AccountAssessmentRelation__c> assRlnsList= [SELECT Id,Account__c,Account__r.Name,
                                                            Account__r.Email__c,Assessment__c
                                                            FROM AccountAssessmentRelation__c
                                                            WHERE ID IN:recordIdsSet
                                                            WITH SECURITY_ENFORCED];
            if(assRlnsList.isEmpty() == false && string.isBlank(source)){
                for(AccountAssessmentRelation__c assRelRec:assRlnsList){
                    if(string.isNotBlank(assRelRec.Account__r.Email__c) && siteData != null){
                        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                        List<String> sendTo = new List<String>();
                        sendTo.add(assRelRec.Account__r.Email__c);
                        mail.setToAddresses(sendTo);
                        mail.setSubject('Sample Survey');
                        String body = '<html><body>'+
                            '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                            '<br><br>'+'we’d like to complete a short survey.'+
                            '<br><br><a href='+siteData.Site_URL__c+assRelRec.Id+'>Take the survey now.</a>'+
                            '<br><br>'+'Kind regards,'+
                            '<br>'+'Rhythm';
                        mail.setHtmlBody(body);
                        emailMessagesList.add(mail);
                    }
                }
            }else if(assRlnsList.isEmpty() == false){
                for(AccountAssessmentRelation__c assRelRec:assRlnsList){
                    if(string.isNotBlank(assRelRec.Account__r.Email__c) && siteData != null){
                        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                        List<String> sendTo = new List<String>();
                        sendTo.add(assRelRec.Account__r.Email__c);
                        mail.setToAddresses(sendTo);
                        mail.setSubject('Updates on the Assessment');
                        String body = '<html><body>'+
                            '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                            '<br><br>'+'There are few comments on the responses submitted.'+
                            '<br><br><a href='+siteData.Site_URL__c+assRelRec.Id+'>Click Here</a>'+
                            '<br><br>'+'Kind regards,'+
                            '<br>'+'Rhythm';
                        mail.setHtmlBody(body);
                        emailMessagesList.add(mail);
                    }
                }
            }
            if(emailMessagesList.isEmpty() == false){
                Messaging.sendEmail(emailMessagesList);
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            AuraHandledException auraEx = new AuraHandledException(errorMsg);
            auraEx.setMessage(errorMsg);
            throw auraEx;
        }
    }
    
    /**
    * @description It is used to update assessment supplier records to send assessment email for scheduled assessments.
    * @param assessmentId assessment record id
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static ResultWrapper updateAssessmentSuppliers(string assessmentId){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            String status = 'Inactive';
            status = String.escapeSingleQuotes(status);
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<Assessment_Supplier__c> assessSuppList= [SELECT Id
                                                        FROM Assessment_Supplier__c
                                                        WHERE Assessment__c=:assessmentId
                                                        AND Status__c=:status
                                                        WITH SECURITY_ENFORCED];
            if (sp == null){
                sp = Database.setSavepoint();
            }
            List<String> errorList = new List<String>();
            if(assessSuppList.isEmpty() == false){
                for(Assessment_Supplier__c assesSup:assessSuppList){
                    assesSup.Status__c = 'Active';
                }
                Database.SaveResult[] saveResult = safe.doUpdate(assessSuppList);
                errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                
            }
            if(errorList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
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
    * @description It is used to get assessment record
    * @param assessmentId assessment record id
    * @return
    */
    @AuraEnabled(cacheable=true)
    public static List<Assessment__c> getAssessmentRecord(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<Assessment__c> assessmentList =  [SELECT Id,Start_Date__c,End_Date__c
                                                    FROM Assessment__c
                                                    WHERE Id=:assessmentId
                                                    WITH SECURITY_ENFORCED
                                                    LIMIT 1];     
            return assessmentList;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
    * @description It is used to search the existing suppliers for assessment.
    * @param assessmentId assessment record id.
    * @param searchKey user input to search existing supplier.
    * @return
    */
    @AuraEnabled
    public static List<AccountAssessmentRelation__c> getExistingSuppliersWithSearch(string assessmentId, string searchKey){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            String query = 'SELECT Id,Account__c,Account__r.Name'
                     +' FROM Assessment_Supplier__c'
                     +' WHERE Assessment__c =:assessmentId';
            if(String.isNotBlank(searchKey)){
                string sKey = '\'%'+String.escapeSingleQuotes(searchKey)+'%\'';
                query = query+' AND Account__r.Name LIKE '+sKey;
            }else{
                query = query+' LIMIT 500';
            }
            Map<String, Object> bindVariables = new Map<String, Object>{'assessmentId' => assessmentId};
            return safe.doQueryWithBinds(query,bindVariables);
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
    * @description It is used to delete the assessment.
    * @param assessmentId assessment record id.
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static ResultWrapper deleteAssessment(string assessmentId){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<Assessment__c> deleteAssmtsList = [SELECT Id
                                                    FROM Assessment__c
                                                    WHERE Id=:assessmentId
                                                    WITH SECURITY_ENFORCED];
            List<String> errorList = new List<String>();
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(deleteAssmtsList.isEmpty() == false){
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteAssmtsList);
                errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
            }
            if(errorList.size()>0){
                resWrap.isSuccess = false;
                resWrap.message = '';
                resWrap.errorCode = '';
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
            }
            resWrap.isSuccess = true;
            resWrap.message = '';
            resWrap.errorCode = '';
        }catch(exception e){
            String errorMsg = e.getMessage();
            resWrap.isSuccess = false;
            resWrap.message = e.getMessage();
            resWrap.errorCode = '';
            throw new AuraHandledException(ErrorMsg);
        }
        return resWrap;
    }
    
    /**
    * @description It is used to get the template data.
    * @param templateId template record id.
    * @return
    */
    @AuraEnabled
    public static List<Assessment_Template__c> getTemplateData(string templateId){
        try{
            templateId = String.escapeSingleQuotes(templateId);
            List<Assessment_Template__c> templateList = new List<Assessment_Template__c>();
            if(string.isNotBlank(templateId)){
                 templateList = [SELECT Id,Status__c,Name
                                FROM Assessment_Template__c
                                WHERE Id=:templateId
                                WITH SECURITY_ENFORCED];
            }
            return templateList;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    /**
    * @description It is used to get the current date.
    * @return
    */
    @AuraEnabled(cacheable=true)
    public static date getTodayDate(){
        try{
            return Date.today();
        }catch(exception e){
            string errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
    * @description It is used to store the response from server
    */
    public class ResultWrapper{
       
    /**
    * @description It is a variable isSuccess
    */
        @AuraEnabled public boolean isSuccess;
    /**
    * @description It is a variable message
    */
        @AuraEnabled public string message;
    /**
    * @description It is a variable errorCode
    */
        @AuraEnabled public string errorCode;
    /**
    * @description It is a variable recordId
    */
        @AuraEnabled public string recordId;
    }
    
    
   
    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
    
}