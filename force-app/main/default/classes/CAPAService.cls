/**
* Class Name         : CAPAService
* Developer          : Reethika           
* Created Date       : 12-07-2023
* @description       : This class is used to perform the logic related to Action object
* Last Modified Date : 
*/
public with sharing class CAPAService {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;

    private static CAPAService service = null; //private static instance of the class
    static CAPASelector selector = CAPASelector.getInstance();
    /**
    * @description Singleton Design Pattern
    * @return
    */
    public static CAPAService getInstance(){
           if(service == null){
                service = new CAPAService();
            }
        return service;
    }

    /**
    * @description To get the picklist for action object fields.
    * @return
    */
    public Map<string,List<string>> getPicklistValues(){
        try{
            if ((!Schema.sObjectType.Action__c.isAccessible())
                || (!Schema.sObjectType.Action__c.fields.Related_module__c.isAccessible())
                || (!Schema.sObjectType.Action__c.fields.Priority__c.isAccessible())
                || (!Schema.sObjectType.Action__c.fields.Status__c.isAccessible())) {
                return null;
            }
            Map<String, List<string>> values = new Map<String,List<string>>{};
                List<string> picklistField=new List<string>{'Rhythm__Related_module__c','Rhythm__Priority__c','Rhythm__Status__c'};
                List<Schema.DescribeSobjectResult> results = Schema.describeSObjects(new List<String>{'Rhythm__Action__c'}); 
                for(Schema.DescribeSobjectResult res : results) {
                    for(string picklistdata:picklistField){
                        List<string>l=new List<string> ();
                        for (Schema.PicklistEntry entry : res.fields.getMap().get(picklistdata).getDescribe().getPicklistValues()) {
                            if (entry.isActive()) {
                                l.add(entry.getValue());
                            }
                        }
                        values.put(picklistdata,l);
                    }
                }
            return values;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }

    /**
    * @description To save the action record.
    * @param actionResponse action record data.
    * @param isUpdate boolean to check the dml type.
    */
    public void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
        try{
            List<String> errorsList = new List<String>();
            if(isUpdate == false){
                Database.SaveResult[] results = safe.doInsert(actionResponse);
                errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            }
            else{
                Database.SaveResult[] saveResult = safe.doUpdate(actionResponse);
                errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
            }
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorsList, ', ' ));
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }

    /**
    * @description To detele the action record.
    * @param questionId question record id.
    * @param accountAssessmentId response record id.
    */
    public List<Action__c> deleteActionData(string questionId, string accountAssessmentId){
        List<Action__c> deleteData=selector.deleteActionData(questionId,accountAssessmentId);
        try{
            if(deleteData.isEmpty() == false){
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteData);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            return deleteData;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description To get the action records related to particular user.
    * @param userName logged in user's username.
    * @return
    */
    public List<user> getRecordsList(string userName){
       List<user> userData= selector.getRecordsList(userName);
        return userData;
    }
    
    /**
    * @description To get the action records related to a question and response record.
    * @param actionResponse Map with action related data.
    * @return
    */
    public List<Action__c> getActionResponse(Map<String,string> actionResponse){
        List<Action__c> actionItemData = selector.getActionResponse(actionResponse);
        return actionItemData;
    }
    
     /**
    * @description To get the action records related to a response record.
    * @param accountAssessment response data.
    * @return
    */
    public List<Action__c> getActionRecords(string accountAssessment){
        List<Action__c> actionRecords = selector.getActionRecords(accountAssessment);
        return actionRecords;
    }
    
     /**
    * @description To get the action records.
    * @return
    */
    public List<Action__c> actionRecords(){
        List<Action__c> actionItemRecords = selector.actionRecords();
        return actionItemRecords;
    }
    
    /**
    * @description To get the selected action record.
    * @param actionid action record id.
    * @return
    */
    public List<Action__c> selectedActionRecord(string actionid){
        List<Action__c> selectedActionRecord= selector.selectedActionRecord(actionid);
        return selectedActionRecord;
    }

    /**
    * @description To send capa notification.
    * @param subject subject of the email.
    * @param body body of the email.
    * @param userList list of users to send emails.
    */
    public void send(String subject, String body, List<Id> userList){
        SendEmail.send(subject,body,userList);
    }

    /**
    * @description To notify the user for CAPA.
    */
    public void notifyUsers(Map<string,object> actionData, String body, List<Id> userList){
        Object targetId = selector.notifyUsers();
        actionData.put('targetId',targetId);
        Set<string>userdata=new set<string>();
        for(Id userid:userList){
            userdata.add((String)userid);
        }      
        SendEmail.notifyUsers(actionData,body,userdata);  
    }
    
    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
}