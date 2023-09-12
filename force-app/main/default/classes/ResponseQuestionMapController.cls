/**
* Class Name         : ResponseQuestionMapController
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building logic related to QuestionAttributeResponse functionalities
* Last Modified Date : 
*/

public with sharing class ResponseQuestionMapController {
    static ResponseQuestionMapService service = ResponseQuestionMapService.getInstance();
	/**
    * @description create Response Question Map for corresponding Question and Response Attribute
    * @param responseQuestionmap It is a List of Response_Question_Map__c maps containing Response_Question_Map__c fields.   
    * @return List of create Response_Question_Map__c records
    */
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static List<SObject> createResponseQuestionMap(List<SObject> responseQuestionmap){ 
        return service.createResponseQuestionMap(responseQuestionmap);
    }
}