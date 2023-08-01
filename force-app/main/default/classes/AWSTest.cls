/**
* Class Name        : AWSTest
* Developer         :          
* Created Date      :
* @description       : AWSTest class is used to check the code coverage for AWS
* Last Modified Date:
*/
@isTest 
private class AWSTest {
    
    /**
* @description
*/
    private static testmethod void awsTest(){
        Dom.Document doc = new Dom.Document();
        Dom.Xmlnode rootNode = doc.createRootElement('TestReport', null, null);
        Dom.Xmlnode childNode = rootNode.addChildElement('detail', null, null);
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            test.startTest(); 
            AWS.getChildNodeBoolean(rootNode,'Rhythm','detail');
            AWS.getChildNodeInteger(rootNode,'Rhythm','rootNode');
            AWS.getChildNodeText(rootNode,'Rhythm','rootNode');
            AWS.ServiceException ai = new AWS.ServiceException(rootNode);
            test.stopTest();
        }
    }
}