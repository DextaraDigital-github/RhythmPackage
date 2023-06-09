trigger AssessmentTrigger on Assessment__c (after delete, after insert, after undelete, after update,before delete, before insert, before update) {
    if(TriggerSwitchHandler.isTriggerDisabled('Assessment__c')){
        TriggerDispatcher.run(new AssessmentTriggerHandler());
    }
}