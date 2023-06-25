public class AccountAssessmentRelationHandler implements ITriggerHandler{
	public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
         
    }
    
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
        getQuestionsCount( newList ,newMap);
       
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
    
    
    public void getQuestionsCount(List<sObject> newList , Map<Id, sObject> newMap)
    {
      /*  String assessmentId=(String)newList[0].get('Rhythm__Assessment__c');        
        String accountId=(String)newList[0].get('Rhythm__Account__c');
        Set<Id> assessmentSet = new Set<Id>();
        Set<Id> templateSet = new Set<Id>();
        Map<Id,Integer> tempQuestMap = new Map<Id,Integer>();
        Map<Id,Id> accAssessMap = new Map<Id,Id>();
        for(AccountAssessmentRelation__c accAssessRel:(List<AccountAssessmentRelation__c>)newList){
           assessmentSet.add(accAssessRel.Assessment__c);
           accAssessMap.put(accAssessRel.Id,accAssessRel.Assessment__c);
        }
        Map<Id,Assessment__c> assessmentMap = new Map<ID, Assessment__c>([SELECT Id,Name,Template__c FROM Assessment__c WHERE Id IN :assessmentSet]); 
        for(Assessment__c assessment : assessmentMap.values()){
            templateSet.add(assessment.Template__c);
            
        }      
        AggregateResult[] templateGroup = [SELECT Assessment_Template__c,count(id) tempCount FROM Question__c WHERE Assessment_Template__c IN :templateSet Group by Assessment_Template__c];//Todo needs to recheck for template versioning
       // newList[0].put('Rhythm__Number_of_Questions__c',questions.size());
        for (AggregateResult ar : templateGroup){
            tempQuestMap.put((Id)ar.get('Rhythm__Assessment_Template__c'),(Integer)ar.get('tempCount'));
        }
        
        for(AccountAssessmentRelation__c accAssessRel:(List<AccountAssessmentRelation__c>)newList){
           accAssessRel.Number_of_Questions__c = tempQuestMap.get(assessmentMap.get(accAssessMap.get(accAssessRel.Id)).Template__c);
        }
        update newList;
        */
        
    }
    
}