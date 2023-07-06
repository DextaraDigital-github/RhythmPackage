public class TemplateTriggerHandler implements ITriggerHandler{
    public static TriggerFrameworkServiceController serviceController = new TriggerFrameworkServiceController();
    public void beforeInsert(List<sObject> newList) {
        
    }
     
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        
    }
     
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        
        for(sObject templt:newMap.values()){
            Decimal assessmentCount = (Decimal)templt.get('Number_of_Assessments__c');
            boolean isCriteriaMet = serviceController.checkEntryCriteria(templt,oldMap.get(templt.Id),'Assessment_Template_c');
            if(isCriteriaMet && assessmentCount > 0){
                templt.addError('Template with Assessment Programs cannot be Modified.');
            }
        }
    }

    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        
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
        
    }
     
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        
    }
}