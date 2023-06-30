public class SectionTriggerHandler implements ITriggerHandler {
    
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
        restrictRecordActions(newList);
        recordAddSequenceNumber(newList);
    }
    
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
        
    }
    
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('beforeUpdate----->');
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
    
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('afterUpdate----->');
    }
    
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('beforeDelete----->');
        restrictRecordActions(oldList); 
        recordSequenceNumber(oldList);
    }
    
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('afterDelete----->');
    }
    
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        system.debug('afterUnDelete----->');
    }
    
    
    public void restrictRecordActions(List<Section__c> secLst) {
        try {
            Set<Id> templateIds=new Set<Id>();
            Map<Id,String> templateStatusMap=new Map<Id,String>();
            for(Section__c sec:secLst) {
                templateIds.add(sec.Assessment_template__c);
            }
            if(templateIds.size() >0) {
                List<Assessment_template__c> templateList=[Select Id,status__c from Assessment_template__c where Id IN:templateIds];
                for(Assessment_template__c template:templateList) {
                    templateStatusMap.put(template.Id,template.Status__c);
                }
                for(Section__c sec:secLst) {
                    if(templateStatusMap.get(sec.Assessment_template__c)!='New') {
                        sec.addError('You can not perform any operations on this record because of Template Status');
                    } 
                }
            }
        }
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void recordValidations(List<Section__c> secLst) {
        try {
            for(Section__c sec:secLst) {
                sec.addError('You cannot change Assessment Template');
            }
        }
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void recordAddSequenceNumber(List<Section__c> secLst) {
        Set<Id> templateIds = new Set<Id>();
        try {
            for(Section__c sec: secLst) {
                templateIds.add(sec.Assessment_Template__c);
            }
            List<Section__c> sectionList=[Select Id,Section_Sequence_Number__c from Section__c where Assessment_Template__c IN:templateIds order by Section_Sequence_Number__c ASC];
            Integer sequenceNumber = 0;
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
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void recordSequenceNumber(List<Section__c> secLst) {
        Set<Id> templateIds = new Set<Id>();
        List<Section__c> updateSectionList=new List<Section__c>();
        try {
            for(Section__c sec: secLst) {
                templateIds.add(sec.Assessment_Template__c);
            }
            List<Section__c> sectionList=[Select Id,Section_Sequence_Number__c from Section__c where Assessment_Template__c IN:templateIds and Id NOT IN :secLst order by Section_Sequence_Number__c ASC];
            Integer sequenceNumber = 0;
            for(Section__c section: sectionList) {
                sequenceNumber = sequenceNumber+1;
                section.Section_Sequence_Number__c = sequenceNumber;
                updateSectionList.add(section);
                
            }
            if(updateSectionList.size() > 0) {
                update updateSectionList;
            }
        }
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
}