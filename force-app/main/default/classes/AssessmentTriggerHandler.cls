public class AssessmentTriggerHandler implements ITriggerHandler{
     
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
    }
     
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
    }
     
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('beforeUpdate----->');
    }
     
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('afterUpdate----->');
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
}