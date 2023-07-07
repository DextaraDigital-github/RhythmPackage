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
        string triggerObjId = Trigger_Configuration__mdt.getInstance(objectName).Id;
        List<string> fieldsList = getUpdatableFields(triggerObjId);
        if(fieldsList.isEmpty() == false){ 
            for(string fName:fieldsList){
                if(objectName.equalsIgnoreCase('Assessment_Template_c') && fName.equalsIgnoreCase('Status__c')){
                    if(string.valueOf(record.get(fName)).equalsIgnoreCase('New') && string.valueOf(oldRecord.get(fName)).equalsIgnoreCase('Active')){
                        isCriteriaMet = true;
                    }else if(string.valueOf(oldRecord.get(fName)).equalsIgnoreCase('Inactive')){
                        isCriteriaMet = true;
                    }
                }else{
                    if(record.get(fName) != oldRecord.get(fName)){
                        isCriteriaMet = true;
                    }
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
        List<string> fieldsList = new List<string>();
        for(Trigger_Field_Change_Handler__mdt tfh:[select id, MasterLabel from Trigger_Field_Change_Handler__mdt where Object_Name__c =:triggerObjId]){
            fieldsList.add(tfh.MasterLabel);
        }
        return fieldsList;
    }
}