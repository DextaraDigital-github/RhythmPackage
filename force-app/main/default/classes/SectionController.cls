/**
* Class Name         : SectionController
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building logic related to Section Object
* Last Modified Date : 
*/
public with sharing class SectionController {
    static SectionService service = SectionService.getInstance();

    /**
    * @description To get sections related to template.
    * @param templateId It is template id.
    * @return
    */
    @AuraEnabled
    public static List<SObject> getSections(String templateId, String sectionName){
        return service.getSections(templateId,sectionName);
    }
}