public class ResponseHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        getResponseCount(newList);
    }
    public void beforeInsert(List<sObject> newList) {
       
    }
    
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        
    }
    
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        getResponseCount(newList);
    }
    
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        
    }
    
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        
    }
    
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        
    }
           
    public void getResponseCount(List<sObject> newList){
        Set<Id> accAssessmentSet = new Set<Id>();
        for(Response__c res : (List<Response__c>)newList){
            if(string.isNotBlank(res.AccountAssessmentRelation__c)){
                accAssessmentSet.add(res.AccountAssessmentRelation__c);
            }
        }
        if(accAssessmentSet.isEmpty() == false){
            string asmtRlnQuery = 'SELECT Id,Name,Number_of_Responses__c,Follow_Up_Requests__c,'
                                + '(Select Id,Flag__c from Supplier_Response__r where is_Latest_Response__c =true)'
                                + ' FROM AccountAssessmentRelation__c'
                                + ' WHERE Id IN :accAssessmentSet';
            Map<String, Object> bindVariables = new Map<String, Object>{'accAssessmentSet' => accAssessmentSet};
            List<AccountAssessmentRelation__c> accountAssessmentList = safe.doQueryWithBinds(asmtRlnQuery,bindVariables);
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(accountAssessmentList.isEmpty() == false){
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
                
                Database.SaveResult[] saveResult = safe.doUpdate(accountAssessmentList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
        }
    }
    public class SecurityControllerException extends Exception{
        
    }
}