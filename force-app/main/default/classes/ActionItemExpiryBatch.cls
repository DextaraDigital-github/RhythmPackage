/** 
* Class Name        : ActionItemExpiryBatch
* Developer         : Reethika Velpula           
* Created Date      : 
* @description       : It is used to send the assessment notification to suppliers.
* Last Modified Date: 
*/
global with sharing class ActionItemExpiryBatch implements Database.Batchable<sObject> {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    /**
    * @description Start method to query the required records.
    * @param bc It is an instance of BatchableContext.
    * @return
    */
    global Database.QueryLocator start(Database.BatchableContext bc){
        Date todayDate= Date.Today();
        string query = 'SELECT Id,Status__c,Assigned_To__c,Ownership__c FROM Action__c WHERE Due_Date__c <: todayDate AND Status__c !=\'Expired\' WITH SECURITY_ENFORCED';
        return Database.getQueryLocator(query);
    }
     /**
    * @description execute method to process the records.
    * @param bc It is an instance of BatchableContext. 
    * @param scope List of Assessment_Supplier__c object.
    */
    /* sfge-disable-stack ApexFlsViolationRule */
    global void execute(Database.BatchableContext bc, List<Action__c> scope){
        List<ErrorTransactionLog__c> errorList = new List<ErrorTransactionLog__c>();
        try{
            List<Action__c> actionList = new List<Action__c>();
            List<Id> userIds=new List<Id>();
            for(Action__c ac:scope){
                Action__c actionReln = new Action__c();
                actionReln.Id=ac.Id;
                actionReln.Status__c = 'Expired';
                actionList.add(actionReln);
                userIds.add(ac.Assigned_To__c);
                userIds.add(ac.Ownership__c);
            }
            set<Id> successRecordsIdSet = new set<Id>();
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(actionList.isEmpty() == false){
                Database.SaveResult[] results = safe.doUpdate(actionList);
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
            if(userIds.isEmpty() == false){
                List<Messaging.SendEmailResult> sendmails=SendEmail.send('Action Item','Action Item has Expired',userIds);
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