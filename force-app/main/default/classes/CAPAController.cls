public class CAPAController {
    
    @AuraEnabled(cacheable=true)
    public static Map<string,List<string>> getPicklistValues(){
        
        Map<string,List<string>> values=CAPAService.getPicklistValues();
        return values;
        
    }
    
    @AuraEnabled
    public static void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
        
        CAPAService.saveActionResponse(actionResponse,isUpdate);
        
    }
    
    @AuraEnabled
    public static void deleteActionData(string questionId, string accountAssessmentId){
        
        CAPAService.deleteActionData(questionId,accountAssessmentId);
        
    }
    
    @AuraEnabled
    public static List<user> getRecordsList(string userName){
       List<user> userData= CAPAService.getRecordsList(userName);
        return userData;
    }
     
    @AuraEnabled
    public static List<Action__c> getActionResponse(Map<String,string> actionResponse){
        
        List<Action__c> actionItemData=CAPAService.getActionResponse(actionResponse);
        return actionItemData;
        
    }
    
     @AuraEnabled
    public static List<Action__c> getActionRecords(string accountAssessment){
        
         List<Action__c> actionRecords=CAPAService.getActionRecords(accountAssessment);
        return actionRecords;
        
        
    }
    @AuraEnabled
    public static List<Action__c> actionRecords(){
        
        List<Action__c> actionItemRecords= CAPAService.actionRecords();
        return actionItemRecords;
        
    }
    
    @AuraEnabled
    public static List<Action__c> selectedActionRecord(string actionid){
        
        List<Action__c> selectedActionRecord= CAPAService.selectedActionRecord(actionid);
        
        return selectedActionRecord;
    }
    

}