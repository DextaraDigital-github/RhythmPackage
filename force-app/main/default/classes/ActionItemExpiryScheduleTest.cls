@isTest
public class ActionItemExpiryScheduleTest {
	/*
    @istest
    static void testExpirySchedule() {
		Test.StartTest();
		ActionItemExpirySchedule expSche = new ActionItemExpirySchedule();
		String sch = '0 0 23 * * ?';
		String jobId =system.schedule('TestSchduleExpActionItem', sch, expSche);
		Test.stopTest();
        CronTrigger ct = [SELECT Id,TimesTriggered,CronExpression, CronJobDetail.Name FROM CronTrigger WHERE Id = :jobId];
        System.assertEquals(sch, ct.CronExpression,'action item scheduled cron job');
		System.assertEquals(0, ct.TimesTriggered,'triggered');
	}*/
}