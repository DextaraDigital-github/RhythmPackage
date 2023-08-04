/**
* Class Name        : ActionItemHandler
* Developer         : Reethika Velpula           
* Created Date      : 
* @description       : ActionItemHandler class is used to perform the trigger logic for Action Object.
* Last Modified Date: 
*/

public with sharing class ActionItemHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();
    private static Savepoint sp;
    /**
    * @description To execute before insert logic
    * @param newList This is the list of AccountAssessments.  
    */
    public void beforeInsert(List<sObject> newList) {
        List<Id> userIds=new List<Id>();
        for(Action__c aar:(List<Action__c>)newList) {
             userIds.add(aar.Assigned_To__c);
        }
        List<Messaging.SendEmailResult> sendmails=SendEmail.send('Action Item','Action Item has Created',userIds);
        return;
    }

    /**
    * @description To execute after insert logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
      return;
    }

    /**
    * @description To execute before update logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
      @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
      Map<Id,Action__c> oldRecordsMap = (Map<Id,Action__c>)oldMap;
      for(Action__c aar:(List<Action__c>)newList) {
            if(aar.Due_Date__c != oldRecordsMap.get(aar.Id).get('Rhythm__Due_Date__c') && (aar.Due_Date__c > Date.Today()) && (oldRecordsMap.get(aar.Id).get('Rhythm__Status__c') != 'Closed')) {
                aar.Status__c='Open';
            }
        }
       List<Id> userIds=new List<Id>();
         for(Action__c aar:(List<Action__c>)newList) {
             userIds.add(aar.Assigned_To__c);
        }
        List<Messaging.SendEmailResult> sendmails=SendEmail.send('Action Item','Action Item has Updated',userIds);
      }

    /**
    * @description To execute after update logic
    * @param newList This is the list of AccountAssessments.
      @param newMap This is the map of AccountAssessments.
      @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        return;
    }
    
    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        List<Id> userIds=new List<Id>();
        for(Action__c aar:(List<Action__c>)oldList) {
            userIds.add(aar.Assigned_To__c);
        }
        List<Messaging.SendEmailResult> sendmails=SendEmail.send('Action Item','Action Item has Updated',userIds);
    }

     /**
    * @description To execute after delete logic
    * @param oldList This is the old list of AccountAssessments.
      @param oldMap This is the old map of AccountAssessments.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
      return;
    }

     /**
    * @description To execute after undelete logic
    * @param newList This is the new list of AccountAssessments.
      @param newMap This is the new map of AccountAssessments.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
      return;
    }
     /**
    * @description To execute after delete logic
        custom exception class
    */
    public class SecurityControllerException extends Exception{
    }
}