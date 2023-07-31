/**
* Class Name         : QuestionAttributeResponseController
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building logic related to QuestionAttributeResponse functionalities
* Last Modified Date : 
*/
public with sharing class QuestionAttributeResponseController {

    /**
    * @description Fetches the Question__c records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch Question__c records
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<sObject> fetchQuestions(String parameterMap) {
        return QuestionAttributeResponseService.fetchQuestions(parameterMap);
    }
    
    /**
    * @description Updates the Child Questions with updated Sequence
    * @param parameterMap It is a stringified JSON of parameters required to update and fetch updated Question__c records
    * @return List of Question__c records
    */
    @AuraEnabled
    public static List<sObject> updateQuestionsSequence(String parameterMap) {
        return QuestionAttributeResponseService.updateQuestionsSequence(parameterMap);
    }
     /**
    * @description Create Response Attributes for Questions 
    * @param responseAttributes It is a List of maps of Response_Attribute__c Object 
    * @return List of Response_Attribute__c records
    */
    @AuraEnabled
    public static List<SObject> createResponseAttributes(List<SObject> responseAttributes)
    {
        return QuestionAttributeResponseService.createResponseAttributes(responseAttributes);
    }
   /**
    * @description delete Response Attributes for corresponding Questions 
    * @param questionId It is a List of Question Ids 
    * @return List of deleted Response_Attribute__c records
    */
    @AuraEnabled
    public static List<SObject> deleteQuesRespAttribute(List<String> questionId){
        return QuestionAttributeResponseService.deleteQuesRespAttribute(questionId);
    }
   /**
    * @description Updates Response Attributes for corresponding Questions 
    * @param responseAttributes It is a list of maps of Response_Attribute__c Object with the Response_Attribute__c Id. 
    * @return List of Updated Response_Attribute__c records
    */
    @AuraEnabled  
    public static List<SObject> updateResponseAttributes(List<SObject> responseAttributes){
        return QuestionAttributeResponseService.updateResponseAttributes(responseAttributes);
    }
   /**
    * @description delete a particular Response Attribute Record
    * @param responseId is a Response_Attribute__c Record Id. 
    * @return List of deleted Response_Attribute__c records
    */
    @AuraEnabled
    public static List<Sobject> deleteResponseAttribute(String responseId){
        return QuestionAttributeResponseService.deleteResponseAttribute(responseId);
    }
      /**
    * @description gets al Response Attribute Records based on  Response_Attribute__c Ids
    * @param questionlst is a list of Response_Attribute__c id. 
    * @return List of Response_Attribute__c records
    */
    @AuraEnabled
    public static List<SObject> getQuesRespAttribute(List<String> respAttrId){
        return QuestionAttributeResponseService.getQuesRespAttribute(respAttrId);
    }
   /**
    * @description gets al Response Attribute Records based on  Question__c Id
    * @param questionlst is a list of Question__c id. 
    * @return List of Response_Attribute__c records
    */
    @AuraEnabled
    public static List<SObject> getQuestionRespAttributes(List<String> questionlst){
        return QuestionAttributeResponseService.getQuestionRespAttributes(questionlst);
    }
    
}