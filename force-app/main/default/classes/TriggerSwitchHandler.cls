/**
* Class Name        : TriggerSwitchHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description      : It is used to turn on/off the trigger for objects.
* Last Modified Date:  
*/
public with sharing class TriggerSwitchHandler {

    /**
    * @description Logic to turn on/off the trigger.
    * @param objectName Name of the object.
    * @return  
    */
    public static boolean isTriggerDisabled(string objectName) {
        Boolean isActive = false;
        if(Trigger_Configuration__mdt.getInstance(objectName) != null){
            isActive = Trigger_Configuration__mdt.getInstance(objectName).Is_Active__c;
        }
        return isActive;
    }
}