/**
* Class Name        : TriggerFrameworkServiceController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description      : It is used to get the record data dynamically
* Last Modified Date:  
*/
public with sharing class TriggerFrameworkServiceController {

     /**
    * @description To check the required criteria.
    * @param record new record data.
    * @param oldRecord Old record data.
    * @param objectName Name of the object.
    * @return
    */
    public boolean checkEntryCriteria(sObject record, sObject oldRecord, string objectName){
        boolean isCriteriaMet = false;
        String triggerObjId = Trigger_Configuration__mdt.getInstance(objectName).Id;
        List<String> fieldsList = getUpdatableFields(triggerObjId);
        for(String fName:fieldsList){
            Boolean isAssessmentTemplate = objectName.equalsIgnoreCase('Assessment_Template_c') && fName.equalsIgnoreCase('Status__c');
            if(isAssessmentTemplate){
                if(String.valueOf(record.get(fName)).equalsIgnoreCase('New') && String.valueOf(oldRecord.get(fName)).equalsIgnoreCase('Active')){
                    isCriteriaMet = true;
                }else if(String.valueOf(oldRecord.get(fName)).equalsIgnoreCase('Inactive')){
                        isCriteriaMet = true;
                }
            }else{
                if(record.get(fName) != oldRecord.get(fName)){
                    isCriteriaMet = true;
                }
            }
        }
        return isCriteriaMet;
    }
    
     /**
    * @description To get the fields to be updated.
    * @param triggerObjId object id.
    * @return
    */
    public List<string> getUpdatableFields(string triggerObjId){
        if ((!Schema.sObjectType.Trigger_Field_Change_Handler__mdt.isAccessible()) || (!Schema.sObjectType.Trigger_Field_Change_Handler__mdt.fields.Id.isAccessible()) || (!Schema.sObjectType.Trigger_Field_Change_Handler__mdt.fields.MasterLabel.isAccessible())) {
            return new List<string>();
        }
        List<string> fieldsList = new List<string>();
        for(Trigger_Field_Change_Handler__mdt tfh:[select id, MasterLabel from Trigger_Field_Change_Handler__mdt where Object_Name__c =:triggerObjId]){
            fieldsList.add(tfh.MasterLabel);
        }
        return fieldsList;
     }
}