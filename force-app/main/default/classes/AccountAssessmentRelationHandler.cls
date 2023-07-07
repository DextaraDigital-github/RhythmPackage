/* 
* Class Name        : AccountAssessmentRelationHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description       : AccountAssessmentRelationHandler class is used to perform the trigger logic
* Last Modified Date: 
*/

public with sharing class AccountAssessmentRelationHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();
    private static Savepoint sp;


     /**
    * @description To execute before insert logic
    * @param newList This is the list of AccountAssessments.
    * @return  
    */
	public void beforeInsert(List<sObject> newList) {
    }

     /**
    * To execute after insert logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
    }

    /**
    * To execute before update logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
      @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
    }

    /**
    * To execute after update logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
      @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        set<Id> acctAssmtSet = new set<Id>();
        Map<Id,AccountAssessmentRelation__c> oldRecordsMap = (Map<Id,AccountAssessmentRelation__c>)oldMap;
        for(AccountAssessmentRelation__c acctAsmt:(List<AccountAssessmentRelation__c>)newList){
            if(acctAsmt.Status__c.equalsIgnoreCase('Need more information')  && oldRecordsMap.get(acctAsmt.Id).Status__c.equalsIgnoreCase('In review')){
                acctAssmtSet.add(string.valueOf(acctAsmt.get('Id')));
            }
        }
        if(acctAssmtSet.isEmpty() == false){
            AssessmentController.sendEmails(acctAssmtSet,'FUR');
        }
       updateStatusData(newList,newMap,oldMap); 
    }
    
    /**
    * To execute before delete logic
    * @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
    }

     /**
    * To execute after delete logic
    * @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
    }

     /**
    * To execute after undelete logic
    * @param oldList This is the new list of AccountAssessments.
      @param oldMap This is the new map of AccountAssessments.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
    }


    /**
    * To execute after update logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
      @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */

    public void updateStatusData(List<SObject> newList , Map<Id, sObject> newMap,Map<Id, sObject> oldMap)
    {
     	List<AccountAssessmentRelation__c> acs = (List<AccountAssessmentRelation__c>) newList;
        List<FieldHistoryTracking__c> fieldtrack = new List<FieldHistoryTracking__c>();
        for(Id assmntId: newMap.keySet()){
            if(newMap.get(assmntId).get('Rhythm__Status__c') != oldMap.get(assmntId).get('Rhythm__Status__c'))
            {
                FieldHistoryTracking__c fieldTracker = new FieldHistoryTracking__c();
        		fieldTracker.Object_Name__c='AccountAssessmentRelation__c';
        		fieldTracker.Object_Field_Name__c='Rhythm__Status__c';
        		fieldTracker.Rhythm__Activity_User__c =UserInfo.getName();
        		fieldTracker.Object_Field_Value__c=(String)newMap.get(assmntId).get('Rhythm__Status__c');
        		fieldTracker.Rhythm__object_Record_Id__c=(String)assmntId;
              	fieldtrack.add(fieldTracker);
            }
        }
        if(sp == null){
            sp = Database.setSavepoint();
        }
        if(fieldtrack.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(fieldtrack);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
        }
    }

     /**
    * To execute after delete logic
        custom exception class
    */
    public class SecurityControllerException extends Exception{
    }
}