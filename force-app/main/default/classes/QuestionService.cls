/** 
* Class Name        : QuestionSelector
* Developer         : Sai Koushik Nimmaturi, Sri Kushal Reddy N
* Created Date      : 
* @description      : QuestionService contains DML operations related to Question Object.
* Last Modified Date: 
*/
public with sharing class QuestionService {
	Public Static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    Public class SecurityControllerException extends Exception{
    }
    /**
    * @description To get all the Response type field values.
    * @return 
    */
	
	Public Static List<String> getQuestionTypeValues()
    {
        List<String> picklistvaluelst = new List<String>();
        Schema.DescribeFieldResult objFieldDescribe = Question__c.Question_Type__c.getDescribe();
		List<Schema.PicklistEntry> lstPickListValues = objFieldDescribe.getPickListValues();
		for (Schema.PicklistEntry objPickList : lstPickListValues) {
            picklistvaluelst.add(objPickList.getValue());
		}
        return picklistvaluelst;
    }
     /**
    * @description createQuestions methos is to create questions and update questions.
    * @param questions It is a Map of Question object contains fields.
    * @param isUpdate  is boolean value, if true updates the question, if false inserts the question.
    * @return Map of Id and its Question__c record
    */
    Public Static List<SObject> createQuestions(List<SObject> questions, Boolean isUpdate)
    {
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
    /**
    * @description createQuestions methos is to create questions and update questions.
    * @param questions It is a Map of Question object contains fields.
    * @param isUpdate  is boolean value, if true updates the question, if false inserts the question.
    * @return Map of Id and its Question__c record
    */
    Public Static List<SObject> deleteQuestion(String questionId,String templateId)
    {
        List<SObject> delQues = QuestionSelector.getQuestionsData(questionId,templateId);
        List<SObject> delChildQues = QuestionSelector.getChildQuestions(questionId,templateId);
        List<Database.DeleteResult> deleteResult = safe.doDelete(delQues);
                    List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                    if(errorList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( errorList, ', ' ));
                    }
        if(!delChildQues.isEmpty())
        {
           List<Database.DeleteResult> deletechildResult = safe.doDelete(delChildQues);
                    List<String> errorchildList = SecurityCheckController.safeClassExceptionHandlerDelete(deletechildResult);
                    if(errorchildList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join( errorList, ', ' ));
                    }
        }
        return delQues;
    }
    /**
    * @description gets all questions data of particular template.
    * @param templateId It is an id of Template
    * @return List of Question__c records
    */
    Public Static List<SObject> getQuestions(String templateId){
        List<SObject> questionsLst = QuestionSelector.getQuestions(templateId);
        return questionsLst;
    }
    /**
    * @description gets conditional questions data of particular question.
    * @param templateId it is an id of Template
    * @param questionId it is an id of Question
    * @return List of Question__c record
    */
    Public Static List<SObject> getChildQuestions(String questionId,String templateId){
        List<SObject> questionsLst = QuestionSelector.getChildQuestions(questionId,templateId);
        return questionsLst;
    }
    
    /**
    * @description gets question data of particular question.
    * @param templateId it is an id of Template
    * @param questionId it is an id of Question
    * @return List of Question__c record
    */
    @AuraEnabled
    Public Static List<SObject> getQuestionsData(String questionId, String templateId){
        return QuestionSelector.getQuestionsData(questionId, templateId);
    }
    
    /**
    * @description Updates the Child Questions with updated Sequence
    * @param parameterMap It is a stringified JSON of parameters required to update and fetch updated Question__c records
    * @return List of Question__c records
    */
    public static List<sObject> fetchQuestions(String parameterMap)
    {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        String assessmentId = (String)newParameterMap.get('assessmentId');
        String filter = ' WHERE Parent_Question__c = \''+String.escapeSingleQuotes(assessmentId)+'\' ORDER BY Question_Sequence_Number__c ASC';
        
        List<String> fields = new List<String>{'Id', 'Question__c', 'Conditional_Response__c', 'Question_Sequence_Number__c'};
        Map<String,Object> quesParameterMap = new Map<String,Object>{ 'fields'=>fields, 'filter'=>filter };
        return QuestionSelector.fetchQuestions(quesParameterMap);
    }
    
    /**
    * @description Fetches the Question__c records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch Question__c records
    * @return List of Question__c records
    */
    public static List<sObject> updateQuestionsSequence(String parameterMap)
    {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        return QuestionSelector.updateQuestionsSequence(newParameterMap);
    }
}