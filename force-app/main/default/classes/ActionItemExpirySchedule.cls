/** 
* Class Name        : SendAssessmentNotificationSchedule
* Developer         :            
* Created Date      : 
* @description      : It is used to schedule the assessment notification.
* Last Modified Date: 
*/
global with sharing class ActionItemExpirySchedule implements Schedulable{

    /**
    * @description To schedule a batch.
    * @param sc It is an instance of SchedulableContext.
    */
    global void execute(SchedulableContext sc){
        ActionItemExpiryBatch b = new ActionItemExpiryBatch(); // Your batch class
        database.executeBatch(b);
    }
     
}