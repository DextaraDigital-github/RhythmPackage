/**
* Class Name         : SectionService
* Developer          : Sai Koushik Nimmaturi, Sri Kushal Reddy N           
* Created Date       : 14-07-2023
* @description       : This class is used for building logic related to Section Object
* Last Modified Date : 
*/
public with sharing class SectionService {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static SectionService service = null; //private static instance of the class
    static SectionSelector selector = SectionSelector.getInstance();

    /**
    * @description Singleton Design Pattern 
    */
    public static SectionService getInstance(){
           if(service == null){
            service = new SectionService();
            }
        return service;
    }

    public List<SObject> getSections(String templateId, String sectionName){
        return selector.getSections(templateId,sectionName);
    }
    
}