public class QuestionTriggerHandler implements ITriggerHandler{
    
    public void beforeInsert(List<sObject> newList) {
        system.debug('beforeInsert----->');
        restrictRecordActions(newList);
        recordAddSequenceNumber(newList);
    }
    
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        system.debug('afterInsert----->');
        getQuestionsCount(newList,new Set<Id>{});
    }
    
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('beforeUpdate----->');
        List<Question__c> newQustnlst=new List<Question__c>();
        List<Question__c> questionLst=new List<Question__c>();
        for(Question__c qustn:(List<Question__c>)newList) {
            Question__c oldQustn=((Question__c)oldMap.get(qustn.Id));
            if((qustn.Question_Sequence_Number__c==oldQustn.Question_Sequence_Number__c) && ( qustn.Question__c!=oldQustn.Question__c 
                                                                                             || (qustn.Assessment_Template__c!=oldQustn.Assessment_Template__c && qustn.Assessment_template__c != null)|| qustn.Section__c!=oldQustn.Section__c 
                                                                                             || qustn.Question_Type__c!=oldQustn.Question_Type__c || qustn.Default_Value__c!=oldQustn.Default_Value__c || qustn.HelpText__c!=oldQustn.HelpText__c 
                                                                                             || qustn.OptionValueSet__c!=oldQustn.OptionValueSet__c || qustn.Requires_File_Upload__c!=oldQustn.Requires_File_Upload__c
                                                                                             || qustn.Required__c!=oldQustn.Required__c)) {
                                                                                                 newQustnlst.add(qustn);
                                                                                             }
            if(qustn.Assessment_Template__c!=oldQustn.Assessment_Template__c) {
                questionLst.add(qustn);
            }
        }
        recordValidations(questionLst);
        restrictRecordActions(newQustnlst);
    }
    
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        system.debug('afterUpdate----->');
        List<Question__c> qustnlst=new List<Question__c>();
        Set<Id> SectnsIds=new Set<Id>();
        for(Question__c qustn:(List<Question__c>)newMap.values()) {
            if(qustn.Section__c!=((Question__c)oldMap.get(qustn.Id)).Section__c && qustn.Section__c!=null) {
                SectnsIds.add(qustn.Section__c);
                SectnsIds.add(((Question__c)oldMap.get(qustn.Id)).Section__c);
            }
        }
        if(qustnlst.size()>0 || SectnsIds.size()>0) {
            getQuestionsCount(qustnlst,SectnsIds);
        }
    }
    
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('beforeDelete----->');
        restrictRecordActions(oldList);
        recordSequenceNumber(oldList);
    }
    
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        system.debug('afterDelete----->');
        getQuestionsCount(oldList,new Set<Id>{});
    }
    
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        system.debug('afterUnDelete----->');
    }
    
    
    public void getQuestionsCount(List<Question__c> Qustlst, Set<Id> SectionsIds)
    {
        try {
            Set<Id> SecIds=new Set<Id>();
            List<Section__c> updateSectionslst=new List<Section__c>();
            map<Id,Integer> sectionwithQuestionscountMap=new map<Id,Integer>();
            if(Qustlst.size()>0) {
                for(Question__c Qustn:Qustlst){
                    SecIds.add(Qustn.section__c);
                }
            }
            else {
                SecIds=SectionsIds;
            }
            List<Section__c> Seclst=[SELECT Id, No_of_Questions__c, (SELECT Id from Questions__r) FROM Section__c where Id IN:SecIds];
            for(Section__c Secs:Seclst) {
                Integer Qustncount=0;
                for(Question__c Qustn:Secs.Questions__r) {
                    Qustncount=Qustncount+1;
                }
                sectionwithQuestionscountMap.put(Secs.Id,Qustncount);
            }
            for(Section__c Secs:Seclst) {
                Secs.No_of_Questions__c=sectionwithQuestionscountMap.get(Secs.Id);
                updateSectionslst.add(Secs);
            }
            if(updateSectionslst.size()>0) {
                Database.update(updateSectionslst);
            }
        }
        Catch(Exception e){
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void restrictRecordActions(List<Question__c> qusLst) {
        try{
            Set<Id> templateIds=new Set<Id>();
            Map<Id,String> templateStatusMap=new Map<Id,String>();
            for(Question__c qus:qusLst)  {
                templateIds.add(qus.Assessment_template__c);
            }
            if(templateIds.size() >0){
                List<Assessment_template__c> templateList=[Select Id,status__c from Assessment_template__c where Id IN:templateIds];
                for(Assessment_template__c template:templateList) {
                    templateStatusMap.put(template.Id,template.Status__c);
                }
                for(Question__c qus:qusLst) {
                    if(templateStatusMap.get(qus.Assessment_template__c)!='New') {
                        qus.addError('You can not perform any operations on this record because of Template Status');
                    } 
                }
            }
        }
        Catch(Exception e){
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void recordValidations(List<Question__c> questionLst) {
        try {
            for(Question__c question:questionLst) {
                question.addError('You cannot change Assessment Template');
            }
        }
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void recordAddSequenceNumber(List<Question__c> qusLst) {
        Set<Id> templateIds = new Set<Id>();
        try {
            for(Question__c question: qusLst) {
                templateIds.add(question.Assessment_Template__c);
            }
            List<Question__c> questionList=[Select Id,Question_Sequence_Number__c from Question__c where Assessment_Template__c IN:templateIds order by Question_Sequence_Number__c ASC];
            Integer sequenceNumber = 0;
            for(Question__c question: questionList) {
                if(question.Question_Sequence_Number__c != null) {
                    if(sequenceNumber < question.Question_Sequence_Number__c) {
                        sequenceNumber = (Integer)question.Question_Sequence_Number__c;
                    }
                }
            }
            for(Question__c ques: qusLst) {
                sequenceNumber = sequenceNumber+1;
                ques.Question_Sequence_Number__c = sequenceNumber;
            } 
        }
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
    public void recordSequenceNumber(List<Question__c> quesLst) {
        Set<Id> templateIds = new Set<Id>();
        List<Question__c> updateQuestionList=new List<Question__c>();
        try {
            for(Question__c question: quesLst) {
                templateIds.add(question.Assessment_Template__c);
            }
            List<Question__c> questionList=[Select Id,Question_Sequence_Number__c from Question__c where Assessment_Template__c IN:templateIds AND Id NOT IN: quesLst order by Question_Sequence_Number__c ASC];
            Integer sequenceNumber = 0;
            for(Question__c question: questionList) {
                sequenceNumber = sequenceNumber+1;
                question.Question_Sequence_Number__c = sequenceNumber;
                updateQuestionList.add(question);
                
            }
            if(updateQuestionList.size() > 0) {
                update updateQuestionList;
            }
        }
        Catch(Exception e) {
            system.debug('Exception e==='+e.getMessage());
        }
    }
}