/** 
* Class Name        : QuestionSelector
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description      : QuestionSelector contains queries related to Question Object.
* Last Modified Date: 
*/
public with sharing class QuestionSelector {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    /**
    * @description To get all the sections related to a template.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    public List<Question__c> getSubQuestions(set<Id> mqIds){
        string query = 'SELECT Id,Name,Question__c,Assessment_Template__c,'
                    +  'Question_Type__c,Conditional_Response__c,HelpText__c,OptionValueSet__c,'
                    +  'Parent_Question__c,Question_Sequence_Number__c,Required__c,'
                    +  'Requires_File_Upload__c,Section__c'
                    + ' FROM Question__c'
                    + ' WHERE Parent_Question__c != null'
                    + ' AND Parent_Question__c IN:mqIds';
        Map<String, Object> bindVariables = new Map<String, Object>{'mqIds' => mqIds};
        List<Question__c>  questionList = safe.doQueryWithBinds(query,bindVariables);
        return questionList;
    }
}