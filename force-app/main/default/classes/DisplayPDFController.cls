/**
* Class Name         : DisplayPDFController
* Developer          : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date       : 
* @description       : It is used to display the pdf.
* Last Modified Date : 
*/
public with sharing class DisplayPDFController {
    public static SecurityCheckController safe = new SecurityCheckController();
    public static Map<String,String> columnsMap = new Map<String,String>{'section'=>'Section Name','snumber'=>'Sno.','question'=>'Question','value'=>'Response','conversationHistory'=>'Conversation History'};
    public static String table;
    // public static String table='{"Section2": [{"questionId": "a087g0000085EJhAAM","question": "Q1","snumber": 1,"value": false,"conversationHistory": "[]"},{"questionId": "a087g0000085EJrAAM","question": "C2","snumber": "1.1","value": "2023-08-16","conversationHistory": "[]"},{"questionId": "a087g0000085EJwAAM","question": "Multi Picklist","snumber": 2,"value": "UR","conversationHistory": "[]"}],"Section3": [{"questionId": "a087g0000085EJhAAM","question": "Q1","snumber": 1,"value": false,"conversationHistory": "[]"},{"questionId": "a087g0000085EJrAAM","question": "C2","snumber": "1.1","value": "2023-08-16","conversationHistory": "[]"},{"questionId": "a087g0000085EJwAAM","question": "Multi Picklist","snumber": 2,"value": "UR","conversationHistory": "[]"}]}';
    
    /* Data for table */
    public static List<ColumnWrapper> columns{get;set;}
    public static List<QuestionWrapper> data{get;set;}
    
    public DisplayPDFController() {
        String recordId = apexpages.currentpage().getparameters().get('id');
        string query = 'SELECT Id,PdfConvertor__c'
                     +' FROM AccountAssessmentRelation__c'
                     +' WHERE Id=\'' + string.escapeSingleQuotes(recordId) + '\''
                     +' WITH SECURITY_ENFORCED';
    
		List<AccountAssessmentRelation__c> asmtRelnRecord = safe.doQuery(query);
        table = asmtRelnRecord[0].PdfConvertor__c.replaceAll('&quot;','"'); 
        
        columns = new List<ColumnWrapper>();
        for(String column:columnsMap.keySet()) {
            ColumnWrapper columnWr = new ColumnWrapper();
            columnWr.label = columnsMap.get(column);
            columnWr.name = column;
        	columns.add(columnWr);
        }
        System.debug(columns);
        
        data = new List<QuestionWrapper>();
        Map<String,List<QuestionWrapper>> inputMap = (Map<String,List<QuestionWrapper>>)JSON.deserialize(table, Map<String,List<QuestionWrapper>>.class);
        System.debug(inputMap);
        for(String section:new List<String>(inputMap.keySet())) {
            List<QuestionWrapper> questionsList = inputMap.get(section);
            for(Integer i = 0; i < questionsList.size(); i++) {
                QuestionWrapper questionWr = new QuestionWrapper();
                questionWr = questionsList[i];
                questionWr.section = section;
                data.add(questionWr);
            }
        }
        System.debug(data);
    }
    
    public class QuestionWrapper {
        public Id questionId{get;set;}
        public String section{get;set;}
        public String question{get;set;}
        public String snumber{get;set;}
        public String value{get;set;}
        public String conversationHistory{get;set;}
    }
    public class ColumnWrapper {
        public String label{get;set;}
        public String name{get;set;}
    }
}