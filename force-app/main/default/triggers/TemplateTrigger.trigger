trigger TemplateTrigger on Assessment_Template__c (after delete, after insert, after undelete, after update,before delete, before insert, before update) {
    if(TriggerSwitchHandler.isTriggerDisabled('Assessment_Template_c')){
        TriggerDispatcher.run(new TemplateTriggerHandler());
    }
}