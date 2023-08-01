/**
* Class Name         : QuestionAttributeResponseService
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building complex logic related to QuestionAttributeResponse functionalities
* Last Modified Date : 
*/
public with sharing class QuestionAttributeResponseService {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    /**
    * @description Create Response Attributes for Questions 
    * @param responseAttributes It is a List of maps of Response_Attribute__c Object 
    * @return List of Response_Attribute__c records
    */
    public static List<SObject> createResponseAttributes(List<SObject> responseAttributes)
    {
        System.debug('responseAttributes'+responseAttributes);
        if(responseAttributes.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(responseAttributes);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                system.debug('errorsList---->'+errorsList);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
        //return responseQuestionmap;
        //INSERT responseAttributes;
        return responseAttributes;
    }
     @AuraEnabled 
    public static List<SObject> createResponseQuestionMap(List<SObject> responseQuestionmap)
    {
        //INSERT responseQuestionmap;
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
   /**
    * @description Updates Response Attributes for corresponding Questions 
    * @param responseAttributes It is a list of maps of Response_Attribute__c Object with the Response_Attribute__c Id. 
    * @return List of Updated Response_Attribute__c records
    */ 
    public static List<SObject> updateResponseAttributes(List<SObject> responseAttributes)
    {
        if(responseAttributes.isEmpty() == false){
                Database.SaveResult[] results = safe.doUpdate(responseAttributes);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                system.debug('errorsList---->'+errorsList);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
        //UPDATE responseAttributes;
        return responseAttributes;
    }
   /**
    * @description delete a particular Response Attribute Record
    * @param responseId is a Response_Attribute__c Record Id. 
    * @return List of deleted Response_Attribute__c records
    */
    public static List<Sobject> deleteResponseAttribute(String responseId)
    {
        List<Sobject> delrespAtr = QuestionAttributeResponseSelector.getQuestionResponseAttribute(responseId);
        System.debug('delrespAtr'+delrespAtr);
        if(delrespAtr.isEmpty() == false){
                    List<Database.DeleteResult> deleteResult = safe.doDelete(delrespAtr);
                    List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                    if(errorList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( errorList, ', ' ));
                    }
                }
        
        //DELETE delrespAtr;
        return delrespAtr;
    }
    
    /**
    * @description delete Response Attributes for corresponding Questions 
    * @param questionId It is a List of Question Ids 
    * @return List of deleted Response_Attribute__c records
    */
    public static List<SObject> deleteQuesRespAttribute(List<String> questionId)
    {
        List<SObject> delrespAtr = QuestionAttributeResponseSelector.getQuestionRespAttributes(questionId);
        if(!delrespAtr.isEmpty())
        {
             List<Database.DeleteResult> delRespAttr = safe.doDelete(delrespAtr);
                    List<String> errorRespAttr = SecurityCheckController.safeClassExceptionHandlerDelete(delRespAttr);
                    if(errorRespAttr.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( errorRespAttr, ', ' ));
                    }
        }
        return delrespAtr;
    }
   /**
    * @description gets al Response Attribute Records based on  Response_Attribute__c Ids
    * @param questionlst is a list of Response_Attribute__c id. 
    * @return List of Response_Attribute__c records
    */
    public static List<SObject> getQuesRespAttribute(List<String> respAttrId){
        return QuestionAttributeResponseSelector.getQuesRespAttribute(respAttrId);
    }
   /**
    * @description gets al Response Attribute Records based on  Question__c Id
    * @param questionlst is a list of Question__c id. 
    * @return List of Response_Attribute__c records
    */
    public static List<SObject> getQuestionRespAttributes(List<String> questionlst){
        return QuestionAttributeResponseSelector.getQuestionRespAttributes(questionlst);
    }
    
    public class SecurityControllerException extends Exception{
    }
}