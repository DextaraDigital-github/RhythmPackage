public class AssessmentTriggerHandler implements ITriggerHandler{
     
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
    }
     
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
    }
     
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('inThebeforeUpdate-----');
        Map<Id,Assessment__c> assmtMap = new Map<Id,Assessment__c>([SELECT Id,(SELECT Id FROM AccountAssessmentRelation__r) FROM Assessment__c WHERE ID IN:newMap.keySet()]);
        for(Assessment__c assmt:(List<Assessment__c>)newMap.values()){
            if(assmtMap.get(assmt.Id).AccountAssessmentRelation__r.size() > 0){
                assmt.addError('Assessment program in use, cannot be edited.');
            }
        }
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