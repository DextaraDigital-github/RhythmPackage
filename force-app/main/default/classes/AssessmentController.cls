/* 
* Class Name        : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : AssessmentController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Assessment__c,Response__c.
* Last Modified Date: 
*/
public with sharing class AssessmentController {
    
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work
    
    /**
* Gets the assessment information.
* @param assessmentId This is a record id of an Assessment__c.  
*/
    @AuraEnabled(cacheable=true)
    public static List<SObject> getSupplierAssessmentList(String assessmentId){
        return [SELECT Id,Assessment__r.Name,Assessment__r.Template__c,Assessment__r.Disclosure__c,Status__c
                FROM AccountAssessmentRelation__c 
                WHERE Id =:assessmentId
                LIMIT 1];
        
        
    }
    
    
    /**
* Gets the Question__c,Section__c information of a particular Assessment_Template__c.
* @param templateId This is a record id of an Assessment_Template__c.  
*/
    @AuraEnabled(cacheable=true)
    public static List<SObject> getQuestionsList(String templateId){
        return [SELECT Id,Name,Section__c,Question_Type__c,Required__c,Default_Value__c,
                Conditional_Response__c,OptionValueSet__c,Question__c,Requires_File_Upload__c,
                Parent_Question__c,HelpText__c,Section__r.Name,Section__r.Id,
                Assessment_Template__c 
                FROM Question__c 
                WHERE Assessment_Template__c =:templateId order by  Section__r.Section_Sequence_Number__c,Question_Sequence_Number__c
               ];
    }
    
    
    
    /**
* Gets the Response__c information of an AccountAssessmentRelation__c.
* @param assessmentId This is a record id of an AccountAssessmentRelation__c.  
*/
    @AuraEnabled
    public static List<SObject> getSupplierResponseList(String assessmentId){
        return  [SELECT Id, Question__c,Assessment__c,Question__r.Question_Type__c, 
                 Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, 
                 Conversation_History__c,LastModifiedDate,LastModifiedById 
                 FROM Response__c 
                 WHERE AccountAssessmentRelation__c=:assessmentId AND Is_Latest_Response__c= true];
    }
    
    /**
* Insert or update the Response__c of a supplier(Account) for an Assessment__c.
* @param suppResponseList Response__c wrapper.
* @param vendorId supplier Account Id.
* @param assesmentId record id of an Assessment__c.
* @param isSubmit true:save & submit(update the Assessment__c status to submitted), false: only save (update the Assessment__c status to Draft)
*/
    @AuraEnabled
    public static void createSupplierResponse(List<SObject> suppResponseList,String paramMap){
        Map<String,object> queryMap = (Map<String,Object>)JSON.deserializeUntyped(paramMap);
        List<Id> questionIds = new List<Id>();
        Map<Id,SObject> suppResponseMap = new Map<Id,SObject>();
        for(SObject response:suppResponseList){
            questionIds.add((Id)response.get('Rhythm__Question__c'));
            suppResponseMap.put((Id)response.get('Rhythm__Question__c'),response);
        }
        
        List<Response__c> existingResponses = new List<Response__c>();
        if(!questionIds.isEmpty())
        {
            existingResponses = [SELECT Id,Name,Question__c,Response__c,Files__c,Assessment__c,Flag__c,Is_Latest_Response__c,AccountAssessmentRelation__c
                                 FROM Response__c 
                                 WHERE Question__c IN:questionIds AND AccountAssessmentRelation__c=:(String)queryMap.get('accountassessmentid')
                                 AND Is_Latest_Response__c = true];  
        }
        for(Response__c resp :existingResponses)
        {
            ((Response__c)suppResponseMap.get(resp.Question__c)).put('Files__c', resp.Files__c);
            resp.Is_Latest_Response__c = false;
        }
        System.debug('suppResponseList'+suppResponseList);
        System.debug('existingResponses'+existingResponses);
        //suppResponseList.addAll(existingResponses);
        if(!suppResponseMap.values().isEmpty()){
            INSERT suppResponseMap.values();
        } 
        if(!existingResponses.isEmpty())
        {
            UPDATE existingResponses;
        }
        
        
        List<AccountAssessmentRelation__c> assessment=[SELECT Id,Name,Follow_Up_Requests__c,Status__c,Assessment__c,Account__c,PdfConvertor__c
                                                       FROM AccountAssessmentRelation__c 
                                                       WHERE Id=:(String)queryMap.get('accountassessmentid')];
        Set<Id> respSet = new Set<Id>();
        for(AccountAssessmentRelation__c assmtRln:assessment){
            if(assmtRln.Follow_Up_Requests__c != null && assmtRln.Follow_Up_Requests__c > 0){
                respSet.add(assmtRln.Id);
            }
        }
        if(respSet.isEmpty() == false){
            sendEmails(respSet,'FUR');
        }
        if(!assessment.isEmpty()){
            assessment[0].Status__c =(String)queryMap.get('status');
            assessment[0].PdfConvertor__c =(String)queryMap.get('pdfContnet');
            UPDATE assessment;
        }
        
    }
    
    @AuraEnabled
    public static List<Sobject> updateAccountAssessmentStatus(String paramMap)
    {
        Map<String,object> queryMap = (Map<String,Object>)JSON.deserializeUntyped(paramMap);
        List<AccountAssessmentRelation__c> accountAssessment = [SELECT Id,Name,Status__c,Assessment__c,Account__c
                                                                FROM AccountAssessmentRelation__c
                                                                WHERE Id=:(String)queryMap.get('recId')];
        for(AccountAssessmentRelation__c assessment : accountAssessment)
        {
            assessment.Status__c = (String)queryMap.get('assessmentStatus');
        }
        UPDATE accountAssessment;
        return accountAssessment;
    }
    
    
    /**
* Gets the Assessment__History information of a Status__c field in Assessment__c.
* @param assessmentId This is a record id of an Assessment__c.
*/
    @AuraEnabled
    public static List<Sobject> getAssessmentStatus(String assessmentId)
    {
        List<Sobject> assessmentstatus =[SELECT Id, IsDeleted, ParentId, CreatedById, CreatedDate, Field, DataType, OldValue, NewValue,
                                                CreatedBy.Name  
                                         FROM AccountAssessmentRelation__History  
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
                                                Start_Date__c,End_Date__c,CreatedDate,CreatedUser__c
                                                FROM Assessment__c LIMIT 100];
        return AssessmentRecords;
    }
    @AuraEnabled
    public static List<Object> getAccountAssesmentRecords(String accountId, String assessmentId)
    {
        List<Sobject> accountassessment = [SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.name ,
                                           Assessment__r.Status__c,Assessment__r.Customer_Review__c,CreatedDate,
                                           Assessment__r.Number_of_Questions__c,Status__c,Start_Date__c,End_Date__c,
                                           Assessment__r.Additional_Requests__c,Number_of_Questions__c,Assessment__r.CreatedDate,
                                           Assessment__r.Template__c, Number_of_Responses__c,Assessment__r.CreatedBy.Name,Assessment__r.CreatedUser__c
                                           FROM AccountAssessmentRelation__c Where Account__c=:accountId AND Assessment__c=:assessmentId
                                          ORDER BY CreatedDate DESC];
        return accountassessment;
    }
    /**
* Gets the Response__c information of all fields in Response__c for a particular Question__c, Assessment__c.
* @param assessmentId This is a record id of an Assessment__c.
* @param questionId This is RecordId of Question__c.
*/
    @AuraEnabled
    public static List<Response__c> getResponseList(String responseWrapper)
    {
        
        Map<String,Object> responseMap = (Map<String,Object>)JSON.deserializeUntyped(responseWrapper);
        System.debug('responseMap'+responseMap);
        System.debug((String)responseMap.get('assessmentId'));
        System.debug((String)responseMap.get('questionId'));
        List<Response__c> responseRecords=[SELECT Conversation_History__c,createdDate 
                                           FROM Response__c 
                                           WHERE AccountAssessmentRelation__c =:(String)responseMap.get('accountassessmentId') AND Question__c=:(String)responseMap.get('questionId') 
                                           AND Is_Latest_Response__c=true ];
        System.debug('responseRecords'+responseRecords);
        return responseRecords;
    }
    
    /* getUserName method is used to get the username */
    @AuraEnabled
    public static string getUserName()
    {
        string userName=UserInfo.getName();
        return userName;
    }
    /**
* Gets the AccountId information of a user who logged in to portal.
*/ 
    @AuraEnabled
    public static string getAccountId()
    {
        //List<User> strAccId = [SELECT Contact.AccountId FROM User WHERE id=:userinfo.getuserid()];
        //return strAccId[0].Contact.AccountId;
        
         return null;
    }
    
    
     @AuraEnabled
    public static string getCommunityURL()
    {
           Id currentNetworkId = Network.getNetworkId();
           String relativeUrlBase = URL.getSalesforceBaseUrl().toExternalForm()+'/login';
           return relativeUrlBase;
        
       // return null;
    }
    
    
    /**
* Gets the AccountAssessmentRelation__c information of all fields in AccountAssessmentRelation__c for a particular Account__c.
* @param accountId This is a record id of an Account__c.
*/
    @AuraEnabled
    public static List<SObject> getAssessmentJunctionRecords(String accountId)
    {
        System.debug('accountId'+accountId);
        List<SObject> assessmentData = [SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.name ,Assessment__r.Status__c,Assessment__r.Customer_Review__c,Assessment__r.Number_of_Questions__c,
                                        Assessment__r.Additional_Requests__c,Number_of_Questions__c, Number_of_Responses__c,
                                        Assessment__r.CreatedBy.Name,Status__c,End_Date__c,Completed__c,Follow_Up_Requests__c
                                        FROM AccountAssessmentRelation__c 
                                        WHERE Account__c=:accountId order by CreatedDate DESC];
        System.debug('assessmentData'+assessmentData);
        return assessmentData;
    }
    @AuraEnabled
    public static List<AccountAssessmentRelation__c> uploadPdfContent(String pdfdata, String recordId)
    {
        System.debug('recordId'+recordId);
        System.Debug('pdfdata'+pdfdata);
        List<AccountAssessmentRelation__c> assessmentsdata =[SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.name ,Assessment__r.Status__c,Assessment__r.Customer_Review__c,Assessment__r.Number_of_Questions__c,
                                        Assessment__r.Additional_Requests__c,Number_of_Questions__c, Number_of_Responses__c,
                                        Assessment__r.CreatedBy.Name,Status__c,End_Date__c,Completed__c,Follow_Up_Requests__c,PdfConvertor__c
                                        FROM AccountAssessmentRelation__c where id=:recordId];
        //assessmentsdata[0].PdfConvertor__c = pdfdata;
        for(AccountAssessmentRelation__c accassessment :assessmentsdata)
        {
            accassessment.PdfConvertor__c = pdfdata;
        }
        System.debug('assessmentsdata'+assessmentsdata);
        update assessmentsdata;
        return assessmentsdata;
    }
    
    /**
* Its used to update a flag in Response__c.
* @param questionId record id of a Question__c.
*/
    @AuraEnabled
    public static List<Sobject> getAccountAssessmentRecordData(String assrecordId)
    {
        List<Sobject> accountassessment = [SELECT Id, IsDeleted, Name,Account__c,Assessment__c, Assessment__r.Name,
                                           Assessment__r.Status__c,Assessment__r.Customer_Review__c,CreatedDate,
                                           Assessment__r.Number_of_Questions__c,Start_Date__c,End_Date__c,Status__c,
                                           Assessment__r.Additional_Requests__c,Number_of_Questions__c,Assessment__r.CreatedDate,
                                           Assessment__r.Template__c, Number_of_Responses__c,Assessment__r.CreatedBy.Name,Assessment__r.CreatedUser__c,
                                           CreatedBy.Name
                                           FROM AccountAssessmentRelation__c 
                                           WHERE Id=:assrecordId ];
        return accountassessment;
    }
    /**
* Its used to update a flag in Response__c.
* @param questionId record id of a Question__c.
*/
    @AuraEnabled
    public static List<SObject> getResponseFlag(String questionId, String accountAssessmentId)
    {
        System.debug('questionId'+questionId);
        System.debug('assessmentId'+accountAssessmentId);
        List<Response__c> SupplierResponseList=  [SELECT Id, Question__c,Assessment__c,Question__r.Question_Type__c, 
                                                  Assessment__r.Name,Files__c, Response__c,CreatedBy.Name,CreatedDate, Flag__c, 
                                                  Conversation_History__c,LastModifiedDate,LastModifiedById 
                                                  FROM Response__c 
                                                  WHERE Question__c=:questionId AND AccountAssessmentRelation__c=:accountAssessmentId AND Is_Latest_Response__c= true];
        System.debug('SupplierResponseList'+SupplierResponseList);
        if(!SupplierResponseList.isEmpty())
        {
            for(Response__c response :SupplierResponseList)
            {
                response.Flag__c = !(response.Flag__c);
            }	
            System.debug('Flag__c'+SupplierResponseList);
            update SupplierResponseList;
            return SupplierResponseList;
        }
        else
        {
            System.debug('Into else');
            Response__c response = new Response__c();
            response.Question__c = questionId;
            response.AccountAssessmentRelation__c = accountAssessmentId;
            response.Flag__c = True;
            response.Is_Latest_Response__c = true;
            INSERT response;
            return (new List<Response__c>());
        }
        
    }
    
    /**
* Its used to delete a file reference in Response__c.
* @param questionId record id of a Question__c.
* @param name filename .
*/
    @AuraEnabled
    public static Object deleteFileAttachment(String deleteMap)
    {
        Map<String,Object> filemap = (Map<String,Object>) JSON.deserializeUntyped(deleteMap);
        System.debug('deleteMap'+filemap);
        List<Response__c> responseRecords = [SELECT Id, Question__c,Question__r.Name, Assessment__r.Name,Files__c, Response__c,
                                             CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,
                                             LastModifiedDate,LastModifiedById 
                                             FROM Response__c 
                                             WHERE Question__c=:(String)filemap.get('questionId') AND
                                             AccountAssessmentRelation__c =:(String)filemap.get('accountAssessmentId')
                                             AND Is_Latest_Response__c = true
                                             LIMIT 50000];
        System.debug('responseRecords'+responseRecords);
        List<Object> responseFilesData= (List<Object>)JSON.deserializeUntyped(responseRecords[0].Files__c);
        List<object>duplicate=new List<object>();
        for(Integer i=0;i<responseFilesData.size();i++)
        {
            Map<String,Object> mp = (Map<String,Object>)responseFilesData[i];
            String responseurl = (String)mp.get('name');
            if(responseurl==(String)filemap.get('name'))
            {
                Object obj = responseFilesData.remove(i);
            }
        }
        responseRecords[0].Files__c = JSON.serialize(responseFilesData);
        UPDATE responseRecords;
        return responseRecords[0].Files__c;
        
    }
    
    
    /**
* Its used to save the communication log of a quesiton in Response__c.
* @param responseList JSON format of a conversation log.
* @param assessmentId record id of an Assessment__c .
* @param questionId record id of a Question__c .
*/
    @AuraEnabled
    public static void saveChatterResponse(String chatWrapperstring)// responseList,string assessmentId,string questionId)
    {
        Map<String,Object> chatMap = (Map<String,Object>)JSON.deserializeUntyped(chatWrapperstring);
        System.debug('chatMap'+chatMap);
        List<Response__c> responseRecords=[SELECT Conversation_History__c,createdDate	
                                           FROM Response__c 
                                           WHERE AccountAssessmentRelation__c =:(String)chatMap.get('accountassessmentId')
                                           AND Question__c=:(String)chatMap.get('questionId')
                                           AND Is_Latest_Response__c=true 
                                          ];
        
        if(!responseRecords.isEmpty()){
            responseRecords[0].Conversation_History__c=JSON.serialize(chatMap.get('responseList'));
            UPDATE responseRecords;
        }
        else
        {
            System.debug('into else');
            Response__c response = new Response__c();
            response.Question__c = (String)chatMap.get('questionId');
           // response.Assessment__c = (String)chatMap.get('assessmentId');
            response.Conversation_History__c = JSON.serialize(chatMap.get('responseList'));
            response.AccountAssessmentRelation__c=(String)chatMap.get('accountassessmentId');
            response.Is_Latest_Response__c = true;
            INSERT response;
        }
        
    }
    
    
    
    /**
* Its used to capture the error information of any apex/js call.
* @param componentName LWC component name.
* @param methodName Apex method name.
* @param className Apex class name.
* @param errorData stack trace information.
*/
    @AuraEnabled
    public static void errorLogRecord(String errorLogWrapper)
    {
        Map<String,Object> errorLogMap = (Map<String,Object>)JSON.deserializeUntyped(errorLogWrapper);
        ErrorTransactionLog__c errorRecord=new ErrorTransactionLog__c();
        errorRecord.Class_Name__c=(String)errorLogMap.get('className');
        errorRecord.LWC_Component_Name__c=(String)errorLogMap.get('componentName');
        errorRecord.Method_Name__c=(String)errorLogMap.get('methodName');
        errorRecord.Error_Stack_Trace__c=(String)errorLogMap.get('errorData');
        INSERT errorRecord;
    }
    @AuraEnabled
    public static Boolean updateSectionSequence(list<Section__c> secList){//Todo priyanka to work
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
    public static List<sObject> uploadFile(String fileResp)
    {
        System.debug('uploadFile '+fileResp);
        Map<String,Object> filemap = (Map<String,Object>) JSON.deserializeUntyped(fileResp);
        System.debug('filemap '+filemap);
        System.debug(filemap.get('quesId'));
        try
        {
            String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
            System.debug('Before blob');
            String fileblob = (String)filemap.get('fileBlob');
            Blob file=EncodingUtil.base64Decode(fileblob.split(',')[1]);
            System.debug('After blob');
            ContentVersion cv=new ContentVersion();
            cv.VersionData=file;
            cv.PathOnClient=(String)filemap.get('name');
            INSERT cv;
            List<Response__c> srList = new List<Response__c>();
            List<ContentVersion> cvList=[SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id=:cv.Id];
            String ftype = ((String)filemap.get('name')).substringAfter('.');
            System.debug('filemap'+filemap.get('quesId'));
            if((String)filemap.get('quesId')!=null)
            {
                
                srList = [SELECT Id,Files__c,Question__c 
                          FROM Response__c 
                          WHERE Question__c =:(String)filemap.get('quesId') AND AccountAssessmentRelation__c=:(String)filemap.get('assessmentId') AND Is_Latest_Response__c = true];
                System.debug('Into if'+srList);
                if(!srList.isEmpty() ){
                    String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+cvList[0].ContentDocumentId+'?operationContext=S1';
                    String fileJson = '{"name":"'+(String)filemap.get('name')+'","url":"'+fileUrl+'","type":"'+ftype+'"}';
                    srList[0].Files__c = (srList[0].Files__c == null || srList[0].Files__c.trim().length() == 0 || srList[0].Files__c=='[]') ? '['+fileJson+']' : '['+fileJson+','+srList[0].Files__c.substring(1,srList[0].Files__c.length());
                    UPDATE srList;
                }
                else{
                    Response__c res=new Response__c();
                    res.Question__c=(String)filemap.get('quesId');
                    res.AccountAssessmentRelation__c=(String)filemap.get('assessmentId');
                    System.debug('Into else');
                    String fileUrl = baseUrl+'/sfc/servlet.shepherd/document/download/'+cvList[0].ContentDocumentId+'?operationContext=S1';
                    string fileJson = '[{"name":"'+(String)filemap.get('name')+'","url":"'+fileUrl+'","type":"'+ftype+'"}]';
                    res.Files__c=fileJson;
                    res.Is_Latest_Response__c= true;
                    srList.add(res);
                    INSERT srList;
                }
            }
            
            return srList;
        }
        catch(Exception e)
        {
            return null;
        }
    }
    
    /**
* Its used to get the suppliers.
* @param searchKey userinput for the search.
*/
    @AuraEnabled(cacheable=true)
    public static List<Account> getAllSuppliers(string existingData, string searchKey, string exSearchKey){
        List<Account> supplierList = new List<Account>();
        set<string> selSet = new set<string>();
        selSet.add(existingData);
        string query = '';
        try{
            set<Id> existingSups = new set<Id>();
            if(string.isNotBlank(existingData)){
                existingSups = (set<Id>) JSON.deserialize(existingData, set<Id>.class);
            }
            query = 'SELECT Id,Name FROM Account ';
            string filter = '';
            if(string.isNotBlank(searchKey)){
                string sKey = '\'%'+searchKey+'%\'';
                filter += ' WHERE ((Name LIKE '+sKey+') ';
            }
            if(string.isNotBlank(existingData))
            {
                if(string.isNotBlank(searchKey))
                {
                    filter += ' AND (Id NOT IN :existingSups)) OR ((Id IN :existingSups) ';
                }
                else
                {
                    filter += ' WHERE (Id NOT IN :existingSups) OR ((Id IN :existingSups) ';
                }
                if(string.isNotBlank(exSearchKey))
                {
                    string sKey = '\'%'+exSearchKey+'%\'';
                	filter += ' AND (Name LIKE '+sKey+') ';
                }
            }
            if(String.isNotBlank(filter))
            {
                filter+=' )';
            }
            query = query+filter+' Order By CreatedDate DESC limit 10 ';
            system.debug('query---->'+query);
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return Database.query(query);
    }
    
    
    /**
* It is used to create assessment record with suppliers
* @param assessmentRecord record data given by user for assessment creation.
* @param suppliers strigified list of suppliers selected.
* @param deleteList strigified list of suppliers removed.
*/
    
    @AuraEnabled
    public static ResultWrapper sendAssessment(sObject assessmentRecord,string operationType, string suppliers,string existingSups, string deleteList){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            string assessmentId = '';
            if(operationType.equalsIgnoreCase('new')){
                system.debug('inNew------>');
                insert assessmentRecord;
            }
            system.debug('assessmentRecord------>'+assessmentRecord);
            assessmentId = assessmentRecord.Id;
            Date asmtStartDate = (Date)assessmentRecord.get('Start_Date__c');
            Date asmtEndDate = (Date)assessmentRecord.get('End_Date__c') != null?(Date)assessmentRecord.get('End_Date__c'):null;
            system.debug('asmtStartDate------>'+asmtStartDate);
            system.debug('assessmentId------>'+assessmentId);
            set<string> suppliersList = new set<string>();
            set<string> deleteSupList = new set<string>();
            set<string> existingSupList = new set<string>();
            set<string> suppliersIds = new set<string>();
            if(string.isNotBlank(suppliers)){
                suppliersList = (set<string>) JSON.deserialize(suppliers, set<string>.class);
            }
            if(string.isNotBlank(existingSups)){
                existingSupList = (set<string>) JSON.deserialize(existingSups, set<string>.class);
            }
            for(string newSupId:suppliersList){
                // if(!existingSupList.contains(newSupId)){
                    suppliersIds.add(newSupId);
                // }
            }
            if(string.isNotBlank(deleteList)){
                deleteSupList = (set<string>) JSON.deserialize(deleteList, set<string>.class);
                system.debug('deleteSupList------>'+deleteSupList);
                List<Assessment_Supplier__c> deleteAccAssRelns = new List<Assessment_Supplier__c>();
                for(Assessment_Supplier__c assReln:[SELECT Id FROM Assessment_Supplier__c WHERE Account__c IN:deleteSupList]){
                    deleteAccAssRelns.add(assReln);
                }
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteAccAssRelns);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                SYstem.debug(errorList);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            List<AccountAssessmentRelation__c> accountAssessRelnsList = new List<AccountAssessmentRelation__c>();
            List<Assessment_Supplier__c> assessSupList = new List<Assessment_Supplier__c>();
            
            for(Account acc:[SELECT Id,Name FROM Account WHERE ID IN:suppliersIds]){
                Assessment_Supplier__c assessSup = new Assessment_Supplier__c();
                assessSup.Account__c = acc.Id;
                assessSup.Assessment__c = assessmentId;
                assessSup.Status__c = 'Active';
                assessSupList.add(assessSup);
                if(asmtStartDate == Date.Today()){
                    AccountAssessmentRelation__c accAssessReln = new AccountAssessmentRelation__c();
                    accAssessReln.Name = acc.Name;
                    accAssessReln.Account__c = acc.Id;
                    accAssessReln.Assessment__c = assessmentId;
                    if(asmtStartDate != null){
                        accAssessReln.Start_Date__c = asmtStartDate;
                    }
                    if(asmtEndDate != null){
                        accAssessReln.End_Date__c = asmtEndDate;
                    }
                    accAssessReln.Status__c = 'New';
                    accountAssessRelnsList.add(accAssessReln);
                }
            }
            set<Id> successRecordsIdSet = new set<Id>();
            if(accountAssessRelnsList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(accountAssessRelnsList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                SYstem.debug(errorsList);
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
                sendEmails(successRecordsIdSet,'');
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
    public static void sendEmails(Set<Id> recordIdsSet, string Source){
        try{
            List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
            if(string.isBlank(Source)){
                for(AccountAssessmentRelation__c assRelRec:[SELECT Id,Account__c,Account__r.Name,Account__r.Email__c,Assessment__c FROM AccountAssessmentRelation__c WHERE ID IN:recordIdsSet]){
                    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                    List<String> sendTo = new List<String>();
                    sendTo.add(assRelRec.Account__r.Email__c);
                    mail.setToAddresses(sendTo);
                    mail.setSubject('Sample Survey');
                    String body = '<html><body>'+
                        '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                        '<br><br>'+'we’d like to complete a short survey.'+
                        '<br><br><a href='+System.Label.Supplier_Portal_URL+assRelRec.Id+'>Take the survey now.</a>'+
                        '<br><br>'+'Kind regards,'+
                        '<br>'+'Rhythm';
                    mail.setHtmlBody(body);
                    emailMessagesList.add(mail);
                }
            }else{
                for(AccountAssessmentRelation__c assRelRec:[SELECT Id,Account__c,Account__r.Name,Account__r.Email__c,Assessment__c FROM AccountAssessmentRelation__c WHERE ID IN:recordIdsSet]){
                    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                    List<String> sendTo = new List<String>();
                    sendTo.add(assRelRec.Account__r.Email__c);
                    mail.setToAddresses(sendTo);
                    mail.setSubject('Updates on the Assessment');
                    String body = '<html><body>'+
                        '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                        '<br><br>'+'There are few comments on the responses submitted.'+
                        '<br><br><a href='+System.Label.Supplier_Portal_URL+assRelRec.Id+'>Click Here</a>'+
                        '<br><br>'+'Kind regards,'+
                        '<br>'+'Rhythm';
                    mail.setHtmlBody(body);
                    emailMessagesList.add(mail);
                }
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
        string query = 'SELECT Id,Start_Date__c,End_Date__c FROM Assessment__c WHERE Id=\'' + assessmentId + '\' LIMIT 1';
        return safe.doQuery(query);
    }
    
    /**
* It is used to search the existing suppliers for assessment.
* @param assesmentId assessment record id
* @param searchKey user input to search supplier
*/
    @AuraEnabled(cacheable=true)
    public static List<AccountAssessmentRelation__c> getExistingSuppliersWithSearch(string assessmentId, string searchKey){
        string query = 'SELECT Id,Account__c,Account__r.Name FROM Assessment_Supplier__c WHERE Assessment__c = \'' + assessmentId + '\'';
        if(string.isNotBlank(searchKey)){
            string sKey = '\'%'+searchKey+'%\'';
            query = query+' AND Account__r.Name LIKE '+sKey;
        }else{
            query = query+' LIMIT 500';
        }
        return safe.doQuery(query);
    }
    
    @AuraEnabled
    public static ResultWrapper deleteAssessment(string assessmentId){
        ResultWrapper resWrap = new ResultWrapper();
        try{
            List<Assessment__c> deleteAssmtsList = new List<Assessment__c>();
            for(Assessment__c assmt:[SELECT Id FROM Assessment__c WHERE Id =:assessmentId]){
                deleteAssmtsList.add(assmt);
            }
            List<Database.DeleteResult> deleteResult = safe.doDelete(deleteAssmtsList);
            List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
            resWrap.isSuccess = true;
            resWrap.message = '';
            resWrap.errorCode = '';
            if(errorList.size()>0){
                resWrap.isSuccess = false;
                resWrap.message = '';
                resWrap.errorCode = '';
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            resWrap.isSuccess = false;
            resWrap.message = e.getMessage();
            resWrap.errorCode = '';
            throw new AuraHandledException(ErrorMsg);
        }
        return resWrap;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Assessment_Template__c> getTemplateData(string templateId){
        return [SELECT Id,Status__c,Name FROM Assessment_Template__c WHERE Id=:templateId ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Assessment__c> getAssessmentRecordData(string accountId){
        return [SELECT Id,Start_Date__c,Name FROM Assessment__c WHERE Account__c=:accountId ];
    }
    
    /* getSectionsRecCount method is used to get all the Sections count to particular Assessment Template */
    @AuraEnabled
    Public static Integer getSectionsRecCount(String templateId){
        Integer totalRecsCount=0;
        try{
            List<Section__c> sectionList=[select Id  from Section__c where Assessment_Template__c =: templateId ];
            //  List<Section__c> sectionList=safe.doQuery(query);
            totalRecsCount=sectionList.size();
        } catch(Exception e)
        {
            System.debug('Exception e=='+e.getmessage());
        }
        return totalRecsCount;
    }
    
    
    /*   @AuraEnabled(cacheable=true)
Public static List<QuestionWrapper> getQuestionsLists(String templateId){
List<QuestionWrapper> questionListWrapper = new List<QuestionWrapper>();
try{
List<Question__c> questionList = [select id,name,Section__c,Question_Type__c,
Conditional_Response__c,OptionValueSet__c,Question__c,Requires_File_Upload__c,
Parent_Question__c,HelpText__c,Section__r.Name,Section__r.Id,
Assessment_Template__c,(select Flag__c from Responses__r) from Question__c where Assessment_Template__c =:templateId];
for(Question__c question:questionList){
QuestionWrapper questionwrapper = new QuestionWrapper();
questionwrapper.recId=question.Id;
questionwrapper.colfield2=question.name;
questionwrapper.assessmentTemplateId=question.Assessment_Template__c;
questionwrapper.sectionId=question.Section__c;
questionwrapper.name=question.Question__c;
questionListWrapper.add(questionwrapper);
}
}
catch(Exception e)
{
System.debug('Exception e=='+e.getmessage());
}
return questionListWrapper;
}*/
    
    @AuraEnabled
    Public static Integer getQuestionsRecCount(String templateId){
        Integer totalRecsCount=0;
        try{
            List<Question__c> sectionList=[select Id  from Question__c where Assessment_Template__c =: templateId ];
            //  List<Section__c> sectionList=safe.doQuery(query);
            totalRecsCount=sectionList.size();
        } catch(Exception e)
        {
            System.debug('Exception e=='+e.getmessage());
        }
        return totalRecsCount;
    }
    
    
    /* getTemplateSections method is used to get all the Sections related to particular Assessment Template */
    @AuraEnabled
    Public static List<SectionWrapper> getTemplateSections(String templateId,Integer recslimit){
        List<SectionWrapper> sectionwraplist=new List<SectionWrapper>();
        try{
            List<Assessment_Template__c> AssessmentList= [Select Status__c from Assessment_Template__c where ID=:templateId LIMIT 1];
            Assessment_Template__c assessmenttemp=(AssessmentList.size()==1)?AssessmentList[0]:null;
            String query='select Id,Name,Parent_Section__c, Root_Section__c, Assessment_Template__c, Assessment_Template_Version__c,No_of_Questions__c, Section_Sequence_Number__c, Historical_Id__c, Cloned_Record_Id__c from Section__c where Assessment_Template__c = \'' + templateId + '\' order by Section_Sequence_Number__c ASC LIMIT '+recslimit;
            // List<Section__c> SectionList=  [select Id,Name,Parent_Section__c, Root_Section__c, Assessment_Template__c, Assessment_Template_Version__c,No_of_Questions__c, Section_Sequence_Number__c, Historical_Id__c, Cloned_Record_Id__c from Section__c where Assessment_Template__c=:assessmenttemplateId order by Section_Sequence_Number__c ASC LIMIT +'recslimit'];
            List<Section__c> SectionList=safe.doQuery(query);
            for(Section__c sec:SectionList){
                SectionWrapper sectionwrap=new SectionWrapper();
                sectionwrap.name=sec.name;
                sectionwrap.noofqustns=(Integer)sec.No_of_Questions__c;
                sectionwrap.sequencenumber=sec.Section_Sequence_Number__c;
                sectionwrap.assessmenttemplateId=sec.Assessment_Template__c;
                sectionwrap.sectionId=sec.Id;
                if(assessmenttemp!=null ){
                    if(assessmenttemp.Status__c=='New')
                        sectionwrap.assessmentstatus=true;
                }
                sectionwraplist.add(sectionwrap);
            }
        }
        catch(Exception e)
        {
            System.debug('Exception e=='+e.getmessage());
        }
        return sectionwraplist;
    }
    
    /* getQuestionsList method is used to get all the questions and sections */
    @AuraEnabled(cacheable=true)
    Public static List<QuestionWrapper> getQuestionsLists(String templateId){
        List<QuestionWrapper> questionListWrapper = new List<QuestionWrapper>();
        try{
            List<Question__c> questionList = [select id,name,Section__c,Question_Type__c,
                                              Conditional_Response__c,OptionValueSet__c,Question__c,Requires_File_Upload__c,
                                              Parent_Question__c,HelpText__c,Section__r.Name,Section__r.Id,
                                              Assessment_Template__c,(select Flag__c from Responses__r) from Question__c where Assessment_Template__c =:templateId];
            for(Question__c question:questionList){
                QuestionWrapper questionwrapper = new QuestionWrapper();
                questionwrapper.questionId=question.Id;
                questionwrapper.assessmentTemplateId=question.Assessment_Template__c;
                questionwrapper.sectionId=question.Section__c;
                questionwrapper.question=question.Question__c;
                questionListWrapper.add(questionwrapper);
            }
        }
        catch(Exception e)
        {
            System.debug('Exception e=='+e.getmessage());
        }
        return questionListWrapper;
    }
    /* deleteRecords method is used to delete the records */
    @AuraEnabled
    public static String deleteRecords(List<Id> recIdList)
    {
        
        String status='Success';
        try{
            Database.DeleteResult[] drList=Database.delete(recIdList,true);
            for(Database.DeleteResult dr:drList)
            {
                if(!dr.isSuccess())
                {
                    for(Database.Error de:dr.getErrors())
                    {
                        status='Error Status Code: '+de.getStatusCode()+' || '+de.getMessage()+' || Error Source:'+de.getFields();
                    }
                }
            }
        }
        catch(Exception e)
        {
            System.debug('Exception e=='+e.getmessage());
        }
        return status;
    }
    /* insertSection method is used to insert the section records */
    @AuraEnabled
    Public static void insertSection(Id AssessmentTempalteId,String SectionName){
        if(AssessmentTempalteId!=null)
        {
            try{
                Section__c sec=new Section__c();
                sec.Assessment_Template__c=AssessmentTempalteId;
                sec.Name=SectionName;
                Database.insert(sec);
                System.debug(sec.id);
            }
            catch(Exception e)
            {
                System.debug('Exception '+e);
            }
        } 
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
    
    
    
    public class QuestionWrapper{
        @AuraEnabled
        public Id questionId{get;set;}
        @AuraEnabled
        public String question{get;set;}
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String sectionId{get;set;}
        @AuraEnabled
        public String assessmentTemplateId{get;set;}
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
    public class SectionWrapper{
        @AuraEnabled
        public Id sectionId{get;set;}
        @AuraEnabled
        public Integer noofqustns{get;set;}
        @AuraEnabled
        public Id assessmenttemplateId{get;set;}
        @AuraEnabled
        public Decimal sequencenumber{get;set;}
        @AuraEnabled
        public String name{get;set;}
        @AuraEnabled
        public Boolean assessmentstatus{get;set;}
    }  
    
    /**
* It is used to throw the exception
*/
    public class SecurityControllerException extends Exception{
        
    }
    
}