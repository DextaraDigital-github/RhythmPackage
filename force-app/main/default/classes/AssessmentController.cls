/** 
* Class Name        : AssessmentController
* Developer         : Sai Koushik Nimmaturi, Reethika Velpula, Sri Kushal Reddy N          
* Created Date      : 
* @description       : AssessmentController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Assessment__c,Response__c.
* Last Modified Date: 
*/
public with sharing class AssessmentController {
    
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work

    static AssessmentService accAssService = AssessmentService.getInstance();
    
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
                                                                    Assessment__r.Disclosure__c,Status__c,Account__r.Name
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
    @AuraEnabled	
    public static String getSalesforceDomainURL(){
        String url= System.Url.getOrgDomainUrl()+'/';
        return url;
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
                                            OptionValueSet__c,Question_Sequence_Number__c,Question__c,Requires_File_Upload__c,
                                            Parent_Question__c,HelpText__c,Section__r.Section_Sequence_Number__c,
                                            Section__r.Name,Section__r.Id,Assessment_Template__c
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
            List<Response__c> responseList = [SELECT Id,Question__c,Assessment__c,Question__r.Question_Type__c,
                                                Assessment__r.Name,Files__c,Response__c,Reject__c,
                                                CreatedDate,Flag__c,Conversation_History__c,LastModifiedDate,LastModifiedById
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
        Map<String,object> queryMap = (Map<String,Object>)JSON.deserializeUntyped(paramMap);
        String accAssmtId =(string)queryMap.get('accountassessmentid');
        accAssmtId = String.escapeSingleQuotes(accAssmtId);
        SObjectType responseType = Schema.getGlobalDescribe().get('Rhythm__Response__c');
		Map<String,Schema.SObjectField> fieldMap = responseType.getDescribe().fields.getMap();
        Schema.SObjectField idVal = fieldMap.get('Id');
        safe.doUpsert(suppResponseList,idVal);
        List<AccountAssessmentRelation__c> assessment = [SELECT Id,Name,Follow_Up_Requests__c,Status__c,
                                                        Assessment__c,Account__c,PdfConvertor__c
                                                        FROM AccountAssessmentRelation__c
                                                        WHERE Id=:accAssmtId
                                                        WITH SECURITY_ENFORCED];
        if(!assessment.isEmpty()){
            assessment[0].Status__c =(String)queryMap.get('status');
            
            assessment[0].PdfConvertor__c =(String)queryMap.get('pdfContnet');
                assessment[0].Response_Percentage__c = (Decimal)queryMap.get('percentage');
            if((String)queryMap.get('status')=='Submitted'){
                assessment[0].Submission_Date__c = DateTime.now();
                
            }
            safe.doUpdate(assessment);
        }   
        return suppResponseList;
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
                                            Object_Name__c,object_Record_Id__c,ActivityUserId__c,Activity_User__c,CreatedDate
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
    public static List<Object> getAssesmentRecords(){
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
    public static List<Object> getAccountAssesmentRecords(String accountId, String assessmentId){
        try{
            accountId = String.escapeSingleQuotes(accountId);
            assessmentId =  String.escapeSingleQuotes(assessmentId);
            List<AccountAssessmentRelation__c> accountAssessment = [SELECT Id,IsDeleted,Name,Account__c,Assessment__c,Assessment__r.name,
                                                Assessment__r.Status__c,Assessment__r.Customer_Review__c,CreatedDate,
                                                Assessment__r.Number_of_Questions__c,Status__c,Start_Date__c,End_Date__c,
                                                Assessment__r.Additional_Requests__c,Number_of_Questions__c,Assessment__r.CreatedDate,
                                                Assessment__r.Template__c,Number_of_Responses__c,Assessment__r.CreatedBy.Name,Assessment__r.CreatedUser__c
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
    public static List<Response__c> getResponseList(String responseWrapper){
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
    public static String getUserName(){
        String userName=UserInfo.getName();
        return userName;
    }
    /** 
    * @description get pdf content method is used to get the data from AccountAssessment
	* @return AccountAssessmentrecord
	*/
    @AuraEnabled
    public static List<SObject> getPdfContent(String accountassessmentId){
        List<SObject> accasslst =[SELECT Id,PdfConvertor__c,Assessment__r.Name 
                                  FROM AccountAssessmentRelation__c 
                                  WHERE Id=:accountassessmentId
                                  WITH SECURITY_ENFORCED];
        return accasslst;
    }

    /**
    * @description Gets the AccountId information of a user who logged in to portal.
    * @return
    */ 
    @AuraEnabled
    public static String getAccountId()
    {
        /*try{
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
        }*/
        return null;
    }

    /**
    * @description To update the rejected flag.
    * @param updateRejectFlagList This is the list of records.  
    * @return 
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void updateRejectFlag(List<SObject> updateRejectFlagList){
        try{
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(updateRejectFlagList.isEmpty() == false){
                Database.SaveResult[] saveResult = safe.doUpdate(updateRejectFlagList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }    
    }

    /**
    * @description To create the rejected flag.
    * @param insertRejectFlagList This is the list of records. 
    * @return 
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void insertRejectFlag(List<SObject> insertRejectFlagList){
        try{
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(insertRejectFlagList.isEmpty() == false){
                Database.SaveResult[] saveResult = safe.doInsert(insertRejectFlagList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
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
    public static string getCommunityURL(){
        try{
            String relativeUrlBase = '';
            if(!Test.isRunningTest()){
                Id currentNetworkId = Network.getNetworkId();
                Network currNetwork = [SELECT Id, Name, UrlPathPrefix FROM Network WHERE Id = :currentNetworkId];
                relativeUrlBase = URL.getSalesforceBaseUrl().toExternalForm()+'/';
                relativeUrlBase = relativeUrlBase+currNetwork.UrlPathPrefix+'/s/login';
            }
            return relativeUrlBase;
            //String relativeUrlBase = URL.getSalesforceBaseUrl().toExternalForm()+'/s'+'/login';
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
    public static List<SObject> getAssessmentJunctionRecords(String accountId){
        try{
            accountId = String.escapeSingleQuotes(accountId);
            List<AccountAssessmentRelation__c> assessmentData = [SELECT Id,IsDeleted,Name,Account__c,Assessment__c,Assessment__r.name,
                                                                Assessment__r.Status__c,Assessment__r.Customer_Review__c,Assessment__r.Number_of_Questions__c,
                                                                Assessment__r.CreatedBy.Name,Status__c,Response_Percentage__c,End_Date__c,Completed__c,
                                                                Follow_Up_Requests__c,Assessment__r.Template__c
                                                                FROM AccountAssessmentRelation__c
                                                                WHERE Status__c != 'Cancel'
                                                                AND Account__c=:accountId
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
    public static List<Sobject> getAccountAssessmentRecordData(String assrecordId){
        try{
            assrecordId = String.escapeSingleQuotes(assrecordId);
            List<AccountAssessmentRelation__c> accountassessment =  [SELECT Id,IsDeleted,Name,Account__c,Assessment__c,Assessment__r.Name,
                                                                    Assessment__r.Status__c,Assessment__r.Customer_Review__c,CreatedDate,Account__r.Name,
                                                                    Assessment__r.Number_of_Questions__c,Start_Date__c,End_Date__c,Status__c,
                                                                    Assessment__r.Additional_Requests__c,Number_of_Questions__c,Assessment__r.CreatedDate,
                                                                    Assessment__r.Template__c,Number_of_Responses__c,Assessment__r.CreatedBy.Name,
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
    public static List<SObject> getResponseFlag(String questionId, String accountAssessmentId){
        try{
            questionId = String.escapeSingleQuotes(questionId);
            accountAssessmentId = String.escapeSingleQuotes(accountAssessmentId);
            List<Response__c> supplierResponseList =   [SELECT Id,Question__c,Assessment__c,Question__r.Question_Type__c,
                                                        Assessment__r.Name,Files__c,Response__c,CreatedBy.Name,CreatedDate,Flag__c,
                                                        Conversation_History__c,LastModifiedDate,LastModifiedById
                                                        FROM Response__c
                                                        WHERE Question__c=:questionId
                                                        AND AccountAssessmentRelation__c=:accountAssessmentId
                                                        AND Is_Latest_Response__c= true
                                                        WITH SECURITY_ENFORCED];
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(!supplierResponseList.isEmpty())
            {
                for(Response__c response :supplierResponseList)
                {
                    response.Flag__c = !(response.Flag__c);
                }	
                Database.SaveResult[] saveResult = safe.doUpdate(supplierResponseList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
                return supplierResponseList;
            }else{
                Response__c response = new Response__c();
                response.Question__c = questionId;
                response.AccountAssessmentRelation__c = accountAssessmentId;
                response.Flag__c = true;
                response.Is_Latest_Response__c = true;
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
    }
    
    /**
    * @description Its used to delete a file reference in Response__c.
    * @param deleteMap wrapper with question id, assessment id and file details.
    * @return
    */
    @AuraEnabled
     /* sfge-disable-stack ApexFlsViolationRule */
    public static Object deleteFileAttachment(String deleteMap){
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
    public static Map<String,String> saveChatterResponse(String chatWrapperstring){// responseList,string assessmentId,string questionId)
        try{
            Map<String,Object> chatMap = (Map<String,Object>)JSON.deserializeUntyped(chatWrapperstring);
            Map<string,string> responseData=new Map<string,string>();
            String quesId = (String)chatMap.get('questionId');
            String accAssmtId = (String)chatMap.get('accountassessmentId');
            string accType=(String)chatMap.get('accountData');
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
                if(accType !='supplier'){
                responseRecords[0].put('Flag__c',true);
                }
                Database.SaveResult[] saveResult = safe.doUpdate(responseRecords);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                responseData.put('questionId',(String)chatMap.get('questionId'));
                responseData.put('responseId',responseRecords[0].Id);
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
                if(accType !='supplier'){
                response.Flag__c=true;
                }
                List<Response__c> responseList = new List<Response__c>();
                responseList.add(response);
                Database.SaveResult[] results = safe.doInsert(responseList);
                for(Database.SaveResult result : results) {
                    if(result.isSuccess()){
                        responseData.put('questionId',(String)chatMap.get('questionId'));
                        responseData.put('responseId',result.getId());
                        
                    }
                }
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            return responseData;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        
    }
    
     /**
    * @description Its used to capture the error information of any apex/js call.
    * @param errorLogWrapper wrapper with error details to insert the error log rcord.
    * @return 
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static ErrorTransactionLog__c errorLogRecord(String errorLogWrapper){
        try{
            Map<String,Object> errorLogMap = (Map<String,Object>)JSON.deserializeUntyped(errorLogWrapper);
            ErrorTransactionLog__c errorRecord=new ErrorTransactionLog__c();
            errorRecord.Class_Name__c=(String)errorLogMap.get('className');
            errorRecord.LWC_Component_Name__c=(String)errorLogMap.get('componentName');
            errorRecord.Method_Name__c=(String)errorLogMap.get('methodName');
            errorRecord.Error_Stack_Trace__c=(String)errorLogMap.get('errorData');
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
    public static List<SObject> uploadFile(String fileResp){
        try{
            Map<String,Object> filemap = (Map<String,Object>) JSON.deserializeUntyped(fileResp);
            String quesId = (String)filemap.get('quesId');
            String accAssmtId = (String)filemap.get('assessmentId');
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
            String query = 'SELECT Id, ContentDocumentId'
                            +' FROM ContentVersion'
                            +' WHERE Id=\'' + String.escapeSingleQuotes(cvId) + '\''
                            +' WITH SECURITY_ENFORCED';
            safe.doQuery(query);
            String ftype = ((String)filemap.get('name')).substringAfter('.');
            if(String.isNotBlank(quesId) && String.isNotBlank(accAssmtId)){
                List<String> errorList = new List<String>();
                List<ContentVersion> newcvList = [SELECT Id,ContentDocumentId 
                                                FROM ContentVersion 
                                                WHERE Id=:cvId 
                                                WITH SECURITY_ENFORCED];
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
                }else{
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
            if(string.isNotBlank(existingData)){
                if(string.isNotBlank(searchKey)){
                    filter += ' AND (Id NOT IN :existingSups)) OR ((Id IN :existingSups) ';
                }else{
                    filter += ' AND ((Id NOT IN :existingSups) OR ((Id IN :existingSups) ';
                }
                if(string.isNotBlank(exSearchKey)){
                    string sKey = '\'%'+exSearchKey+'%\'';
                	filter += ' AND (Name LIKE '+sKey+') ';
                }
            }
            if(String.isNotBlank(filter)){
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
                                                            AND Assessment__c=:assessmentId
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
            List<ErrorTransactionLog__c> errorList = new List<ErrorTransactionLog__c>();
            Configuration__mdt siteData = Configuration__mdt.getInstance('Site_URL');
            List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
            Map<Integer,String> monthMap = new Map<Integer,String>{
                1=>'Jan',2=>'Feb',3=>'Mar',4=>'Apr',5=>'May',6=>'Jun',
                7=>'Jul',8=>'Aug',9=>'Sep',10=>'Oct',11=>'Nov',12=>'Dec'
            };
            List<AccountAssessmentRelation__c> assRlnsList= [SELECT Id,Account__c,Account__r.Name,
                                                            Account__r.Email__c,Assessment__r.End_Date__c,Assessment__c,Assessment__r.Name
                                                            FROM AccountAssessmentRelation__c
                                                            WHERE ID IN:recordIdsSet
                                                            WITH SECURITY_ENFORCED];
            Set<Id> acctIds = new Set<Id>();
            Map<Id,List<User>> accUserMap = new Map<Id,List<User>>();
            set<Id> conIds = new set<Id>();
            for(AccountAssessmentRelation__c ar:assRlnsList ){
                if(string.isNotBlank(ar.Account__c)){
                    acctIds.add(ar.Account__c);
                }
            }
            
            if(acctIds.isEmpty() == false){
                for(Contact con:[SELECT Id,AccountId,Email FROM Contact WHERE AccountId IN:acctIds AND Primary_Contact__c=true WITH SECURITY_ENFORCED]){
                    conIds.add(con.Id);
                }
            }
            if(conIds.isEmpty() == false){
                for(User us:[SELECT Id,Name,Contact.AccountId,Email FROM User WHERE ContactId IN:conIds WITH SECURITY_ENFORCED]){
                    if(accUserMap.containsKey(us.Contact.AccountId)){
                        List<User> tempList = accUserMap.get(us.Contact.AccountId);
                        tempList.add(us);
                        accUserMap.put(us.Contact.AccountId,tempList);
                    }else{
                        List<User> tempList = new List<User>{us};
                        accUserMap.put(us.Contact.AccountId,tempList);
                    }
                }
            }
            if(assRlnsList.isEmpty() == false && accUserMap.isEmpty() == false && siteData != null){
                if(string.isBlank(source)){
                    for(AccountAssessmentRelation__c assRelRec:assRlnsList){
                        if(accUserMap.containsKey(assRelRec.Account__c)){
                            for(User uRec:accUserMap.get(assRelRec.Account__c)){
                                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                                String subject = 'New Assessment assigned - '+assRelRec.Assessment__r.Name;
                                String body = '<html><body>'+
                                    '<br><br>'+'Dear '+uRec.Name+','+
                                    '<br><br>'+'A new Assessment has been assigned to you, please take out some time and complete it before the due date.'+
                                    '<br><br>To access the Assessment click on this <a href='+siteData.Site_URL__c+assRelRec.Id+'>Link</a> and log in with your username and password.'+
                                    '<br><br>'+'Thanks,'+
                                    '<br>'+UserInfo.getName();
                                mail.setSubject(subject);
                                mail.setTreatTargetObjectAsRecipient(true);
                                mail.setTargetObjectId(uRec.Id);
                                mail.setHtmlBody(body);
                                mail.setSaveAsActivity(false);
                                emailMessagesList.add(mail);
                            }
                        }
                    }
                }else if(source.equalsIgnoreCase('FUR')){
                    for(AccountAssessmentRelation__c assRelRec:assRlnsList){
                        if(accUserMap.containsKey(assRelRec.Account__c)){
                            for(User uRec:accUserMap.get(assRelRec.Account__c)){
                                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                                String subject = 'Need Attention - '+assRelRec.Assessment__r.Name;
                                String body = '<html><body>'+
                                    '<br><br>'+'Dear '+uRec.Name+','+
                                    '<br><br>'+'Thank you for submitting the assessment, it has been reviewed and some of the questions need your attention.'+
                                    '<br><br>To access the Assessment click on this <a href='+siteData.Site_URL__c+assRelRec.Id+'>Link</a> and log in with your username and password.'+
                                    '<br><br>'+'Thanks,'+
                                    '<br>'+UserInfo.getName();
                                mail.setSubject(subject);
                                mail.setTreatTargetObjectAsRecipient(true);
                                mail.setTargetObjectId(uRec.Id);
                                mail.setHtmlBody(body);
                                mail.setSaveAsActivity(false);
                                emailMessagesList.add(mail);
                            }
                        }
                    }
                }else if(source.equalsIgnoreCase('ExpiryNotification')){
                    for(AccountAssessmentRelation__c assRelRec:assRlnsList){
                        Date endDate = assRelRec.Assessment__r.End_Date__c;
                        Integer month = endDate.month();
                        String monthStr = monthMap.get(month);
                        Integer day = endDate.day();
                        Integer year =  endDate.year();
                        String endDateStr = monthStr+'-'+String.valueOf(day)+'-'+String.valueOf(year);
                        if(accUserMap.containsKey(assRelRec.Account__c)){
                            for(User uRec:accUserMap.get(assRelRec.Account__c)){
                                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                                String subject = 'Due Date remainder for '+assRelRec.Assessment__r.Name;
                                String body = '<html><body>'+
                                    '<br><br>'+'Dear '+uRec.Name+','+
                                    '<br><br>'+'The deadline for completing your Assessment is '+endDateStr+'. This is a reminder to make sure you’ve finished the Assessment by then.'+
                                    '<br><br>To access the Assessment click on this <a href='+siteData.Site_URL__c+assRelRec.Id+'>Link</a> and log in with your username and password.'+
                                    '<br><br>'+'Thanks,'+
                                    '<br>'+UserInfo.getName();
                                mail.setSubject(subject);
                                mail.setTreatTargetObjectAsRecipient(true);
                                mail.setTargetObjectId(uRec.Id);
                                mail.setHtmlBody(body);
                                mail.setSaveAsActivity(false);
                                emailMessagesList.add(mail);
                            }
                        }
                    }
                }
            }
            if(emailMessagesList.isEmpty() == false){
                List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emailMessagesList);
                for(Messaging.SendEmailResult result :emailResults) {   
                    List<Messaging.SendEmailError> errors = result.getErrors();                                 
                    if(!result.IsSuccess() && errors.size() > 0){
                        Messaging.SendEmailError err = errors[0];
                        ErrorTransactionLog__c errorRec = new ErrorTransactionLog__c();
                        errorRec.Class_Name__c = 'AssessmentController';
                        errorRec.Error_Stack_Trace__c = err.getMessage();
                        errorRec.Name = 'Error Record';
                        errorRec.LWC_Component_Name__c = '';
                        errorRec.Method_Name__c = 'SendEmails';
                        errorList.add(errorRec);
                    }
                }
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
            String query = 'SELECT Id,Account__c,Account__r.Name'
                     +' FROM Assessment_Supplier__c'
                     +' WHERE Assessment__c = \'' + String.escapeSingleQuotes(assessmentId) + '\'';
            if(String.isNotBlank(searchKey)){
                string sKey = '\'%'+String.escapeSingleQuotes(searchKey)+'%\'';
                query = query+' AND Account__r.Name LIKE '+sKey;
                query = query+' WITH SECURITY_ENFORCED';
            }else{
                query = query+' WITH SECURITY_ENFORCED LIMIT 500';
            }
            return safe.doQuery(query);
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
    * @description It is used to delete the response.
    * @param deletedata reponse object data.
    * @return
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<Response__c> deleteResponse(Map<string,object> deletedata){
        List<Object> lst = (List<Object>)deletedata.get('responsequestionId');
        List<string> questionId= new List<String>();
        for(Integer i=0;i<lst.size();i++){
            questionId.add(String.valueOf(lst[i]));   
        }
        string accountAssessmentid=(string)deletedata.get('accountassessmentId');
        List<Response__c> deleteResponseList=[SELECT Id 
                                            FROM Response__c 
                                            WHERE Question__c IN : questionId
                                            AND AccountAssessmentRelation__c=:accountAssessmentid
                                            AND Is_Latest_Response__c= true
                                            WITH SECURITY_ENFORCED];
          try{
            if(deleteResponseList.isEmpty() == false){
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteResponseList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            return deleteResponseList;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
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
    * @description Fetches the Assessment_Template__c records based on search string and other parameters
    * @return List of Assessment_Template__c records
    */
    @AuraEnabled
    public static List<sObject> fetchAssessmentTemplates() {
        return accAssService.fetchAssessmentTemplates();
    }
    
    /**
    * @description To download the assessments as the PDF
    * @recordData List of assessments as string to print.
    * @columnsData List of columns as string to print.
    */
    @AuraEnabled
    public static String getPDFData(String recordData, String columnsData){
        try{
            List<ColumnData> pdfColumns = (List<ColumnData>) JSON.deserialize(columnsData, List<ColumnData>.class);
            List<PDFWrapper> pdfData = (List<PDFWrapper>) JSON.deserialize(recordData, List<PDFWrapper>.class);
            string tableHtml = '';
            tableHtml += '<html><body><div><table style="page-break-inside: auto">';
            tableHtml += '<tr><td height="5px" bgcolor="rgb(107, 56, 136)"></td><td height="5px" bgcolor="rgb(239, 104, 55)"></td></tr>';
            tableHtml += '<tr><td bgcolor="white" colspan="2"><span><font color="#535353" size=3><b>&nbsp;&nbsp;RHYTHM</b></font></span><br/><span><font color="#535353" size=1><b>&nbsp;&nbsp;&nbsp;INNOVATIONS</b></font></span></td></tr>';
            tableHtml += '<tr><td colspan="2" height="5px"></td></tr>';
            tableHtml += '<tr><td colspan="2" bgcolor="#f5f7fa"><table cellpadding="5"><tr>';
            for (integer i = 0; i < pdfColumns.size(); i++) {
                tableHtml += '<th bgcolor="#d6dbde"><font color="rgb(60 60 60)" size=1 face="sans-serif"><b>' + pdfColumns[i].label + '</b></font></th>';
            }
            tableHtml += '<th bgcolor="#d6dbde"><font color="rgb(60 60 60)" size=0.5><b>% Completed</b></p></th>';
            tableHtml += '</tr></table></td></tr>';
            for (integer i = 0; i < pdfData.size(); i++) {
                tableHtml += '<tr><td colspan="2"><table cellpadding="5"><tr>';
                for (integer j = 0; j < pdfData[i].record.size(); j++) {
                    string dataValue = '';
                    if(pdfData[i].record[j].value != null){
                        dataValue = pdfData[i].record[j].value;
                    }
                    if(Math.mod(i,2) == 0) {
                    	tableHtml += '<td bgcolor="white">' + dataValue + '</td>';
                    }
                    else {
                    	tableHtml += '<td bgcolor="rgb(246 246 246)">' + dataValue + '</td>';
                    }
                }
                string dataValue = '';
                if(pdfData[i].progressBarValue != null){
                    dataValue = pdfData[i].progressBarValue;
                }
                if(Math.mod(i,2) == 0) {
                	tableHtml += '<td bgcolor="white">' + dataValue + '</td>';
                }
                else {
                    tableHtml += '<td bgcolor="rgb(246 246 246)">' + dataValue + '</td>';
                }
                tableHtml += '</tr></table></td></tr>';
            }
            tableHtml += '</table></div></body></html>';
            Blob pdfContent = Blob.toPdf(tableHtml);
            return EncodingUtil.base64Encode(pdfContent);
        }catch(Exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
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
    * @description It is used to store the PDFData from server
    */
    public class PDFWrapper{
        @AuraEnabled public string templateId;
        @AuraEnabled public string id;
        @AuraEnabled public string progressBarValue;
        @AuraEnabled public List<RecordData> record;
    }

    /**
    * @description It is used to store the RecordData from server
    */
    public class RecordData{
        @AuraEnabled public string fieldName;
        @AuraEnabled public string label;
        @AuraEnabled public string value;
        @AuraEnabled public string classList;
        @AuraEnabled public string surveySymbol;
    }
    
    /**
    * @description It is used to store the ColumnData from server
    */
    public class ColumnData{
        @AuraEnabled public string label;
        @AuraEnabled public string fieldName;
        @AuraEnabled public string type;
    }
    
    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
}