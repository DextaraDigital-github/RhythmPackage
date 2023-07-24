trigger UserTrigger on User (after delete, after insert, after undelete, after update,before delete, before insert, before update) {
    if(TriggerSwitchHandler.isTriggerDisabled('User')){
        TriggerDispatcher.run(new UserTriggerHandler());
    }
}