/**
* Class Name        : AssessmentExpiryNotificationBatch
* Developer         : Prudhvi   
* Created Date      : 
* @description       : It is to send assessment expiry notification to Suppliers.
* Last Modified Date: 
*/

global with sharing class AssessmentExpiryNotificationBatch implements Database.Batchable<sObject> {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    /**
    * @description Start method to query the required records.
    * @param bc It is an instance of BatchableContext.
    * @return
    */
    global Database.QueryLocator start(Database.BatchableContext bc){
        Date todayDate = Date.Today();
        string query = 'SELECT Id,Name,Account__r.Name,Account__r.Email__c FROM AccountAssessmentRelation__c WHERE Status__c != \'Submitted\' AND Assessment__r.Expiry_Reminder_Date__c != null AND Assessment__r.Expiry_Reminder_Date__c=:todayDate WITH SECURITY_ENFORCED';
        return Database.getQueryLocator(query);
    }

    /**
    * @description execute method to process the records.
    * @param bc It is an instance of BatchableContext.
    * @param scope It is a list of AccountAssessmentRelation__c object.
    */
    /* sfge-disable-stack ApexFlsViolationRule */
    global void execute(Database.BatchableContext bc, List<AccountAssessmentRelation__c> scope){
        List<ErrorTransactionLog__c> errorList = new List<ErrorTransactionLog__c>();
        try{
            set<Id> assmtRelIds = new Set<Id>();
            for(AccountAssessmentRelation__c assRelRec:scope){
                assmtRelIds.add(assRelRec.Id);
            }
            if(assmtRelIds.isEmpty() == false){
                AssessmentController.sendEmails(assmtRelIds,'ExpiryNotification');
            }
        }catch(exception e){
            ErrorTransactionLog__c errorRec = new ErrorTransactionLog__c();
            errorRec.Class_Name__c = 'AssessmentExpiryNotificationBatch';
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
        return;
    }
    
    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
}