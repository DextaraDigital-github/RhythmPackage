public class ResponseHandler implements ITriggerHandler{
     public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        getResponseCount(newList);
       
    }
     public void beforeInsert(List<sObject> newList) {
        system.debug('afterInsert----->');
       
    }
    
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('beforeUpdate----->');
    }
    
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('afterUpdate----->');
        getResponseCount(newList);
        
    }
    
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('beforeDelete----->');
        
    }
    
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('afterDelete----->');
        
    }
    
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        system.debug('afterUnDelete----->');
    }
           
 public void getResponseCount(List<sObject> newList)
    {
        Set<Id> accAssessmentSet = new Set<Id>();
        for(Response__c res : (List<Response__c>)newList){
            if(res.AccountAssessmentRelation__c !=null)
                accAssessmentSet.add(res.AccountAssessmentRelation__c);
        }
        List<AccountAssessmentRelation__c> accountAssessmentList = [SELECT Id,Name,Number_of_Responses__c,Follow_Up_Requests__c,(Select Id,Flag__c from Supplier_Response__r where is_Latest_Response__c =true) FROM AccountAssessmentRelation__c WHERE Id IN :accAssessmentSet];       
        for(AccountAssessmentRelation__c accAssRel :accountAssessmentList){
            accAssRel.Number_of_Responses__c = accAssRel.Supplier_Response__r.size();
            Integer flaggedResponse = 0;
                for(Response__c res:accAssRel.Supplier_Response__r){
                    if(res.Flag__c){
                        flaggedResponse++;
                    }
                }
            accAssRel.Follow_Up_Requests__c = flaggedResponse;
        }
        
        UPDATE accountAssessmentList;
        
        
    }
}