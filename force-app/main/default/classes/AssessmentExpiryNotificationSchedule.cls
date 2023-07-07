/* 
* Class Name        : AssessmentExpiryNotificationSchedule
* Developer         : Prudhvi   
* Created Date      : 
* Description       : It is to schedule assessment notification batch class.
* Last Modified Date: 
*/
public class AssessmentExpiryNotificationSchedule implements Schedulable{
    
    /**
    *  Method to execute the batch.
    */
    public void execute(SchedulableContext sc){
        AssessmentExpiryNotificationBatch b = new AssessmentExpiryNotificationBatch(); // Your batch class
        database.executeBatch(b);
    } 
}