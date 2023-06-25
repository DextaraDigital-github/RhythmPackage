public class TemplateTriggerHandler implements ITriggerHandler{
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
    }
     
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
    }
     
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        Map<Id,Assessment_Template__c> templatesMap = new Map<Id,Assessment_Template__c>([SELECT Id,(SELECT Id FROM Assessments__r) FROM Assessment_Template__c WHERE ID IN:newMap.keySet()]);
        for(Assessment_Template__c template:(List<Assessment_Template__c>)newMap.values()){
            if(templatesMap.GET(template.Id).Assessments__r.size()>0){
                template.addError('Template with Assessment Programs cannot be Modified.');
            }
        }
    }
     
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('afterUpdate----->');
    }
     
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        for(Assessment_Template__c template:(List<Assessment_Template__c>)oldMap.values()){
            if(string.isNotBlank(template.Status__c) && template.Status__c.equalsIgnoreCase('Active')){
                template.addError('Active Template cannot be deleted.');
            }else if(template.Number_of_Assessments__c != null && template.Number_of_Assessments__c >0){
                template.addError('Template with Assessment Programs cannot be deleted.');
            }
        }
    }
     
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('afterDelete----->');
    }
     
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        system.debug('afterUnDelete----->');
    }
}