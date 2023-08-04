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
    private static QuestionAttributeResponseService service = null; //private static instance of the class

    static QuestionAttributeResponseSelector selector = QuestionAttributeResponseSelector.getInstance();

    /**
    * @description Singleton Design Pattern 
    */
    public static QuestionAttributeResponseService getInstance(){
           if(service == null){
            service = new QuestionAttributeResponseService();
            }
        return service;
    }

    /**
    * @description Create Response Attributes for Questions 
    * @param responseAttributes It is a List of maps of Response_Attribute__c Object 
    * @return List of Response_Attribute__c records
    */
    public List<SObject> createResponseAttributes(List<SObject> responseAttributes){
        if(responseAttributes.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(responseAttributes);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
        }
        return responseAttributes;
    }
     
   /**
    * @description Updates Response Attributes for corresponding Questions 
    * @param responseAttributes It is a list of maps of Response_Attribute__c Object with the Response_Attribute__c Id. 
    * @return List of Updated Response_Attribute__c records
    */ 
    public List<SObject> updateResponseAttributes(List<SObject> responseAttributes){
        if(responseAttributes.isEmpty() == false){
            Database.SaveResult[] results = safe.doUpdate(responseAttributes);
            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join(errorsList, ', ' ));
            }
        }
        return responseAttributes;
    }
   /**
    * @description delete a particular Response Attribute Record
    * @param responseId is a Response_Attribute__c Record Id. 
    * @return List of deleted Response_Attribute__c records
    */
    public List<Sobject> deleteResponseAttribute(String responseId){
        List<Sobject> delrespAtr = selector.getQuestionResponseAttribute(responseId);
        if(delrespAtr.isEmpty() == false){
            List<Database.DeleteResult> deleteResult = safe.doDelete(delrespAtr);
            List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
            if(errorList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
            }
        }
        return delrespAtr;
    }
    
    /**
    * @description delete Response Attributes for corresponding Questions 
    * @param questionId It is a List of Question Ids 
    * @return List of deleted Response_Attribute__c records
    */
    public List<SObject> deleteQuesRespAttribute(List<String> questionId){
        List<SObject> delrespAtr = selector.getQuestionRespAttributes(questionId);
        if(!delrespAtr.isEmpty()){
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
    public List<SObject> getQuesRespAttribute(List<String> respAttrId){
        return selector.getQuesRespAttribute(respAttrId);
    }
   /**
    * @description gets al Response Attribute Records based on  Question__c Id
    * @param questionlst is a list of Question__c id. 
    * @return List of Response_Attribute__c records
    */
    public List<SObject> getQuestionRespAttributes(List<String> questionlst){
        return selector.getQuestionRespAttributes(questionlst);
    }
    
    public class SecurityControllerException extends Exception{
    }
}