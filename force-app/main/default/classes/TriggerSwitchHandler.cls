public with sharing class TriggerSwitchHandler {
    public static boolean isTriggerDisabled(string objectName) {
        Boolean isActive = false;
        if(Trigger_Configuration__mdt.getInstance(objectName) != null){
            isActive = Trigger_Configuration__mdt.getInstance(objectName).Is_Active__c;
        }
        return isActive;
    }
}