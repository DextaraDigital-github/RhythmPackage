/** 
* Class Name        : ResponseHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description        : It is used to perform the trigger logic on Response__c object.
* Last Modified Date: 
*/

public with sharing class ResponseHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work

    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
       return;
    }

    /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        getResponseCount(newList);
    }
    
     /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        return;
    }
    
    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        getResponseCount(newList);
    }
    
    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        return;
    }
    
    /**
    * @description To execute after delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        return;
    }
    
    /**
    * @description To execute after undelete logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        return;
    }
    
    /**
    * @description To calculate response count.
    * @param newList This is the new list of records.
    */
    public void getResponseCount(List<sObject> newList){
        Set<Id> accAssessmentSet = new Set<Id>();
        List<String> errorList = new  List<String>();
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
            errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
        }
        if(errorList.size()>0){
            Database.rollback(sp);
            throw new SecurityControllerException(String.join( errorList, ', ' ));
        }
    }

    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
        
    }
}