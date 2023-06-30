public class AssessmentExpiryNotificationSchedule implements Schedulable{
    public void execute(SchedulableContext sc){
        AssessmentExpiryNotificationBatch b = new AssessmentExpiryNotificationBatch(); // Your batch class
        database.executeBatch(b);
    }
}