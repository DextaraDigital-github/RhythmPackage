/** 
* Class Name        : QuestionController
* Developer         : Sai Koushik Nimmaturi, Sri Kushal Reddy N         
* Created Date      : 11-07-2023
* @description      : QuestionController class is used to perform Fetching,manipulating operations.
* Last Modified Date: 11-07-2023
*/
public with sharing class QuestionController {

   static QuestionService service = QuestionService.getInstance();
   static QuestionAttributeResponseService quesAttributeResponseservice = QuestionAttributeResponseService.getInstance();
   static ResponseQuestionMapService respQuestionMapservice = ResponseQuestionMapService.getInstance();
   static TemplateService tempService = TemplateService.getInstance();
    /**
    * @description To get all the Response type field values.
    * @return 
    */
    @AuraEnabled
    public static List<String> getQuestionTypeValues(){
        return service.getQuestionTypeValues();
    }
    
    /**
    * @description createQuestions methos is to create questions and update questions.
    * @param questions It is a list of maps of Question__c object containing Question__c fields.
    * @param isUpdate  is boolean value, if true updates the question, if false inserts the question.
    * @return Map of Id and its Question__c record
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> createQuestions(List<SObject> questions, Boolean isUpdate){
        return service.createQuestions(questions, isUpdate);
    }
    
    /**
    * @description createQuestions methos is to create questions and update questions.
    * @param questions It is a Map of Question object contains fields.
    * @param isUpdate  is boolean value, if true updates the question, if false inserts the question.
    * @return Map of Id and its Question__c record
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> deleteQuestion(String questionId,String templateId){
        return service.deleteQuestion(questionId, templateId);
    }
    
    /**
    * @description gets all questions data of particular template.
    * @param templateId It is an id of Template
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<SObject> getQuestions(String templateId){
        List<SObject> questionsLst = service.getQuestions(templateId);
        return questionsLst;
    }
    
    /**
    * @description gets conditional questions data of particular question.
    * @param templateId it is an id of Template
    * @param questionId it is an id of Question
    * @return List of Question__c record
    */
    @AuraEnabled
    public static List<SObject> getChildQuestions(String questionId,String templateId){
        List<SObject> questionsLst = service.getChildQuestions(questionId,templateId);
        return questionsLst;
    }
        
    /**
    * @description gets question data of particular question.
    * @param templateId it is an id of Template
    * @param questionId it is an id of Question
    * @return List of Question__c record
    */
    @AuraEnabled
    public static List<SObject> getQuestionsData(String questionId, String templateId){
        return service.getQuestionsData(questionId, templateId);
    }
    
    /**
    * @description Fetches the Question__c records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch Question__c records
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<sObject> fetchQuestions(String parameterMap) {
        return service.fetchQuestions(parameterMap);
    }
    
    /**
    * @description Updates the Child Questions with updated Sequence
    * @param parameterMap It is a stringified JSON of parameters required to update and fetch updated Question__c records
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<sObject> updateQuestionsSequence(String parameterMap) {
        return service.updateQuestionsSequence(parameterMap);
    }
    /**
    * @description Create Response Attributes for Questions 
    * @param responseAttributes It is a List of maps of Response_Attribute__c Object 
    * @return List of Response_Attribute__c records
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> createResponseAttributes(List<SObject> responseAttributes){
        return quesAttributeResponseservice.createResponseAttributes(responseAttributes);
    }
       /**
    * @description Updates Response Attributes for corresponding Questions 
    * @param responseAttributes It is a list of maps of Response_Attribute__c Object with the Response_Attribute__c Id. 
    * @return List of Updated Response_Attribute__c records
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> updateResponseAttributes(List<SObject> responseAttributes){
        return quesAttributeResponseservice.updateResponseAttributes(responseAttributes);
    }
    /**
    * @description delete Response Attributes for corresponding Questions 
    * @param questionId It is a List of Question Ids 
    * @return List of deleted Response_Attribute__c records
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> deleteQuesRespAttribute(List<String> questionId){
        return quesAttributeResponseservice.deleteQuesRespAttribute(questionId);
    }
   /**
    * @description create Response Question Map for corresponding Question and Response Attribute
    * @param responseQuestionmap It is a List of Response_Question_Map__c maps containing Response_Question_Map__c fields.   
    * @return List of create Response_Question_Map__c records
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> createResponseQuestionMap(List<SObject> responseQuestionmap){ 
        return respQuestionMapservice.createResponseQuestionMap(responseQuestionmap);
    }
    	 /**
    * @description gets template and its related records.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    @AuraEnabled
    public static List<Assessment_Template__c> getTemplateRecord(string templateId){
        return tempService.getTemplateRecord(templateId);
    }
}