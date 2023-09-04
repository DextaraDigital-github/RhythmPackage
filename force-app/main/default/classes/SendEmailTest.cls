@isTest
private class SendEmailTest {
    @testSetup
    static void methodName() {
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        Map<String, Object> accAttributes = new Map<String, Object>{'Name'=>'Test Account'};
        TestDataFactory.createAccounts(1,true,accAttributes);
    }
 @isTest
    private static void method1(){
        List<user> u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com'];
        String testString;
        EmailTemplate e = new EmailTemplate (
            developerName = 'test',
            IsActive = true,
            Body = 'Test body',
            TemplateType= 'Text', Name = 'test', FolderId = u[0].Id); // plus any other fields that you want to set
		insert e;
         Map<String, Object> actionData = new Map<String, Object>{
            'Name' => 'Test Subject',
            'Id' => 'TestRecordId',
            'targetId' => 'TestNotificationTypeId'
            };
        List<Id> userId = new List<Id>();
        Set<String> userStr = new Set<String>();
        for(User uid: u){
            userId.add(uid.Id);
            userStr.add(uid.Id);
        }
        
        SendEmail.send('Hi','Test Mail',userId );
        SendEmail.notifyUsers(actionData,'test body',userStr);
        testString='Success';
        System.assertEquals(testString=='Success', true,'fetch content version.');
    }
    @isTest
    private static void methodException(){
        List<user> u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com'];
        String testString;
        EmailTemplate e = new EmailTemplate (
            developerName = 'test',
            IsActive = true,
            Body = 'Test body',
            TemplateType= 'Text', Name = 'test', FolderId = u[0].Id); // plus any other fields that you want to set
		    insert e;
        Map<String, Object> actionData = new Map<String, Object>{
            'Name' => 'Test Subject',
            'Id' => 'TestRecordId',
           'targetId' => 'TestNotificationTypeId'
        };
        List<Id> userId = new List<Id>();
        Set<String> userStr = new Set<String>();
        for(User uid: u){
            userId.add(uid.Id);
            userStr.add(uid.Id);
        }
        List<Id> userIds = new List<Id>();
        SendEmail.send('','',userIds);
        SendEmail.notifyUsers(actionData,'test body',userStr);
        testString='Success';
        System.assertEquals(testString=='Success', true,'fetch content version.');
    }
}