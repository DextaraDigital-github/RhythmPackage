/* 
* Class Name        : TemplateTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : It is used to perform trigger logic on Assessment_Template__c object.
* Last Modified Date: 
*/
public class TemplateTriggerHandler implements ITriggerHandler{
    public static TriggerFrameworkServiceController serviceController = new TriggerFrameworkServiceController();
    
    /**
    * To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        
    }
    
    /**
    * To execute after insert logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        
    }
    
     /**
    * To execute before update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        
        for(sObject templt:newMap.values()){
            Decimal assessmentCount = (Decimal)templt.get('Number_of_Assessments__c');
            boolean isCriteriaMet = serviceController.checkEntryCriteria(templt,oldMap.get(templt.Id),'Assessment_Template_c');
            if(isCriteriaMet && assessmentCount > 0){
                templt.addError('Template with Assessment Programs cannot be Modified.');
            }
        }
    }

    /**
    * To execute after update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */

    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        
    }

    /**
    * To execute before delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
     
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        for(Assessment_Template__c template:(List<Assessment_Template__c>)oldMap.values()){
            if(string.isNotBlank(template.Status__c) && template.Status__c.equalsIgnoreCase('Active')){
                template.addError('Active Template cannot be deleted.');
            }else if(template.Number_of_Assessments__c != null && template.Number_of_Assessments__c >0){
                template.addError('Template with Assessment Programs cannot be deleted.');
            }
        }
    }
    
    /**
    * To execute after delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        
    }
    
     /**
    * To execute after undelete logic
    * @param oldList This is the new list of records.
      @param oldMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        
    }
}