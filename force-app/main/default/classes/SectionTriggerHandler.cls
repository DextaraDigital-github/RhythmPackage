/* 
* Class Name        : SectionTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : It is used to perform the trigger logic on Section__c object.
* Last Modified Date: 
*/
public class SectionTriggerHandler implements ITriggerHandler {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work
    
     /**
    * To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        restrictRecordActions(newList);
        recordAddSequenceNumber(newList);
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
        List<Section__c> newSeclst=new List<Section__c>();
        List<Section__c> sectionLst=new List<Section__c>();
        for(Section__c sect:(List<Section__c>)newList) {
            Section__c oldSec=((Section__c)oldMap.get(sect.Id));
            if((sect.Section_Sequence_Number__c==oldSec.Section_Sequence_Number__c) &&  (sect.Name!=oldSec.Name ||(sect.Assessment_template__c!=oldSec.Assessment_template__c && sect.Assessment_template__c != null))) {
                newSeclst.add(sect);
            }
            if(sect.Assessment_template__c!=oldSec.Assessment_template__c) {
                sectionLst.add(sect);
            }
        }
        recordValidations(sectionLst);
        restrictRecordActions(newSeclst);
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
        restrictRecordActions(oldList); 
        recordSequenceNumber(oldList);
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
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
    }
    
    /**
    * To perform validation based on the status of template.
    * @param secLst This is the new list of section records.
    */
    
    public void restrictRecordActions(List<Section__c> secLst) {
        try {
            Set<Id> templateIds=new Set<Id>();
            Map<Id,String> templateStatusMap=new Map<Id,String>();
            for(Section__c sec:secLst) {
                templateIds.add(sec.Assessment_template__c);
            }
            if(templateIds.isEmpty() == false) {
                string tempQuery = 'SELECT Id,status__c'
                                 +' FROM Assessment_template__c'
                                 +' WHERE Id IN:templateIds';
                Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
                List<Assessment_template__c> templateList = safe.doQueryWithBinds(tempQuery,bindVariables);
                if(templateList.isEmpty() == false){
                    for(Assessment_template__c template:templateList) {
                        templateStatusMap.put(template.Id,template.Status__c);
                    }
                    for(Section__c sec:secLst) {
                        if(templateStatusMap.get(sec.Assessment_template__c) != 'New') {
                            sec.addError('You can not perform any operations on this record because of Template Status');
                        } 
                    }
                }
            }
        }
        catch(exception e) {
            
        }
    }
     /**
    * To perform validations on assessment template
    * @param secLst This is the new list of section records.
    */
    public void recordValidations(List<Section__c> secLst) {
        try {
            for(Section__c sec:secLst) {
                sec.addError('You cannot change Assessment Template');
            }
        }
        catch(exception e) {
            
        }
    }
     /**
    * To add the sequence number.
    * @param secLst This is the new list of section records.
    */
    public void recordAddSequenceNumber(List<Section__c> secLst) {
        Set<Id> templateIds = new Set<Id>();
        try {
            for(Section__c sec: secLst) {
                if(string.isNotBlank(sec.Assessment_Template__c)){
                    templateIds.add(sec.Assessment_Template__c);
                }
            }
            if(templateIds.isEmpty() == false){
                string tempQuery = 'SELECT Id,Section_Sequence_Number__c'
                                + ' FROM Section__c'
                                + ' WHERE Assessment_Template__c IN:templateIds'
                                + ' ORDER BY Section_Sequence_Number__c ASC';
                Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
                List<Section__c> sectionList = safe.doQueryWithBinds(tempQuery,bindVariables);
                integer sequenceNumber = 0;
                if(sectionList.isEmpty() == false){
                    for(Section__c section: sectionList) {
                        if(section.Section_Sequence_Number__c != null) {
                            if(sequenceNumber < section.Section_Sequence_Number__c) {
                                sequenceNumber = (Integer)section.Section_Sequence_Number__c;
                            }
                        }
                    }
                    for(Section__c sec: secLst) {
                        sequenceNumber = sequenceNumber+1;
                        sec.Section_Sequence_Number__c = sequenceNumber;
                    }
                }
            }
        }catch(exception e) {
            
        }
    }
     /**
    * To update sequence number for section object
    * @param secLst This is the new list of section records.
    */
    public void recordSequenceNumber(List<Section__c> secLst) {
        Set<Id> templateIds = new Set<Id>();
        List<Section__c> updateSectionList=new List<Section__c>();
        try {
            for(Section__c sec: secLst) {
                if(string.isNotBlank(sec.Assessment_Template__c)){
                    templateIds.add(sec.Assessment_Template__c);
                }
            }
            if(templateIds.isEmpty() == false){
                string secQuey = 'SELECT Id,Section_Sequence_Number__c'
                               + ' FROM Section__c'
                               + ' WHERE Assessment_Template__c IN:templateIds'
                               + ' AND Id NOT IN :secLst'
                               + ' ORDER BY Section_Sequence_Number__c ASC';
                Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds,'secLst' => secLst};
                List<Section__c> sectionList = safe.doQueryWithBinds(secQuey,bindVariables);
                Integer sequenceNumber = 0;
                if(sectionList.isEmpty() == false){
                    for(Section__c section: sectionList) {
                        sequenceNumber = sequenceNumber+1;
                        section.Section_Sequence_Number__c = sequenceNumber;
                        updateSectionList.add(section);
                        
                    }
                    if (sp == null){
                         sp = Database.setSavepoint();
                    }
                    if(updateSectionList.size() > 0) {
                        Database.SaveResult[] saveResult = safe.doUpdate(updateSectionList);
                        List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                        if(errorList.size()>0){
                            Database.rollback(sp);
                            throw new SecurityControllerException(String.join( errorList, ', ' ));
                        }
                    }
                }
            }
        }catch(exception e) {
            
        }
    }
/**
  * It is used to throw the exception.
*/
    public class SecurityControllerException extends Exception{
        
    }
}