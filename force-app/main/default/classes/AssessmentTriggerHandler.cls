/** 
* Class Name        : AssessmentTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description        : It is used to perform the trigger logic.
* Last Modified Date: 
*/

public with sharing class AssessmentTriggerHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();
    public static TriggerFrameworkServiceController serviceController = new TriggerFrameworkServiceController();
    
    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        getQuestionsCount(newList,null);
    }
    
     /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
      return;
    }
    
    /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
       
        for(sObject assmt:newMap.values()){
            Decimal supplierCount = (Decimal)assmt.get('Number_of_Invited_Suppliers__c');
            boolean isCriteriaMet = serviceController.checkEntryCriteria(assmt,oldMap.get(assmt.Id),'Assessment_c');
            if(isCriteriaMet && supplierCount > 0){
                assmt.addError('Assessment program in use, cannot be edited.');
            }
        }
        getQuestionsCount(newList, newMap);
    }
    
    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
      return;
    }
    
    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
      for(Assessment__c assmt:(List<Assessment__c>)oldMap.values()){
        Decimal supplierCount = (Decimal)assmt.get('Number_of_Invited_Suppliers__c');
        if(supplierCount > 0){
          assmt.addError('Assessment program in use, cannot be deleted.');
        }
      }
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
    * @description To calculate questions count
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    */
    public static void getQuestionsCount(List<sObject> newList,Map<Id, sObject> newMap)
    {
        Map<Id,List<Assessment__c>> templateMap= new Map<Id,List<Assessment__c>>();
        for(Assessment__c assessment:(List<Assessment__c>)newList){
            if(templateMap.containsKey(assessment.Template__c)){
                templateMap.get(assessment.Template__c).add(assessment);
            }else{
            	templateMap.put(assessment.Template__c,new List<Assessment__c>{assessment});
            }
        }
        set<Id> templateIds = templateMap.keySet();
        //Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
        string query = 'SELECT COUNT(id) quesCount, Assessment_Template__c'
                     +' FROM Question__c'
                     +' WITH SECURITY_ENFORCED'
                     +' GROUP BY Assessment_Template__c'
                     +' HAVING Assessment_Template__c IN:templateIds';

        //AggregateResult[] templateGroup = safe.doQueryWithBinds(query,bindVariables);
        AggregateResult[] templateGroup = database.query(query);
        for (AggregateResult ar : templateGroup){
            String templateId = (Id)ar.get('Rhythm__Assessment_Template__c');
            for(Assessment__c assessment : templateMap.get(templateId) ){
                assessment.Number_of_Questions__c = (Integer)ar.get('quesCount');
                if(newMap!=null){
                    ((Assessment__c)newMap.get(assessment.Id)).Number_of_Questions__c = (Integer)ar.get('quesCount');
                }
            }
        }
    }
}