@isTest
private class AssessmentExpiryNotificationScheduleTest {

    @istest
    private static void testExpirySchedule() {
		Test.StartTest();
		AssessmentExpiryNotificationSchedule expSche = new AssessmentExpiryNotificationSchedule();
		String sch = '0 0 23 * * ?';
		String jobId =system.schedule('TestSchduleExp', sch, expSche);
		Test.stopTest();
        CronTrigger ct = [SELECT Id,TimesTriggered,CronExpression, CronJobDetail.Name FROM CronTrigger WHERE Id = :jobId];
        System.assertEquals(sch, ct.CronExpression,'scheduled cron job');
		System.assertEquals(0, ct.TimesTriggered,'triggered');
	}
}