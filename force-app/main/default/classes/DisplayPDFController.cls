public with sharing class DisplayPDFController {
    public static SecurityCheckController safe = new SecurityCheckController();
	public String displayText {get; set;}
    public DisplayPDFController()
    {
        String recordId = apexpages.currentpage().getparameters().get('id');
        string query = 'SELECT Id,PdfConvertor__c'
                     +' FROM AccountAssessmentRelation__c'
                     +' WHERE Id=\'' + string.escapeSingleQuotes(recordId) + '\''
                     +' WITH SECURITY_ENFORCED';
    
		List<AccountAssessmentRelation__c> asmtRelnRecord = safe.doQuery(query);
        displayText = asmtRelnRecord[0].PdfConvertor__c; 
    }
}