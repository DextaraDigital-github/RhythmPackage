/** 
* Class Name        : SendAssessmentNotificationSchedule
* Developer         :            
* Created Date      : 
* @description      : It is used to schedule the assessment notification.
* Last Modified Date: 
*/
public with sharing class SendAssessmentNotificationSchedule implements Schedulable{

    /**
    * @description To schedule a batch.
    * @param sc It is an instance of SchedulableContext.
    */
    public void execute(SchedulableContext sc){
        SendAssessmentNotificationsBatch b = new SendAssessmentNotificationsBatch(); // Your batch class
        database.executeBatch(b);
    }
}