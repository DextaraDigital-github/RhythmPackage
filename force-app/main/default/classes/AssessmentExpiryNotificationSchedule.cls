/**
* Class Name        : AssessmentExpiryNotificationSchedule
* Developer         : Prudhvi   
* Created Date      : 
* @description        : It is to schedule assessment notification batch class.
* Last Modified Date: 
*/
public with sharing class AssessmentExpiryNotificationSchedule implements Schedulable{
    
    /**
    * @description  Method to execute the batch.
    * @param sc It is an instance of SchedulableContext.
    */
    public void execute(SchedulableContext sc){
        AssessmentExpiryNotificationBatch b = new AssessmentExpiryNotificationBatch(); // Your batch class
        database.executeBatch(b);
    } 
}