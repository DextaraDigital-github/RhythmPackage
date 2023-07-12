@isTest
private class SendAssessmentNotificationScheduleTest {
    @istest
    private static void testExpirySchedule() {
		Test.StartTest();
		SendAssessmentNotificationSchedule expSche = new SendAssessmentNotificationSchedule();
		String sch = '0 0 23 * * ?';
		String jobId =system.schedule('TestSchduleNoti', sch, expSche);
		Test.stopTest();
		CronTrigger ct = [SELECT Id,TimesTriggered,CronExpression, CronJobDetail.Name FROM CronTrigger WHERE Id = :jobId];
        System.assertEquals(sch, ct.CronExpression,'');
		System.assertEquals(0, ct.TimesTriggered,'');
	}
}