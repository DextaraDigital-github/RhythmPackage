/** 
* Class Name        : DisplayPDFController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description        : Trigger Interface.
* Last Modified Date: 
*/
public interface ITriggerHandler{

    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    void beforeInsert(List<sObject> newList);

     /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */ 
    void afterInsert(List<sObject> newList, Map<Id, sObject> newMap);

    /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap);

    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap);
    
    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap);
    
    /**
    * @description To execute after delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap);
    
    /**
    * @description To execute after undelete logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap);
}