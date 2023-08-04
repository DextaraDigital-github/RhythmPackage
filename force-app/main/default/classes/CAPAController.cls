/** 
* Class Name        : CAPAController
* Developer         : Reethika         
* Created Date      : 11-07-2023
* @description      : CAPAController class is used as the controller for CAPA module.
* Last Modified Date: 11-07-2023
*/
public with sharing class CAPAController {
    static CAPAService service = CAPAService.getInstance();

    /**
    * @description get picklist values.
    * @return
    */
    @AuraEnabled(cacheable=true)
    public static Map<string,List<string>> getPicklistValues(){
        Map<string,List<string>> values = service.getPicklistValues();
        return values;
    }

    /**
    * @description This method is used to save the response.
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
        service.saveActionResponse(actionResponse,isUpdate);
    }

    /**
    * @description This method is to delete the action data.
    * @return
    */
    @AuraEnabled
     /* sfge-disable-stack ApexFlsViolationRule */
    public static List<Action__c> deleteActionData(string questionId, string accountAssessmentId){
        List<Action__c> deletedata=service.deleteActionData(questionId,accountAssessmentId);
        return deletedata;
    }
    
    /**
    * @description This method is to get the list of records.
    * @return
    */
    @AuraEnabled
    public static List<user> getRecordsList(string userName){
       List<user> userData= service.getRecordsList(userName);
        return userData;
    }
    
    /**
    * @description This method is to get the action response
    * @return
    */
    @AuraEnabled
    public static List<Action__c> getActionResponse(Map<String,string> actionResponse){
        List<Action__c> actionItemData=service.getActionResponse(actionResponse);
        return actionItemData;
    }
    
    /**
    * @description This method is to get the action records.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> getActionRecords(string accountAssessment){
        List<Action__c> actionRecords=service.getActionRecords(accountAssessment);
        return actionRecords;
    }

    /**
    * @description This method is to get the action records.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> actionRecords(){
        List<Action__c> actionItemRecords= service.actionRecords();
        return actionItemRecords;
    }
    
    /**
    * @description This method is to get the selected action record.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> selectedActionRecord(string actionid){
        List<Action__c> selectedActionRecord= service.selectedActionRecord(actionid);
        return selectedActionRecord;
    }

    /**
    * @description This method is to send email.
    */
    @AuraEnabled
    public static void send(String subject, String body, List<Id> userList){
        service.send(subject,body,userList);
    }

    /**
    * @description This method is to notify users.
    */
    @AuraEnabled
    public static void notifyUsers(Map<string,object> actionData, String body, List<Id> userList){
        service.notifyUsers(actionData,body,userList);
    }

    /**
    * @description This method is to get the current date.
    */
    @AuraEnabled
    public static Date getCurrentDate(){
        return System.today();
    }
}