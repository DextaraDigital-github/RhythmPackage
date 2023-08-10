public with sharing class CAPAController {

    static CAPAService service = CAPAService.getInstance();
    
    // RED FOR NO COMMENTS
    @AuraEnabled(cacheable=true)
    public static Map<string,List<string>> getPicklistValues(){
        Map<string,List<string>> values = service.getPicklistValues();
        return values;
    }
    
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
        service.saveActionResponse(actionResponse,isUpdate);
    }
    
    @AuraEnabled
     /* sfge-disable-stack ApexFlsViolationRule */
    public static List<Action__c> deleteActionData(string questionId, string accountAssessmentId){
        List<Action__c> deletedata=service.deleteActionData(questionId,accountAssessmentId);
        return deletedata;
    }
    
    @AuraEnabled
    public static List<user> getRecordsList(string userName){
       List<user> userData= service.getRecordsList(userName);
        return userData;
    }
     
    @AuraEnabled
    public static List<Action__c> getActionResponse(Map<String,string> actionResponse){
        List<Action__c> actionItemData=service.getActionResponse(actionResponse);
        return actionItemData;
    }
    
    @AuraEnabled
    public static List<Action__c> getActionRecords(string accountAssessment){
        List<Action__c> actionRecords=service.getActionRecords(accountAssessment);
        return actionRecords;
    }

    @AuraEnabled
    public static List<Action__c> actionRecords(){
        List<Action__c> actionItemRecords= service.actionRecords();
        return actionItemRecords;
    }
    
    @AuraEnabled
    public static List<Action__c> selectedActionRecord(string actionid){
        List<Action__c> selectedActionRecord= service.selectedActionRecord(actionid);
        return selectedActionRecord;
    }
    @AuraEnabled
    public static void send(String subject, String body, List<Id> userList){
        service.send(subject,body,userList);
    }
    @AuraEnabled
    public static void notifyUsers(Map<string,object> actionData, String body, List<Id> userList){
        service.notifyUsers(actionData,body,userList);
    }
    
    @AuraEnabled
    public static void deleteCapa(Map<string,object> deletedata){
        service.deleteCapa(deletedata);
    }

    @AuraEnabled
    public static Date getCurrentDate(){
        return System.today();
    }
}