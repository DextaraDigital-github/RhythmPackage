/** 
* Class Name        : UserTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description       : It is used to perform trigger logic on User object.
* Last Modified Date: 
*/
public with sharing class UserTriggerHandler implements ITriggerHandler{
    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        updateContactOnUser(newList);
    }
    
    /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        return;
    }
    
     /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        return;
    }

    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */

    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        return;
    }

    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */
     
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
       return;
    }
    
    /**
    * @description To execute after delete logic
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        return;
    }
    
     /**
    * @description To execute after undelete logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
       return; 
    }

    public static void updateContactOnUser(List<sObject> newList){
        set<string> emailSet =new set<string>();
        Map<String,Contact> emailConMap = new Map<String,Contact>();
        for(User usr:(List<User>)newList){
            emailSet.add(usr.Email);
        }
        system.debug('emailSet------>'+emailSet);
        if(emailSet.isEmpty() == false){
            for(Contact con:[SELECT Id,Email FROM Contact WHERE Email IN:emailSet WITH SECURITY_ENFORCED]){
                emailConMap.put(con.Email,con);
            }
            system.debug('emailConMap------>'+emailConMap);
            for(User usr:(List<User>)newList){
                usr.ContactId = emailConMap.get(usr.Email).Id;
            }
        }
    }
}