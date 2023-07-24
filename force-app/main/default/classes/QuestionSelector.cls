/** 
* Class Name        : QuestionSelector
* Developer         : Reethika Velpula, Sai Koushik Nimmaturi, Sri Kushal Reddy N        
* Created Date      : 
* @description      : QuestionSelector contains queries related to Question Object.
* Last Modified Date: 
*/
public with sharing class QuestionSelector {
    public static SecurityCheckController safe = new SecurityCheckController();   //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
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

    /**
    * @description Fetches the Question__c records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its Question__c record
    */
    public static List<Question__c> fetchQuestions(Map<String,Object> parameterMap) {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields != null && !fields.isEmpty()) {
            filter = (filter == null)?'':filter;
            String query = 'SELECT ' + String.join(fields,',') + ' FROM Question__c ' + filter;
            try {
                List<Question__c> qList = safe.doQuery(query);
        		return qList;
            }
            catch(Exception e) {
                errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'ContentVersionSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while fetching ContentVersion records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchContentVersions';
                errorList.add(errorRec);
                Database.SaveResult[] results = Database.insert(errorList, false);
                throw new AuraHandledException(e.getMessage());   //Throws an exception
            }
        }
        return null;
    }
    
    /**
    * @description Updates the Child Questions with updated Sequence and fetches the questions with updated sequence
    * @param parameterMap It is a Map of all parameters like Questions Ids to be updated
    * @return List of Question__c records
    */
    public static List<Question__c> updateQuestionsSequence(Map<String,Object> parameterMap)
    {
        List<String> questionIdList = (List<Id>)JSON.deserialize(JSON.serialize(parameterMap.get('questionIdList')),List<String>.class);
        String questionId = (String)parameterMap.get('questionId');
        if(!questionIdList.isEmpty() && questionIdList.size()>0 && questionId!=null && String.isNotBlank(questionId))
        {
            Integer sequenceNo = 1;
            List<Question__c> questionList = new List<Question__c>();
            for(Id question:questionIdList)
            {
                questionList.add(new Question__c(Id=question,Question_Sequence_Number__c=sequenceNo));
                sequenceNo++;
            }
            try
            {
                update questionList;
                List<Question__c> qList = [SELECT Id, Question__c, Conditional_Response__c, Question_Sequence_Number__c FROM Question__c WHERE Parent_Question__c = :String.escapeSingleQuotes(questionId) WITH SECURITY_ENFORCED ORDER BY Question_Sequence_Number__c ASC];
                return qList;
            }
            catch(Exception e)
            {}
        }
        return null;
    }
}