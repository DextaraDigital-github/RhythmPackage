public class AssessmentTriggerHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();
    public static TriggerFrameworkServiceController serviceController = new TriggerFrameworkServiceController();
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
        getQuestionsCount(newList,null);
    }
     
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
    }
     
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
       system.debug('inThebeforeUpdate-----');
       
        for(sObject assmt:newMap.values()){
            Decimal supplierCount = (Decimal)assmt.get('Number_of_Invited_Suppliers__c');
            boolean isCriteriaMet = serviceController.checkEntryCriteria(assmt,oldMap.get(assmt.Id),'Assessment_c');
            if(isCriteriaMet && supplierCount > 0){
                assmt.addError('Assessment program in use, cannot be edited.');
            }
        }
        getQuestionsCount(newList, newMap);
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
    public static void getQuestionsCount(List<sObject> newList,Map<Id, sObject> newMap)
    {
        
        Map<Id,List<Assessment__c>> templateMap= new Map<Id,List<Assessment__c>>();
        for(Assessment__c assessment:(List<Assessment__c>)newList){
            if(templateMap.containsKey(assessment.Template__c)){
                templateMap.get(assessment.Template__c).add(assessment);
            }else{
            	templateMap.put(assessment.Template__c,new List<Assessment__c>{assessment});
            }
        }
        set<Id> templateIds = templateMap.keySet();
        Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
        string query = 'SELECT COUNT(id) quesCount, Assessment_Template__c'
                     +' FROM Question__c'
                     +' GROUP BY Assessment_Template__c'
                     +' HAVING Assessment_Template__c IN:templateIds';

        AggregateResult[] templateGroup = safe.doQueryWithBinds(query,bindVariables);
        for (AggregateResult ar : templateGroup){
            String templateId = (Id)ar.get('Rhythm__Assessment_Template__c');
            for(Assessment__c assessment : templateMap.get(templateId) ){
                assessment.Number_of_Questions__c = (Integer)ar.get('quesCount');
                if(newMap!=null){
                    ((Assessment__c)newMap.get(assessment.Id)).Number_of_Questions__c = (Integer)ar.get('quesCount');
                }
            }
        }
        System.debug('newMap==>'+newMap);
    }
}