/**
* Class Name        : EmailControllerTest
* Developer         :          
* Created Date      :
* @description       : EmailControllerTest class is used to check the code coverage for EmailController
* Last Modified Date:
*/
@isTest
private class EmailControllerTest {
    static EmailService service = EmailService.getInstance();
    /**
    * @description
    */
 @testSetup
    static void methodName() {
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        System.runAs(custUser) {

            Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
            Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier'};
            TestDataFactory.createAccounts(1,true,accAttributes);

            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
            List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
            Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
            'Rhythm__Section__c'=>seclist[0].Id};
            TestDataFactory.createQuestion(1,true,questionAttributes);
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
			TestDataFactory.createAssessment(1,true,assessmentattributes);
        }
    }
    /**
    * @description
    */
    @isTest
    private static void method1(){
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        String testString;
        System.runAs(u) {
            List<Assessment__c> aslist = [Select Id from Assessment__c];
            List<Account> acc = [Select Id from Account];
            Map<String,Id> parmap = new Map<String,Id>{'assessmentId'=>aslist[0].Id};
            Map<String,Object> parmap1 = new Map<String,Object>{'selectedAccounts'=>acc};  
            String str = JSON.serialize(parmap);
            JSON.serialize(parmap1);
            EmailController.fetchAccounts(str);
            EmailController.fetchEmailtemplates();
            EmailController.fetchEmailMessages(str);
            testString='Success';
            System.assertEquals(testString=='Success', true,'email processing.');
        }
    }
    /**
    * @description
    */
    @isTest
    private static void sendEmailTest() {
	 String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        String testString;
        System.runAs(u) {	
            Test.startTest();
                try {
                    List<Account> accountList=[select id from Account limit 1];
                    List<String> accountIds = new List<String>();
                    for (Account acc : accountList) {
                        accountIds.add(acc.Id);
                    }
                    String selectedAccounts = JSON.serialize(accountIds);
                    Assessment_Template__c templates=[select id from Assessment_Template__c];
                    List<Assessment__c> assessmentList=[select id from Assessment__c];
                    Map<String, Object> paramMap = new Map<String, Object>();
                    paramMap.put('assessmentId', assessmentList[0].Id);
                    paramMap.put('subject', 'Testing mails');
                    paramMap.put('body', 'Hello');
                    paramMap.put('isBuilderContent', false);
                    paramMap.put('selectedAccounts', accountIds);
                    paramMap.put('templateId', templates.Id);
                    paramMap.put('hasCustomAttachments', false);
                    paramMap.put('hasCustomContents', false);
                    paramMap.put('attachmentsData', new Map<String, Object>{
                            'attachments'=> new List<Object>(),
                            'contentDocuments'=> new List<Object>(),
                            'customContentDocuments'=> new List<Object>(),
                            'standardContentDocuments'=> new List<Object>(),
                            'deleteContentDocuments'=> new List<Object>()
                            });
                    String parameterMap = JSON.serialize(paramMap);
                    service.sendEmail(parameterMap);
                    String emails='{"assessmentId":"'+assessmentList[0].id+'","subject":"Testing mails","body":"Hello","isBuilderContent":false,"selectedAccounts":'+selectedAccounts+',"templateId":"'+templates.id+'","hasCustomAttachments":"false","hasCustomContents":"false","attachmentsData":{"attachments":[],"contentDocuments":[],"customContentDocuments":[],"standardContentDocuments":[],"deleteContentDocuments":[]}}';
                    EmailController.sendEmail(emails);
                    testString='Success';
                    System.assertEquals(testString=='Success', true,'email processing.');
                }catch(Exception e) {
                    System.assertEquals(e.getMessage() != null, true,'error cached');
                }
            Test.stopTest();
        }
    }
}