/** 
* Class Name        : QuestionController
* Developer         : Sai Koushik Nimmaturi, Sri Kushal Reddy N         
* Created Date      : 11-07-2023
* @description      : QuestionController class is used to perform Fetching,manipulating operations.
* Last Modified Date: 11-07-2023
*/
public with sharing class QuestionController {
    /**
    * @description To get all the Response type field values.
    * @return 
    */
    @AuraEnabled
    Public Static List<String> getQuestionTypeValues(){
        return QuestionService.getQuestionTypeValues();
    }
    
    /**
    * @description createQuestions methos is to create questions and update questions.
    * @param questions It is a list of maps of Question__c object containing Question__c fields.
    * @param isUpdate  is boolean value, if true updates the question, if false inserts the question.
    * @return Map of Id and its Question__c record
    */
    @AuraEnabled
    Public Static List<SObject> createQuestions(List<SObject> questions, Boolean isUpdate){
        return QuestionService.createQuestions(questions, isUpdate);
    }
    
    /**
    * @description createQuestions methos is to create questions and update questions.
    * @param questions It is a Map of Question object contains fields.
    * @param isUpdate  is boolean value, if true updates the question, if false inserts the question.
    * @return Map of Id and its Question__c record
    */
    @AuraEnabled
    Public Static List<SObject> deleteQuestion(String questionId,String templateId){
        return QuestionService.deleteQuestion(questionId, templateId);
    }
    
    /**
    * @description gets all questions data of particular template.
    * @param templateId It is an id of Template
    * @return List of Question__c records
    */
    @AuraEnabled
    Public Static List<SObject> getQuestions(String templateId){
        List<SObject> questionsLst = QuestionService.getQuestions(templateId);
        return questionsLst;
    }
    
    /**
    * @description gets conditional questions data of particular question.
    * @param templateId it is an id of Template
    * @param questionId it is an id of Question
    * @return List of Question__c record
    */
    @AuraEnabled
    Public Static List<SObject> getChildQuestions(String questionId,String templateId){
        List<SObject> questionsLst = QuestionService.getChildQuestions(questionId,templateId);
        return questionsLst;
    }
        
    /**
    * @description gets question data of particular question.
    * @param templateId it is an id of Template
    * @param questionId it is an id of Question
    * @return List of Question__c record
    */
    @AuraEnabled
    Public Static List<SObject> getQuestionsData(String questionId, String templateId){
        return QuestionService.getQuestionsData(questionId, templateId);
    }
    
    /**
    * @description Fetches the Question__c records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch Question__c records
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<sObject> fetchQuestions(String parameterMap) {
        return QuestionService.fetchQuestions(parameterMap);
    }
    
    /**
    * @description Updates the Child Questions with updated Sequence
    * @param parameterMap It is a stringified JSON of parameters required to update and fetch updated Question__c records
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<sObject> updateQuestionsSequence(String parameterMap) {
        return QuestionService.updateQuestionsSequence(parameterMap);
    }
}