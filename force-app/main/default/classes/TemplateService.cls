/** 
* Class Name        : TemplateService
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : TemplateService contains the processing logic related to Template Object.
* Last Modified Date: 
*/

public with sharing class TemplateService{
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp; // To rollback

    static ResponseQuestionMapSelector selector = ResponseQuestionMapSelector.getInstance();
    static SectionSelector secSelector = SectionSelector.getInstance();
    static QuestionAttributeResponseSelector attrSelector =  QuestionAttributeResponseSelector.getInstance();
    static QuestionSelector queSelector =  QuestionSelector.getInstance();
    static TemplateSelector tempSelector = TemplateSelector.getInstance();

    private static TemplateService service = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern 
    * @return 
    */
    public static TemplateService getInstance(){
           if(service == null){
            service = new TemplateService();
            }
        return service;
    }

    /**
    * @description To Clone the Template and its related records.
    * @param templateId This is a record id of an Template.
    * @param SObject template data to create new record.
    * @return 
    */
    public TemplateController.ResultWrapper cloneTemplate(string templateId,SObject templateRecord){
        TemplateController.ResultWrapper resWrap = new TemplateController.ResultWrapper();
        try{
            string templateName = string.valueOf(templateRecord.get('Name'));
            templateName = '\'%'+String.escapeSingleQuotes(templateName)+'%\'';
            List<Assessment_Template__c> dupList = [SELECT Id 
                                                    FROM Assessment_Template__c
                                                    WHERE Name LIKE:templateName
                                                    WITH SECURITY_ENFORCED];
            if(dupList.isEmpty() == true){
                if(string.isNotBlank(templateId)){
                    List<SObject> templateList = new List<sObject>();
                    List<String> errorList =  new List<String>();
                    string newTemplateId = '';
                    templateList.add(templateRecord);
                    if (sp == null){
                        sp = Database.setSavepoint();
                    }
                    if(templateList.isEmpty() == false){
                        Database.SaveResult[] saveResult = safe.doInsert(templateList);
                        errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                    }
                    if(errorList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( errorList, ', ' ));
                    }else if (templateList.isEmpty() == false && templateList[0].Id != null){
                        newTemplateId = templateList[0].Id;
                        cloneSections(templateId,newTemplateId);
                        resWrap.isSuccess = true;
                        resWrap.recordId = newTemplateId;
                        resWrap.message = '';
                        resWrap.errorCode = '';
                    }
                }
            }else{
                resWrap.isSuccess = false;
                resWrap.recordId = '';
                resWrap.errorCode = '';
                resWrap.message = 'Template exists with the same name already, try using a different name. ';
            }
        }catch(exception e){
            resWrap.isSuccess = false;
            resWrap.recordId = '';
            resWrap.errorCode = '';
            resWrap.message = e.getMessage();
        }
        return resWrap;
    }

    /**
    * @description To Clone the Sections.
    * @param templateId This is a record id of an Old Template.
    * @param newTemplateId This is a record id of an New Template.
    */
    private void cloneSections(string templateId,string newTemplateId){
        List<Section__c> newSectionsList = new List<Section__c>();
        List<Question__c> oldPQueList = new List<Question__c>();
        Map<Id,Id> sectionIdsMap = new Map<Id,Id>();

        List<Section__c> sectionsList = secSelector.getSectionsforTemplate(templateId);
        for(Section__c section : sectionsList){
            Section__c newSection = section.clone(false, true); //do a deep clone
            newSection.Assessment_Template__c = newTemplateId;
            newSection.Historical_Id__c = section.Id;
            newSectionsList.add(newSection);
            oldPQueList.addAll(section.Questions__r);
        }
        if (sp == null){
            sp = Database.setSavepoint();
        }
        if(newSectionsList.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(newSectionsList);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }else{
                for(Section__c sec:newSectionsList){
                    sectionIdsMap.put(sec.Historical_Id__c,sec.Id);
                }
            }
        }
        if(sectionIdsMap.isEmpty() == false){
            cloneParentQuestions(sectionIdsMap,newTemplateId,oldPQueList);
        }
    }

    /**
    * @description To Clone the Parent Questions.
    * @param sectionIdsMap This is a map old and new section Ids.
    * @param newTemplateId This is a record id of an New Template.
    * @param oldPQueList This is a List of old questions.
    */
    private void cloneParentQuestions(Map<Id,Id> sectionIdsMap,string newTemplateId,List<Question__c> oldPQueList){
        Map<Id,Id> pqIdsMap = new Map<Id,Id>();
        List<Question__c> pqList = new List<Question__c>();
        for(Question__c pq : oldPQueList){
            Question__c newQuestion = pq.clone(false, true);
            newQuestion.Section__c = sectionIdsMap.get(pq.Section__c);
            newQuestion.Assessment_Template__c = newTemplateId;
            newQuestion.Historical_Id__c = pq.Id;
            pqList.add(newQuestion);
        }
        if (sp == null){
            sp = Database.setSavepoint();
        }
        if(pqList.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(pqList);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }else{
                for(Question__c pq:pqList){
                    pqIdsMap.put(pq.Historical_Id__c,pq.Id);
                }
            }
        }
        if(pqIdsMap.isEmpty() == false){
            cloneChildQuestions(sectionIdsMap,newTemplateId,pqIdsMap);
        }
    }


    /**
    * @description To Clone the Child Questions.
    * @param sectionIdsMap This is a map old and new section Ids.
    * @param newTemplateId This is a record id of an New Template.
    * @param pqIdsMap This is a map of old questions and new questions.
    */
    private void cloneChildQuestions(Map<Id,Id> sectionIdsMap,string newTemplateId,Map<Id,Id> pqIdsMap){
        
        set<Id> mqIds = new set<Id>();
        List<Question__c> cqList = new List<Question__c>();
        List<Question__c> oldCQueList = new List<Question__c>();
        Map<Id,Id> cqIdsMap = new Map<Id,Id>();
        Map<Id,Id> questionIdsMap = new Map<Id,Id>();
        
        mqIds.addAll(pqIdsMap.keySet());
        if(mqIds.isEmpty() == false){
            List<Question__c> cqs = queSelector.getSubQuestions(mqIds);
            oldCQueList.addAll(cqs);
        }
        if(oldCQueList.isEmpty() == false){
            for(Question__c cq : oldCQueList){
                Question__c newQuestion = cq.clone(false, true);
                newQuestion.Section__c = sectionIdsMap.get(cq.Section__c);
                newQuestion.Assessment_Template__c = newTemplateId;
                newQuestion.Parent_Question__c = pqIdsMap.get(cq.Parent_Question__c);
                newQuestion.Historical_Id__c = cq.Id;
                cqList.add(newQuestion);
            }
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(cqList.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(cqList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }else{
                    for(Question__c cq:cqList){
                        cqIdsMap.put(cq.Historical_Id__c,cq.Id);
                    }
                }
            }
            questionIdsMap.putAll(pqIdsMap);
            questionIdsMap.putAll(cqIdsMap);
            if(questionIdsMap.isEmpty() == false){
                cloneResponseAttrs(questionIdsMap);
            }
        }
    }

    /**
    * @description To Clone the Response Value Attributes.
    * @param questionIdsMap This is a map old and new question Ids.
    */
    private void cloneResponseAttrs(Map<Id,Id> questionIdsMap){

        Map<Id,Id> raIdsMap = new Map<Id,Id>();
        List<Response_Attribute__c> raList = new List<Response_Attribute__c>();
        List<Response_Attribute__c> resAttList = attrSelector.getRespAttforQuestion(questionIdsMap);
    
        for(Response_Attribute__c ra : resAttList){
            Response_Attribute__c newRA = ra.clone(false, true);
            newRA.QuestionId__c = questionIdsMap.get(ra.QuestionId__c);
            newRA.Name = ra.Name;
            newRA.Response_value__c = ra.Response_value__c;
            newRA.Score__c = ra.Score__c;
            newRA.Upload_Required__c = ra.Upload_Required__c;
            newRA.Weight__c = ra.Weight__c;
            newRA.preferred_Not_preferred__c = ra.preferred_Not_preferred__c;
            newRA.Historical_Id__c = ra.Id;
            raList.add(newRA);
        }
        if (sp == null){
            sp = Database.setSavepoint();
        }
        if(raList.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(raList);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }else{
                for(Response_Attribute__c ra:raList){
                    raIdsMap.put(ra.Historical_Id__c,ra.Id);
                }
            }
        }
        if(raIdsMap.isEmpty() == false){
            cloneResponseQMap(raIdsMap,questionIdsMap);
        }
    }

    /**
    * @description To Clone the Response Value Attributes.
    * @param raIdsMap This is a map old and new response question map Ids.
    * @param questionIdsMap This is a map old and new question Ids.
    */
    private void cloneResponseQMap(Map<Id,Id> raIdsMap,Map<Id,Id> questionIdsMap){
        List<Response_Question_Map__c> rqmList = new List<Response_Question_Map__c>();
        List<Response_Question_Map__c> oldRQMList = selector.getResponeQmap(raIdsMap);
        
        for(Response_Question_Map__c rqm : oldRQMList){
            Response_Question_Map__c newRQM = rqm.clone(false, true);
            newRQM.ResponseAttributeId__c = raIdsMap.get(rqm.ResponseAttributeId__c);
            newRQM.QuestionId__c = questionIdsMap.get(rqm.QuestionId__c);
            rqmList.add(newRQM);
        }
        if (sp == null){
            sp = Database.setSavepoint();
        }
        if(rqmList.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(rqmList);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
        }
    }

    /**
    * @description To get the template record data.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    public List<Assessment_Template__c> getTemplateRecord(string templateId){
        return tempSelector.getTemplateRecord(templateId);
    }
     /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }

}