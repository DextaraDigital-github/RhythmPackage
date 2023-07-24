/**
* Class Name         : QuestionAttributeResponseService
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building complex logic related to QuestionAttributeResponse functionalities
* Last Modified Date : 
*/
public with sharing class QuestionAttributeResponseService {
    public static SecurityCheckController safe = new SecurityCheckController();   //use singleton pattern
    private static Savepoint sp;
    @AuraEnabled	
	public static List<String> getQuestionTypeValues()
    {
        List<String> picklistvaluelst = new List<String>();
        Schema.DescribeFieldResult objFieldDescribe = Question__c.Question_Type__c.getDescribe();
		List<Schema.PicklistEntry> lstPickListValues = objFieldDescribe.getPickListValues();
		for (Schema.PicklistEntry objPickList : lstPickListValues) {
            picklistvaluelst.add(objPickList.getValue());
		}
        return picklistvaluelst;
    }
    @AuraEnabled
    public static List<SObject> createQuestions(List<SObject> questions, Boolean isUpdate)
    {
        System.debug('questions'+questions);
        if(isUpdate)
        {
            if(questions.isEmpty() == false){
                Database.SaveResult[] results = safe.doUpdate(questions);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                system.debug('errorsList---->'+errorsList);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            //UPDATE questions;
        }
        else
        {
            if(questions.isEmpty() == false){
                Database.SaveResult[] results = safe.doInsert(questions);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                system.debug('errorsList---->'+errorsList);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }
            }
            //INSERT questions;
        }
        
        return questions;
    }
    @AuraEnabled
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
    @AuraEnabled  
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
    @AuraEnabled
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
    public class SecurityControllerException extends Exception{
    }
    
    /**
    * @description Fetches the Question__c records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch Question__c records
    * @return List of Question__c records
    */
    public static List<sObject> fetchQuestions(String parameterMap) {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        String assessmentId = (String)newParameterMap.get('assessmentId');
        String filter = ' WHERE Parent_Question__c = \'' + String.escapeSingleQuotes(assessmentId) + '\' ORDER BY Question_Sequence_Number__c ASC ';
        
        List<String> fields = new List<String>{'Id', 'Question__c', 'Conditional_Response__c', 'Question_Sequence_Number__c'};
        Map<String,Object> quesParameterMap = new Map<String,Object>{ 'fields'=>fields, 'filter'=>filter };
        return QuestionSelector.fetchQuestions(quesParameterMap);
    }
    
    /**
    * @description Updates the Child Questions with updated Sequence
    * @param parameterMap It is a stringified JSON of parameters required to update and fetch updated Question__c records
    * @return List of Question__c records
    */
    public static List<sObject> updateQuestionsSequence(String parameterMap) {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        return QuestionSelector.updateQuestionsSequence(newParameterMap);
    }
    
    @AuraEnabled
    public static List<SObject> deleteQuestion(String questionId,String templateId)
    {
        List<SObject> delQues = QuestionAttributeResponseSelector.getQuestionsData(questionId,templateId);
        //List<SObject> delRespAtr = QuestionAttributeResponseSelector.getResponseAttributes(questionId);
        List<SObject> delChildQues = QuestionAttributeResponseSelector.getChildQuestions(questionId,templateId);
        DELETE delQues;
        if(!delChildQues.isEmpty())
        {
            DELETE delChildQues;
        }
        /*if(!delRespAtr.isEmpty())
        {
            DELETE delRespAtr;
        }*/
        return delQues;
    }
    @AuraEnabled
    public static List<SObject> deleteQuesRespAttribute(String questionId)
    {
        List<SObject> delrespAtr = QuestionAttributeResponseSelector.getResponseAttributes(questionId);
        if(!delrespAtr.isEmpty())
        {
            DELETE delrespAtr;
        }
        return delrespAtr;
    }
}