/** 
* Class Name        : SectionSelector
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : ResponseQuestionMapSelector contains queries related to ResponseMap Object.
* Last Modified Date: 
*/

public with sharing class ResponseQuestionMapSelector {
    @AuraEnabled
    public static List<Response_Question_Map__c> getResponeQmap(Map<Id,Id> raIdsMap){
        List<Response_Question_Map__c> resQmapList = [SELECT Id,QuestionId__c,ResponseAttributeId__c
                                                FROM Response_Question_Map__c
                                                WHERE ResponseAttributeId__c IN:raIdsMap.keySet()
                                                WITH SECURITY_ENFORCED];
        return resQmapList;
    }
}