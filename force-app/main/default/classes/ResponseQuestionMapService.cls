/**
* Class Name         : ResponseQuestionMapService
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building complex logic related to ResponseQuestionMap Object
* Last Modified Date : 
*/

public with sharing class ResponseQuestionMapService{

    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    private static ResponseQuestionMapService service = null; //private static instance of the class

    /**
    * @description Singleton Design Pattern 
    */
    public static ResponseQuestionMapService getInstance(){
           if(service == null){
            service = new ResponseQuestionMapService();
            }
        return service;
    }
	/**
    * @description create Response Question Map for corresponding Question and Response Attribute
    * @param responseQuestionmap It is a List of Response_Question_Map__c maps containing Response_Question_Map__c fields.   
    * @return List of create Response_Question_Map__c records
    */
    public List<SObject> createResponseQuestionMap(List<SObject> responseQuestionmap){
        if(responseQuestionmap.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(responseQuestionmap);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            system.debug('errorsList---->'+errorsList);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
        }
        return responseQuestionmap;
    }

    public class SecurityControllerException extends Exception{
    }
}