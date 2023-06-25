public class SendAssessmentNotificationSchedule implements Schedulable{
    public void execute(SchedulableContext sc){
        SendAssessmentNotificationsBatch b = new SendAssessmentNotificationsBatch(); // Your batch class
        database.executeBatch(b);
    }
}