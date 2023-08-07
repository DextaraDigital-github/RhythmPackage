/** 
* Class Name        : ResponseQuestionMapSelector
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : ResponseQuestionMapSelector contains queries related to ResponseMap Object.
* Last Modified Date: 
*/

public with sharing class ResponseQuestionMapSelector {
    private static ResponseQuestionMapSelector selector = null; //private static instance of the class
    /**
    * @description Singleton Design Pattern
    * @return
    */
    public static ResponseQuestionMapSelector getInstance(){
           if(selector == null){
                selector = new ResponseQuestionMapSelector();
            }
        return selector;
    }

    /**
    * @description Fetches the Question Response Map Records
    * @param raIdsMap Map of response map ids.
    * @return
    */
    public List<Response_Question_Map__c> getResponeQmap(Map<Id,Id> raIdsMap){
        List<Response_Question_Map__c> resQmapList = [SELECT Id,QuestionId__c,ResponseAttributeId__c
                                                FROM Response_Question_Map__c
                                                WHERE ResponseAttributeId__c IN:raIdsMap.keySet()
                                                WITH SECURITY_ENFORCED];
        return resQmapList;
    }

    /**
    * @description Fetches the Question Response Map Records
    * @param quesId List of question ids.
    * @return
    */
    public List<SObject> getQuestionResponseMap(List<String> quesId){
        try{
            List<SObject> resQmapList =  [SELECT id,Name,QuestionId__c,ResponseAttributeId__c 
                                            FROM Response_Question_Map__c
                                            WHERE QuestionId__c IN:quesId 
                                            WITH SECURITY_ENFORCED];
            return resQmapList;
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
}