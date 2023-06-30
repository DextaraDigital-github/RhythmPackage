trigger QuestionTrigger on Question__c (after delete, after insert, after undelete, after update,before delete, before insert, before update) {
    if(TriggerSwitchHandler.isTriggerDisabled('Question_c')) {
       TriggerDispatcher.run(new QuestionTriggerHandler());
    }
}