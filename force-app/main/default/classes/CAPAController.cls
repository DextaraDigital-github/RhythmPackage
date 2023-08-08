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
    * @description To save the action record.
    * @param actionResponse action record data.
    * @param isUpdate boolean to check the dml type.
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
        service.saveActionResponse(actionResponse,isUpdate);
    }

    /**
    * @description To detele the action record.
    * @param questionId question record id.
    * @param accountAssessmentId response record id.
    */
    @AuraEnabled
     /* sfge-disable-stack ApexFlsViolationRule */
    public static List<Action__c> deleteActionData(string questionId, string accountAssessmentId){
        List<Action__c> deletedata=service.deleteActionData(questionId,accountAssessmentId);
        return deletedata;
    }
    
    /**
    * @description To get the action records related to particular user.
    * @param userName logged in user's username.
    * @return
    */
    @AuraEnabled
    public static List<user> getRecordsList(string userName){
       List<user> userData= service.getRecordsList(userName);
        return userData;
    }
    
    /**
    * @description To get the action records related to a question and response record.
    * @param actionResponse Map with action related data.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> getActionResponse(Map<String,string> actionResponse){
        List<Action__c> actionItemData=service.getActionResponse(actionResponse);
        return actionItemData;
    }
    
    /**
    * @description To get the action records related to a response record.
    * @param accountAssessment response data.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> getActionRecords(string accountAssessment){
        List<Action__c> actionRecords=service.getActionRecords(accountAssessment);
        return actionRecords;
    }

    /**
    * @description To get the action records.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> actionRecords(){
        List<Action__c> actionItemRecords= service.actionRecords();
        return actionItemRecords;
    }
    
     /**
    * @description To get the selected action record.
    * @param actionid action record id.
    * @return
    */
    @AuraEnabled
    public static List<Action__c> selectedActionRecord(string actionid){
        List<Action__c> selectedActionRecord= service.selectedActionRecord(actionid);
        return selectedActionRecord;
    }

    /**
    * @description To send capa notification.
    * @param subject subject of the email.
    * @param body body of the email.
    * @param userList list of users to send emails.
    */
    @AuraEnabled
    public static void send(String subject, String body, List<Id> userList){
        service.send(subject,body,userList);
    }

    /**
    * @description To notify the user for CAPA.
    * @param actionData action record data.
    * @param body body of the email.
    * @param userList list of users to send emails.
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