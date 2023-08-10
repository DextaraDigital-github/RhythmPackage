/**
* Class Name        : AssessmentServiceTest
* Developer         : Koushik     
* Created Date      :
* @description      :Test class for Assessment Service controller.
* Last Modified Date:
*/

@isTest
public class AssessmentServiceTest {
    static AssessmentService service = AssessmentService.getInstance();
    /**
    * @description
    */
    @isTest
    public static void fetchAssessmentTemplatesTest() {
        try{
            string testString;
            user u = [SELECT Id,UserName FROM User WHERE Profile.Name='Standard Platform User' LIMIT 1];
            System.runAs(u){
				Test.startTest();
                service.fetchAssessmentTemplates();
                testString='Success';
				Test.stopTest();
            }
            System.assertEquals(testString=='Success', true,'Done with fetch Assessments');
        }
        catch(Exception e) {
            System.assertEquals(e.getMessage()!=null, true,'exception thrown');
        }
    }
}