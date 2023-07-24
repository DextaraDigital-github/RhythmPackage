/**
* Class Name         : QuestionAttributeResponseController
* Developer          : Sri Kushal Reddy N           
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
}