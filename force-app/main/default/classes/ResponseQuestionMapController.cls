/**
* Class Name         : ResponseQuestionMapController
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building logic related to QuestionAttributeResponse functionalities
* Last Modified Date : 
*/

public with sharing class ResponseQuestionMapController {
    static ResponseQuestionMapService service = ResponseQuestionMapService.getInstance();

    @AuraEnabled
    public static List<SObject> createResponseQuestionMap(List<SObject> responseQuestionmap){
        return service.createResponseQuestionMap(responseQuestionmap);
    }
}