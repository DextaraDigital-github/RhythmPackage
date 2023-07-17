/**
* Class Name       : QuestionTriggerHandler
* Developer         :       
* Created Date      :
* @description      : 
* Last Modified Date:
*/
public with sharing class QuestionTriggerHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work

    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        restrictRecordActions(newList);
        recordAddSequenceNumber(newList);
    }
     /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
        getQuestionsCount(newList,new Set<Id>{});
    }
     /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
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
    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
        List<Question__c> qustnlst=new List<Question__c>();
        Set<Id> sectnsIds=new Set<Id>();
        for(Question__c qustn:(List<Question__c>)newMap.values()) {
            if(qustn.Section__c!=((Question__c)oldMap.get(qustn.Id)).Section__c && qustn.Section__c!=null) {
                sectnsIds.add(qustn.Section__c);
                sectnsIds.add(((Question__c)oldMap.get(qustn.Id)).Section__c);
            }
        }
        if(qustnlst.size()>0 || sectnsIds.size()>0) {
            getQuestionsCount(qustnlst,sectnsIds);
        }
    }
    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        restrictRecordActions(oldList);
        recordSequenceNumber(oldList);
    }
    /**
    * @description To execute after delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
        getQuestionsCount(oldList,new Set<Id>{});
    }
    /**
    * @description To execute after undelete logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
        return;
    }
    
    /**
    * @description To calculate questions count
    * @param qustlst This is the new list of question records.
    * @param sectionsIds This is the set of section id.
    */
    public void getQuestionsCount(List<Question__c> qustlst, Set<Id> sectionsIds)
    {
        try {
            Set<Id> secIds=new Set<Id>();
            List<Section__c> updateSectionslst = new List<Section__c>();
            Map<Id,Integer> sectionwithQuestionscountMap=new Map<Id,Integer>();
            List<String> errorList =  new List<String>();
            if(qustlst.isEmpty() == false) {
                for(Question__c qustn:qustlst){
                    secIds.add(qustn.section__c);
                }
            }
            else {
                secIds=sectionsIds;
            }
            if(secIds.isEmpty() == false){
                string secQuery = 'SELECT Id, No_of_Questions__c,'
                                +'(SELECT Id from Questions__r)'
                                +' FROM Section__c'
                                +' WHERE Id IN:secIds';
                Map<String, Object> bindVariables = new Map<String, Object>{'secIds' => secIds};            
                List<Section__c> seclst= safe.doQueryWithBinds(secQuery,bindVariables);
                for(Section__c secs:seclst) {
                    Integer qustnCount=0;
                    for(Question__c qustn:secs.Questions__r) {
                        qustnCount=qustnCount+1;
                    }
                    sectionwithQuestionscountMap.put(secs.Id,qustnCount);
                }
                for(Section__c secs:seclst) {
                    secs.No_of_Questions__c=sectionwithQuestionscountMap.get(secs.Id);
                    updateSectionslst.add(secs);
                }
                if (sp == null){ 
                    sp = Database.setSavepoint();
                }
                if(updateSectionslst.isEmpty() == false) {
                    Database.SaveResult[] saveResult = safe.doUpdate(updateSectionslst);
                    errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                }
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
        }catch(exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    /**
    * @description To perform validation based on the status of template.
    * @param qusLst This is the new list of question records.
    */
    public void restrictRecordActions(List<Question__c> qusLst) {
        try{
            Set<Id> templateIds=new Set<Id>();
            Map<Id,String> templateStatusMap=new Map<Id,String>();
            for(Question__c qus:qusLst)  {
                templateIds.add(qus.Assessment_template__c);
            }
            if(templateIds.isEmpty() == false){
                string tempQuery = 'SELECT Id,status__c'
                                 + ' FROM Assessment_template__c'
                                 + ' WHERE Id IN:templateIds';
                
                Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
                List<Assessment_template__c> templateList = safe.doQueryWithBinds(tempQuery,bindVariables);
                //if(templateList.isEmpty() == false){
                    for(Assessment_template__c template:templateList) {
                        templateStatusMap.put(template.Id,template.Status__c);
                    }
                    for(Question__c qus:qusLst) {
                        if(templateStatusMap.get(qus.Assessment_template__c)!='New') {
                            qus.addError('Modifications cannot be done to a Question linked to Active/Inactive Assessment Template');
                        } 
                    }
                //}
            }
        }
        catch(exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    /**
    * @description To perform validations on assessment template
    * @param questionLst This is the new list of question records.
    */
    public void recordValidations(List<Question__c> questionLst) {
        try{
            for(Question__c question:questionLst) {
                question.addError('Assessment Template linked to the Section cannot be changed');
            }
        }catch(exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /**
    * @description To add the sequence number.
    * @param qusLst This is the new list of question records.
    */
    public void recordAddSequenceNumber(List<Question__c> qusLst) {
        Set<Id> templateIds = new Set<Id>();
        try {
            for(Question__c question: qusLst) {
                templateIds.add(question.Assessment_Template__c);
            }
            if(templateIds.isEmpty() == false){
                string queQuery = 'SELECT Id,Question_Sequence_Number__c'
                                + ' FROM Question__c'
                                + ' WHERE Assessment_Template__c IN:templateIds'
                                + ' ORDER BY Question_Sequence_Number__c ASC';
                Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
                List<Question__c> questionList = safe.doQueryWithBinds(queQuery,bindVariables);
                //if(questionList.isEmpty() == false){
                    integer sequenceNumber = 0;
                    for(Question__c question: questionList) {
                        if(question.Question_Sequence_Number__c != null && 
                            sequenceNumber < question.Question_Sequence_Number__c) {
                            sequenceNumber = (Integer)question.Question_Sequence_Number__c;                            
                        }
                    }
                    for(Question__c ques: qusLst) {
                        sequenceNumber = sequenceNumber+1;
                        ques.Question_Sequence_Number__c = sequenceNumber;
                    }
                //}
            }
        }
        catch(exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /**
    * @description To update sequence number for question object
    * @param quesLst This is the new list of question records.
    */
    public void recordSequenceNumber(List<Question__c> quesLst) {
        Set<Id> templateIds = new Set<Id>();
        List<Question__c> updateQuestionList=new List<Question__c>();
        List<String> errorList = new List<String>();
        try {
            for(Question__c question: quesLst) {
                templateIds.add(question.Assessment_Template__c);
            }
            if(templateIds.isEmpty() == false){
                string queQuery = 'SELECT Id,Question_Sequence_Number__c'
                                + ' FROM Question__c'
                                + ' WHERE Assessment_Template__c IN:templateIds'
                                + ' AND Id NOT IN: quesLst'
                                + ' ORDER BY Question_Sequence_Number__c ASC';
                Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds,'quesLst' => quesLst};                               
                List<Question__c> questionList = safe.doQueryWithBinds(queQuery,bindVariables);
                //if(questionList.isEmpty() == false){
                    integer sequenceNumber = 0;
                    for(Question__c question: questionList) {
                        sequenceNumber = sequenceNumber+1;
                        question.Question_Sequence_Number__c = sequenceNumber;
                        updateQuestionList.add(question);
                    }
                    if (sp == null){ 
                        sp = Database.setSavepoint();
                    }
                    if(updateQuestionList.isEmpty() == false) {
                        Database.SaveResult[] saveResult = safe.doUpdate(updateQuestionList);
                        errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                    }
                    if(errorList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( errorList, ', ' ));
                    }
                //}
            }
        }
        catch(exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
/**
  * @description It is used to throw the exception.
*/
    public class SecurityControllerException extends Exception{
        
    }
}