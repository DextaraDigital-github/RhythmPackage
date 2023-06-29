public with sharing class DisplayPDFController {
	public String displayText {get; set;}
    public DisplayPDFController()
    {
        String recordId = apexpages.currentpage().getparameters().get('id');
		AccountAssessmentRelation__c record = [select id,PdfConvertor__c from AccountAssessmentRelation__c where id = : recordId];
        System.debug('record.PdfConvertor__c'+record.PdfConvertor__c);
        displayText = record.PdfConvertor__c;
    }
}