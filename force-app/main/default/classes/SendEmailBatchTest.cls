/**
* Class Name        : SendEmailBatchTest
* Developer         :           
* Created Date      :
* @description       : SendEmailBatchTest class is used to check the code coverage for SendEmailBatchTest
* Last Modified Date:
*/
@isTest
private class SendEmailBatchTest {
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
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
			 Map<String, Object> contactAttributes = new Map<String, Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John'};
            List<Contact> contacts = TestDataFactory.createContacts(2,true,contactAttributes);
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id};
			TestDataFactory.createAssessment(1,true,assessmentattributes);
        }
    }
   /**
    * @description
    */
    @isTest
    private static void sendEmailTest(){
	 String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
        List<Account> accountList=[select id from Account ];
            List<String> accountIds = new List<String>();
            for (Account acc : accountList) {
                accountIds.add(acc.Id);
            }
         System.debug('accountIds'+accountIds);
            String selectedAccounts = JSON.serialize(accountIds);
            List<Contact> conList = [Select Id,Email,AccountId from Contact where AccountId IN: accountList];
        System.debug('conList'+conList);
            Assessment_Template__c templates=[select id from Assessment_Template__c];
        System.debug('templates>>'+templates);
            List<Assessment__c> assessmentList=[select id from Assessment__c];
        
        Profile p = [Select Id from Profile where Name ='Customer Community User'];
            UserRole role = new UserRole(Name = 'Test Role');
        insert role;
        List<User> userList = new List<User>();
        User user = new User();
        user.FirstName = 'John';
        user.LastName = 'Doe';
        user.Username = 'johndoe@example123.com';
        user.Email = 'johndoe@example.com';
        user.Alias = 'johnd';
        user.CommunityNickname = 'johnd';
        user.TimeZoneSidKey = 'America/New_York';
        user.LocaleSidKey = 'en_US';
        user.EmailEncodingKey = 'UTF-8';
        user.ProfileId = p.Id;
        user.LanguageLocaleKey = 'en_US';
        user.ContactId = conList[0].Id;
        //user.UserRoleId = role.Id;
        userList.add(user);
        insert userList;
        EmailTemplate e = new EmailTemplate (
            developerName = 'test',
            IsActive = true,
            Body = 'Test body',
            TemplateType= 'Text', Name = 'test', FolderId = userList[0].Id); // plus any other fields that you want to set
		insert e;
        Map<String, Object> paramMap = new Map<String, Object>();
            paramMap.put('assessmentId', assessmentList[0].Id);
            paramMap.put('subject', 'Testing mails');
            paramMap.put('body', 'Hello');
            paramMap.put('isBuilderContent', false);
            paramMap.put('selectedAccounts', accountIds);
            paramMap.put('templateId', e.Id);
            paramMap.put('hasCustomAttachments', false);
            paramMap.put('hasCustomContents', true);
            paramMap.put('attachmentsData', new Map<String, Object>{
                'attachments'=> new List<Object>(),
                    'contentDocuments'=> new List<Object>(),
                    'customContentDocuments'=> new List<Object>(),
                    'standardContentDocuments'=> new List<Object>(),
                    'deleteContentDocuments'=> new List<Object>()
                    });
            Test.startTest();
        //Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
          //  email.setHtmlBody((String)paramMap.get('body'));
        //system.assert(false, email.getHtmlBody());
        System.debug('templateId'+paramMap.get('templateId'));
            SendEmailBatch emailtest = new SendEmailBatch(paramMap);
        Id jobid = Database.executeBatch(emailtest);
        Test.stopTest();
    }
}
}