public class AssessmentTriggerHandler implements ITriggerHandler{
     
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
    }
     
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
    }
     
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('inThebeforeUpdate-----');
        Map<Id,Assessment__c> oldMapAssmnts = (Map<Id,Assessment__c>)oldMap;
        Map<Id,Assessment__c> assmtMap = new Map<Id,Assessment__c>([SELECT Id,(SELECT Id FROM AccountAssessmentRelation__r) FROM Assessment__c WHERE ID IN:newMap.keySet()]);
        string triggerObjId = Trigger_Configuration__mdt.getInstance('Assessment_c').Id;
        List<string> fieldsList = getUpdatableFields(triggerObjId);
        for(Assessment__c assmt:(List<Assessment__c>)newMap.values()){
            if(fieldsList.isEmpty() == false){
                for(string fName:fieldsList){
                    if((assmt.get(fName) != oldMapAssmnts.get(assmt.Id).get(fName)) && (assmtMap.get(assmt.Id).AccountAssessmentRelation__r.size() > 0)){
                        assmt.addError('Assessment program in use, cannot be edited.');
                    }
                }
            }
        }
    }

    public List<string> getUpdatableFields(string triggerObjId){
        List<string> fieldsList = new List<string>();
        for(Trigger_Field_Change_Handler__mdt tfh:[select id, MasterLabel from Trigger_Field_Change_Handler__mdt where Object_Name__c =:triggerObjId]){
            fieldsList.add(tfh.MasterLabel);
        }
        return fieldsList;
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