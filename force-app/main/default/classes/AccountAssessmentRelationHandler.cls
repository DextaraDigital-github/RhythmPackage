public class AccountAssessmentRelationHandler implements ITriggerHandler{
	public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
         
    }
    
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
        //getQuestionsCount( newList ,newMap);
       
    }
    
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('beforeUpdate----->');
    }
    
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('afterUpdate----->');
        set<Id> acctAssmtSet = new set<Id>();
        Map<Id,AccountAssessmentRelation__c> oldRecordsMap = (Map<Id,AccountAssessmentRelation__c>)oldMap;
        for(AccountAssessmentRelation__c acctAsmt:(List<AccountAssessmentRelation__c>)newList){
            if(acctAsmt.Status__c.equalsIgnoreCase('Need more information')  && oldRecordsMap.get(acctAsmt.Id).Status__c.equalsIgnoreCase('In review') && (!oldRecordsMap.get(acctAsmt.Id).Status__c.equalsIgnoreCase('Need more information'))){
                acctAssmtSet.add(string.valueOf(acctAsmt.get('Id')));
            }
        }
        if(acctAssmtSet.isEmpty() == false){
            AssessmentController.sendEmails(acctAssmtSet,'FUR');
        }
       updateStatusData(newList,newMap,oldMap); 
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
    
    
    public void updateStatusData(List<SObject> newList , Map<Id, sObject> newMap,Map<Id, sObject> oldMap)
    {
     	List<AccountAssessmentRelation__c> acs = (List<AccountAssessmentRelation__c>) newList;
       
        System.debug('newMap'+newMap);
        System.debug('oldMap'+oldMap);
        List<FieldHistoryTracking__c> fieldtrack = new List<FieldHistoryTracking__c>();
        for(Id assmntId: newMap.keySet()){
            if(newMap.get(assmntId).get('Rhythm__Status__c') != oldMap.get(assmntId).get('Rhythm__Status__c'))
            {
                FieldHistoryTracking__c fieldTracker = new FieldHistoryTracking__c();
        		fieldTracker.Object_Name__c='AccountAssessmentRelation__c';
        		fieldTracker.Object_Field_Name__c='Rhythm__Status__c';
        		fieldTracker.Rhythm__Activity_User__c =UserInfo.getName();
        		fieldTracker.Object_Field_Value__c=(String)newMap.get(assmntId).get('Rhythm__Status__c');
        		fieldTracker.Rhythm__object_Record_Id__c=(String)assmntId;
              	fieldtrack.add(fieldTracker);
            }
        }
        INSERT fieldtrack;
        
        System.debug('fieldTracker'+fieldtrack);
    }
}