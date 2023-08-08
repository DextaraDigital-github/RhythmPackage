/** 
* Class Name        : AssessmentTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description       : It is used to send the assessment notification to suppliers.
* Last Modified Date: 
*/
global with sharing class SendAssessmentNotificationsBatch implements Database.Batchable<sObject> {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    /**
    * @description Start method to query the required records.
    * @param bc It is an instance of BatchableContext.
    * @return
    */
    global Database.QueryLocator start(Database.BatchableContext bc){
        Date todayDate = Date.Today();
        string query = 'SELECT Id,Name,Assessment__r.Start_Date__c,Assessment__r.End_Date__c,Account__r.Name,Account__c,Assessment__c FROM Assessment_Supplier__c WHERE Status__c= \'Active\' AND Assessment__r.Start_Date__c=:todayDate AND Assessment__r.Number_of_invited_Suppliers__c= 0 WITH SECURITY_ENFORCED';
        return Database.getQueryLocator(query);
    }

     /**
    * @description execute method to process the records.
    * @param bc It is an instance of BatchableContext. 
    * @param scope List of Assessment_Supplier__c object.
    */
    /* sfge-disable-stack ApexFlsViolationRule */
    global void execute(Database.BatchableContext bc, List<Assessment_Supplier__c> scope){
        List<ErrorTransactionLog__c> errorList = new List<ErrorTransactionLog__c>();
        try{
            Configuration__mdt siteData = Configuration__mdt.getInstance('Site_URL');
            List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
            List<AccountAssessmentRelation__c> accountAssessRelnsList = new List<AccountAssessmentRelation__c>();
            for(Assessment_Supplier__c assSuppl:scope){
                AccountAssessmentRelation__c accAssessReln = new AccountAssessmentRelation__c();
                accAssessReln.Name = assSuppl.Account__r.Name;
                accAssessReln.Account__c = assSuppl.Account__c;
                accAssessReln.Assessment__c = assSuppl.Assessment__c;
                if(assSuppl.Assessment__r.Start_Date__c != null){
                    accAssessReln.Start_Date__c = assSuppl.Assessment__r.Start_Date__c;
                }
                if(assSuppl.Assessment__r.End_Date__c != null){
                    accAssessReln.End_Date__c = assSuppl.Assessment__r.End_Date__c;
                }
                accAssessReln.Status__c = 'New';
                accountAssessRelnsList.add(accAssessReln);
            }
            set<Id> successRecordsIdSet = new set<Id>();
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(accountAssessRelnsList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(accountAssessRelnsList);
                for(Database.SaveResult result : results) {
                    if(result.isSuccess()){
                        successRecordsIdSet.add(result.getId());
                    }
                }
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            if(successRecordsIdSet.isEmpty() == false){
               
                for(AccountAssessmentRelation__c assRelRec:[SELECT Id,Account__r.Name,Account__r.Email__c,Assessment__c FROM AccountAssessmentRelation__c WHERE ID IN:successRecordsIdSet WITH SECURITY_ENFORCED]){
                    if(String.isNotBlank(assRelRec.Account__r.Email__c) && siteData != null){
                        List<String> sendTo = new List<String>();
                        sendTo.add(assRelRec.Account__r.Email__c);
                        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
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
            }
            if(emailMessagesList.isEmpty() == false){
                List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emailMessagesList);
                for(Messaging.SendEmailResult result :emailResults) {   
                    List<Messaging.SendEmailError> errors = result.getErrors();                                 
                    if(!result.IsSuccess() && errors.size() > 0){
                        Messaging.SendEmailError err = errors[0];
                        ErrorTransactionLog__c errorRec = new ErrorTransactionLog__c();
                        errorRec.Class_Name__c = 'SendAssessmentNotificationsBatch';
                        errorRec.Error_Stack_Trace__c = err.getMessage();
                        errorRec.Name = 'Error Record';
                        errorRec.LWC_Component_Name__c = '';
                        errorRec.Method_Name__c = 'ExecuteMethod';
                        errorList.add(errorRec);
                    }
                }
            }
        }catch(exception e){
            ErrorTransactionLog__c errorRec = new ErrorTransactionLog__c();
            errorRec.Class_Name__c = 'SendAssessmentNotificationsBatch';
            errorRec.Error_Stack_Trace__c = e.getStackTraceString();
            errorRec.Name = 'Error Record';
            errorRec.LWC_Component_Name__c = '';
            errorRec.Method_Name__c = 'ExecuteMethod';
            errorList.add(errorRec);
        }
        if(errorList.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(errorList);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
        }
    }
    /**
    * @description execute any post-processing operations.
    * @param bc It is an instance of BatchableContext.
    */
    global void finish(Database.BatchableContext bc){
        // execute any post-processing operations
        return;
    }
    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
}