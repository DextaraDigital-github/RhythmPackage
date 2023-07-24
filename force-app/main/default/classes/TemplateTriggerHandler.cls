/** 
* Class Name        : TemplateTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description       : It is used to perform trigger logic on Assessment_Template__c object.
* Last Modified Date: 
*/
public with sharing class TemplateTriggerHandler implements ITriggerHandler{
    public static TriggerFrameworkServiceController serviceController = new TriggerFrameworkServiceController();
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        return;
    }
    
    /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        return;
    }
    
     /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        
        
        List<Assessment_Template__c> tmplList=new List<Assessment_Template__c>();
        for(sObject templt:newMap.values()){
            Decimal assessmentCount = (Decimal)templt.get('Number_of_Assessments__c');
            boolean isCriteriaMet = serviceController.checkEntryCriteria(templt,oldMap.get(templt.Id),'Assessment_Template_c');
            if(isCriteriaMet && assessmentCount > 0){
                templt.addError('Details of the Active/Inactive Template cannot be modified');
            }
            Assessment_Template__c oldtemplate=((Assessment_Template__c)oldMap.get(templt.Id));
            Assessment_Template__c newtemplate=((Assessment_Template__c)templt);
            if(newtemplate.Status__c != oldtemplate.Status__c && newtemplate.Status__c !='New') {
                tmplList.add(newtemplate);
            }
        }
        recordValidations(tmplList);
    }

    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */

    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        return;
    }

    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
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
    * @description To execute after delete logic
    * @param oldList This is the old list of records.
    * @param oldMap This is the old map of records.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        return;
    }
    
     /**
    * @description To execute after undelete logic
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
       return; 
    }
    /**
    * @description
    * @param templateList
    */
     public static void recordValidations(List<Assessment_Template__c> templateList) {
        Set<Id> templateIds=new Set<Id>();
        Map<Id,Integer> templateQuestionMap=new Map<Id,Integer>();
        for(Assessment_Template__c template:templateList) {
            templateIds.add(template.Id);
        }
        string query = 'SELECT Id,(SELECT Id from Questions__r where Section__c != null)'
                     +' FROM Assessment_Template__c'
                     +' WHERE Id IN: templateIds';
        Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
        List<Assessment_Template__c> tmplList = safe.doQueryWithBinds(query,bindVariables);
        for(Assessment_Template__c template:tmplList) {
            templateQuestionMap.put(template.Id,template.Questions__r.size());
        } 
        for(Assessment_Template__c template:templateList) {
            if(templateQuestionMap.get(template.Id) == 0) {
                template.addError('Template should have atleast 1 question to change the status');
            }       
        }
    }
    
}