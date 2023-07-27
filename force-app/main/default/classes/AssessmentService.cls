/** 
* Class Name         : AssessmentService
* Developer          : Sri Kushal Reddy N        
* Created Date       : 26-07-2023
* @description       : AssessmentService class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Assessment__c,Response__c.
* Last Modified Date : 
*/
public class AssessmentService {
    public static SecurityCheckController safe = new SecurityCheckController();  //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
    /**
    * @description Fetches the Assessment_Template__c records based on search string and other parameters
    * @return List of Assessment_Template__c records
    */
    public static List<sObject> fetchAssessmentTemplates() {
        List<String> fields = new List<String>{'Id', 'Name'};
        String filter = ' WHERE Status__c = \'Active\' ORDER BY Name ASC';
        Map<String,Object> newParameterMap = new Map<String,Object>{'fields'=>fields, 'filter'=>filter};
        List<Assessment_Template__c> recList = TemplateSelector.fetchAssessmentTemplates(newParameterMap).values();
        if(recList != null) {
            return recList;
        }
        return null;
    }
}