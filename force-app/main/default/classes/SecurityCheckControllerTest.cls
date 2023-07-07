@isTest
private class SecurityCheckControllerTest {
    @isTest
    static void safelyTest(){
        Test.startTest();
        SecurityCheckController safe = new SecurityCheckController();
        safe.allOrNothing();
        List<Account> acc = TestDataFactory.createAccounts(1, false, null); 
        safe.doInsert(acc);
        safe.doInsert(new List<Account>());
        safe.doUpdate(acc);
        safe.doUpdate(new List<Account>());
        safe.doUpsert(acc);
        safe.doUpsert(acc, Account.Fields.Id);
        safe.doUpsert(new List<Account>());
        safe.doDelete(acc);
        safe.doDelete(new List<Account>());
        safe.doQuery('SELECT Id FROM Account');
        Test.stopTest();
        System.assert(acc.size()>0, TRUE);
    }
}