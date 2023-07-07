/* 
* Class Name        : DisplayPDFController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : It is used to display the pdf.
* Last Modified Date: 
*/
public with sharing class DisplayPDFController {
    public static SecurityCheckController safe = new SecurityCheckController();
	public String displayText {get; set;}

    /**
    * This is constructor where the record is fetched based on id.
    */
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