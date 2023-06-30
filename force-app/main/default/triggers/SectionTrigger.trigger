trigger SectionTrigger on Section__c (after delete, after insert, after undelete, after update,before delete, before insert, before update) {
    if(TriggerSwitchHandler.isTriggerDisabled('Section_c')) {
       TriggerDispatcher.run(new SectionTriggerHandler());
    }
}