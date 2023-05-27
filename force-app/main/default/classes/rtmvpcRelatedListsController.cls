public class rtmvpcRelatedListsController {
    /*
* Returns all the tasks related to the vendorId
* Used this method as the standard relatedListApi wont work for Task object
*/
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRelatedTasks(String vendorId)
    {
        //sri return [SELECT Id, CreatedDate, ActivityDate, Subject, Status, What.Name FROM Task WHERE Vendor__c=:Id.valueOf(vendorId)];
        return null;
    }
    @AuraEnabled
    public static String getRecordTypeId(String recordId)
    {
       /*sri List<Insurance__c> ins = [select id,name,recordtypeId from Insurance__c where id=:recordId];
        System.debug('Insurenance RecordType Id:'+ins[0].recordtypeId);
        return String.valueOf(ins[0].recordtypeId);
        */
        return null;
    }
      @AuraEnabled(cacheable=true)
    public static List<SupplierinboxWrapper> getinboxandsuppliertaskslist() {
     List<SupplierinboxWrapper> supplierList  = new list<SupplierinboxWrapper>();
    // List<Supplier_Inbox_Categ__c> supplierinboxlist = [SELECT Id, Name, Supplier_Payment_System__c,(select Id,Description__c from Supplier_Tasks__r) FROM Supplier_Inbox_Categ__c];
    // system.debug('supplierinboxlist'+ supplierinboxlist);
    
    // for (Supplier_Inbox_Categ__c inbox : supplierinboxlist) {
    //     SupplierinboxWrapper wrapper = new SupplierinboxWrapper();
    //     wrapper.Name = inbox.Name;
    //     wrapper.SupplierPaymentSystem = inbox.Supplier_Payment_System__c;
    //     wrapper.Id = inbox.ID;
    //     wrapper.Count = String.valueOf(inbox.Supplier_Tasks__r.size());
    //     supplierList.add(wrapper);
    // }
      return supplierList;
     }
    
     public class SupplierinboxWrapper{
    //     @AuraEnabled
    //     public string Name{get;set;}
    //      @AuraEnabled
    //     public string Id{get;set;}
    //      @AuraEnabled
    //     public string Count{get;set;}
    //     @AuraEnabled
    //     public string SupplierPaymentSystem{get;set;}
    //     @AuraEnabled
    //     public string Description{get;set;}
    //     @AuraEnabled
    
     }
    
    
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> getSupplierTask(String recordId)
    {
        //sri return [Select Id,Name,Description__c from Supplier_Task__c where Supplier_Inbox_Category__c =:recordId];

        return null;
    }
    
    /*
* Data Retrieval and preparation for charts on home page
*/
    @AuraEnabled(cacheable=true)
    public static List<chartWrapper> getDataForCharts(String vendorId, String chartName){
        List<chartWrapper> chartDataList=new List<chartWrapper>();
        
        /*
        if(chartName=='Tasks Status')
        {
            List<AggregateResult> taskList=[SELECT Status, count(Id)statusCount FROM Task WHERE Vendor__c=:Id.valueOf(vendorId) OR OwnerId=:UserInfo.getUserId() GROUP BY Status];
            for(AggregateResult ar: taskList)
            {
                chartDataList.add(new chartWrapper(String.valueOf(ar.get('Status')),String.valueOf(ar.get('statusCount'))));
            }
        }
        else if(chartName=='Projects Status')
        {
            List<AggregateResult> projectList=[select Status__c, count(Id)statusCount from Work_Orders__c where vendor__c=:Id.valueOf(vendorId) group by Status__c];
            for(AggregateResult ar: projectList)
            {
                chartDataList.add(new chartWrapper(String.valueOf(ar.get('Status__c')),String.valueOf(ar.get('statusCount'))));
            }
        }
        else if(chartName=='Alerts by Employee')
        {
            List<Employee__c> empList=[SELECT Id, Name, Alerts_Count__c FROM Employee__c WHERE Vendor__c=:Id.valueOf(vendorId)];
            for(Employee__c ar: empList)
            {
                if(ar.Alerts_Count__c>0)
                    chartDataList.add(new chartWrapper(String.valueOf(ar.Name),String.valueOf(ar.Alerts_Count__c)));
            }
        }
        else if(chartName=='Vendor Employees vs Onsite Employees')
        {
            List<AggregateResult> empList=[SELECT count(Id)empCount FROM Employee__c WHERE Vendor__c=:Id.valueOf(vendorId) GROUP BY Vendor__c];
            List<AggregateResult> onsEmpList=[SELECT count(Id)onsEmpCount FROM Employee_Onsite__c WHERE Vendor_Name__c = :Id.valueOf(vendorId) GROUP BY Vendor_Name__c];
            //chartDataList.add(new chartWrapper('Employees',String.valueOf(empList[0].get('empCount'))));
            chartDataList.add(new chartWrapper('Onsite Employees',String.valueOf(onsEmpList[0].get('onsEmpCount'))));
            chartDataList.add(new chartWrapper('Available Employees',String.valueOf(Integer.valueOf(empList[0].get('empCount'))-Integer.valueOf(onsEmpList[0].get('onsEmpCount')))));
        }
        else if(chartName=='Incidents by Project')
        {
            List<Work_Orders__c> woList=[SELECT Id, Name, (SELECT Id from Incidents__r) FROM Work_Orders__c WHERE Vendor__c=:Id.valueOf(vendorId)];
            for(Work_Orders__c ar: woList)
            {
                if(ar.Incidents__r.size()>0)
                    chartDataList.add(new chartWrapper(ar.Name,String.valueOf(ar.Incidents__r.size())));
            }
        }
        else if(chartName=='Assessments Status')
        {
            List<AggregateResult> assessList=[select Assesment_Status__c, count(id)statusCount from Supplier_Assessment__c where vendor__c=:Id.valueOf(vendorId) group by Assesment_Status__c];
            for(AggregateResult ar: assessList)
            {
                chartDataList.add(new chartWrapper(String.valueOf(ar.get('Assesment_Status__c')),String.valueOf(ar.get('statusCount'))));
            }
        }

        */
        return chartDataList;
    }
    public class chartWrapper
    {
        @AuraEnabled
        public String label{get;set;}
        @AuraEnabled
        public String value{get;set;}
        public chartWrapper(String l, String v)
        {
            label=l;
            value=v;
        }
    }
    
    
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Integer> getRelatedListRecordsCount(String vendorId)
    {
        Map<String,Integer> dataMap=new Map<String,Integer>();
      /*  List<Vendor__c> vList=[select id, Name, (select id from Work_Orders__r), (select id from Activities__r), (select id from Assessments__r), (select id from Alerts1__r) from Vendor__c where Id=:Id.valueOf(vendorId)];
        dataMap.put('Alerts',vList[0].Alerts1__r.size());
        dataMap.put('Assessments',vList[0].Assessments__r.size());
        dataMap.put('Tasks',vList[0].Activities__r.size());
        dataMap.put('Projects',vList[0].Work_Orders__r.size());
        */
        return dataMap;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> getTaskRelatedRecords(String vendorId)
    {
        //sri return [SELECT Id, What.name, Subject,ActivityDate, CreatedDate, Owner.Name from Task where Vendor__c=:Id.valueOf(vendorId)];
        return null;
    }
    @AuraEnabled
    public static List<SObject> getAlertRelatedRecords(String vendorId)
    {
        //return [SELECT Id, Name, createdDate, Work_Orders__r.Name, owner.name from Alert__c where Vendor__c=:Id.valueOf(vendorId)];
        return null;
    }
    @AuraEnabled
    public static List<SObject> getIncidentRelatedRecords(String vendorId)
    {
        //return [SELECT Id, Name, createdDate, Incident_Date__c, Work_Order_Name__r.Name, owner.name from Incidents__c where Supplier__c=:Id.valueOf(vendorId)];
        return null;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> getAssessmentsWithSupplierAssessments(String recordId)
    {
       /* List<Assessment_Template__c> saList=[select Id, Name, Owner.Name, Type__c, Start_Date__c, Target_End_Date__c, Frequency__c, Status__c, (Select Id, Assesment_Status__c, Owner.Name from Assessments__r) from Assessment_Template__c]; 
        return saList;
        */
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static List<SObject> getSpecifiedAssessmentsWithSupplierAssessments(String recordId)
    {
        /*List<Assessment_Template__c> saList=[select Id, Name, Owner.Name, Type__c, Start_Date__c, Target_End_Date__c, Frequency__c, Status__c, (Select Id, Assesment_Status__c, Owner.Name from Assessments__r) from Assessment_Template__c where id=:recordId]; 
        return saList;
        */
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static Map<String,String> getSurveyValues()
    {
        Map<String,String> valuesMap=new Map<String,String>();
       /*sri  for(Schema.PicklistEntry ple:Supplier_Assessment__c.Survey_Life_Cycle__c.getDescribe().getPicklistValues())
        {
            valuesMap.put(ple.getValue(),ple.getLabel());
        }
        System.debug(valuesMap);
        */
        return valuesMap;
    }
    @AuraEnabled(cacheable=true)
    public static String getProgressBarData(String vendorId)
    {
        String s='';
      /*sri  List<Supplier_Assessment__c> saList=[select Id, Assessment_Template__c from Supplier_Assessment__c where Vendor__c =:vendorId];
        List<Id> AtIdList=new List<Id>();
        for(Supplier_Assessment__c sa: saList)
        {
            AtIdList.add(sa.Assessment_Template__c);
        }
        List<AggregateResult> qsList = [SELECT count(Id) countq, Assessment_Template__c FROM Questionnaire__c WHERE Assessment_Template__c  IN :AtIdList group by Assessment_Template__c];
        List<AggregateResult> srList=[select count(Id) countr, Assessment__r.Assessment_Template__c  From Supplier_Response__c where Vendor__r.Name='Success Construction' AND Section__c=null AND Response__c!=null group by Assessment__r.Assessment_Template__c ];
        for(AggregateResult sr: srList)
        {
            for(AggregateResult qs:qsList)
            {
                if(qs.get('Assessment_Template__c')==sr.get('Assessment_Template__c'))
                {
                    s+=String.valueOf(qs.get('Assessment_Template__c'))+':'+String.valueOf(sr.get('countr'))+','+String.valueOf(qs.get('countq'))+'.';
                }
                else
                {
                    s+=String.valueOf(qs.get('Assessment_Template__c'))+':0,'+String.valueOf(qs.get('countq'))+'.';
                }
            }
            
        }
        */
        return s;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getVendorId()
    {
       //sr List<Vendor__c> vendorId=[select Id, Name from vendor__c where Name='Success Construction'];
        //sr return String.valueOf(vendorId[0].Id);
        return '';
    }
    
    @AuraEnabled
    public static Map<String,String> getQuestionsCount(String vendorId)
    {
        
        Map<String,String> sa_atMap=new Map<String,String>();
        Map<String,String> qcMap=new Map<String,String>();
        /*try{
            for(Supplier_Assessment__c at:[select id, Assessment_Template__c from Supplier_Assessment__c where Vendor__c = :vendorId])
            {
                sa_atMap.put(at.id, at.Assessment_Template__c);
            }
            System.debug(sa_atMap);
            for(AggregateResult ar:[select count(id)countq, Assessment_Template__c from Questionnaire__c where Assessment_Template__c in :sa_atMap.values() group by Assessment_Template__c ])
            {
                for(String key:sa_atMap.keySet())
                {
                    if(sa_atMap.get(key)==String.valueOf(ar.get('Assessment_Template__c')))
                    {
                        qcMap.put(key,String.valueOf(ar.get('countq')));
                    }
                }
                //qcMap.put(sa_atMap.get(String.valueOf(ar.get('Assessment_Template__c'))),String.valueOf(ar.get('countq')));
            }
        }
        catch(Exception e)
        {
            System.debug(e);
        }
        */
        return qcMap;
    }
    @AuraEnabled
    public static Map<String,String> getResponsesCount(List<String> supplierAssessmentIds)
    {
        Map<String,String> rcMap=new Map<String,String>();
       /* try{
            for(AggregateResult ar:[select count(id)countr, Assessment__c  from Supplier_Response__c where Assessment__c in :supplierAssessmentIds and response__c !=null and Section__c=null group by Assessment__c])
            {
                rcMap.put(String.valueOf(ar.get('Assessment__c')),String.valueOf(ar.get('countr')));
            }
        }
        catch(Exception e)
        {
            System.debug(e);
        }
        */
        return rcMap;
    }
    @AuraEnabled
    public static String deleteRecords(List<Id> recIdList)
    {
        String status='Success';
      /*  Database.DeleteResult[] drList=Database.delete(recIdList,true);
        for(Database.DeleteResult dr:drList)
        {
            if(!dr.isSuccess())
            {
                for(Database.Error de:dr.getErrors())
                {
                    status='Error Status Code: '+de.getStatusCode()+' || '+de.getMessage()+' || Error Source:'+de.getFields();
                }
            }
        }
        */
        return status;
    }
    
    @AuraEnabled
    public static List<sObject> getRecordsForInbox()
    {
        /*List<sObject> records=[select Id, OwnerId, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, LastViewedDate, LastReferencedDate, Supplier_Payment_System__c, Season_Prepardness__c, Category__c, (select Id, OwnerId, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, LastViewedDate, LastReferencedDate, Description__c from Supplier_Tasks__r) from Supplier_Inbox_Categ__c];
        return records;
        */
        return null;
    }
    
    @AuraEnabled
    public static List<SObject> createChatterItem(String responseId, String source, String subject, String assId, String qId)
    {
       /* Supplier_Response__c sr=new Supplier_Response__c();
        List<Supplier_Response__c> records= new List<Supplier_Response__c>();
        try
        {
            if(responseId!=null)
                records=[select Id, Conversation_History__c from Supplier_Response__c where Id=:Id.valueOf(responseId)];
            System.debug(records);
            if(records.size()>0)
            {
                sr=records[0];
                if(sr.Conversation_History__c!=null)
                    sr.Conversation_History__c =sr.Conversation_History__c.substring(0,sr.Conversation_History__c.length()-1)+',{"recipient":"'+UserInfo.getName()+'","recipientType":"Reciever","date":"'+Datetime.now()+'","subject":"'+subject+'"}]';
                else
                    sr.Conversation_History__c ='[{"recipient":"'+UserInfo.getName()+'","recipientType":"Reciever","date":"'+Datetime.now()+'","subject":"'+subject+'"}]';
                update sr;
            }
            else
            {
                sr.Questionnaire__c=Id.valueOf(qId);
                sr.Assessment__c=Id.valueOf(assId);
                sr.Conversation_History__c ='[{"recipient":"'+UserInfo.getName()+'","recipientType":"Reciever","date":"'+Datetime.now()+'","subject":"'+subject+'"}]';
                SYstem.debug(sr);
                insert sr;
            }
            
        }
        catch(Exception e)
        {
            SYstem.debug(e);
        }
        return [select Id, Conversation_History__c from Supplier_Response__c where Id=:sr.Id];
        */
        return null;
    }
    
    
    /*@AuraEnabled
public static String getProgressBarData(String assessmentId)
{
List<Supplier_Assessment__c> saList=[select Id, Assessment_Template__c from Supplier_Assessment__c where Id=:assessmentId];
List<AggregateResult> qsList = [SELECT count(Id) countq FROM Questionnaire__c WHERE Assessment_Template__c =:saList[0].Assessment_Template__c];
List<AggregateResult> srList=[select count(Id) countr From Supplier_Response__c where Assessment__c=:assessmentId AND Section__c=null AND Response__c != null];
return String.valueOf(qsList[0].get('countq'))+','+String.valueOf(srList[0].get('countr'));
}*/
    /*@AuraEnabled(cacheable=true)
public static List<Employee__c> getDataForBarChart(String vendorId)
{
return [select Id, Name, Alerts_Count__c from Employee__c where vendor__c=:Id.valueOf(vendorId)];
}

@AuraEnabled(cacheable=true)
public static List<AggregateResult> getDataForDoughnutChart(String vendorId, String chart)
{
if(chart=='doughnut')
return [select Status,count(id) from Task where vendor__c=:Id.valueOf(vendorId) OR OwnerId=:UserInfo.getUserId() group by Status];
else if(chart=='pie')
return [select Status__c,count(id) from Work_Orders__c where vendor__c=:Id.valueOf(vendorId) group by Status__c];
else if(chart=='Assessments Status')
return [select Assesment_Status__c,count(id)statusCount from Supplier_Assessment__c where vendor__c=:Id.valueOf(vendorId) group by Assesment_Status__c];
return null;
}

@AuraEnabled(cacheable=true)
public static Map<String,Object> getDataForPolarChart(String vendorId)
{
Map<String, Object> dataMap=new Map<String, Object>();
List<AggregateResult> empCount=[SELECT count(Id)empCount from Employee__c where Vendor__c=:Id.valueOf(vendorId) group by Vendor__c];
dataMap.put('Vendor Employees',empCount[0].get('empCount'));
List<AggregateResult> onsEmpCount=[SELECT count(Id)onsEmpCount from Employee_Onsite__c where Vendor_Name__c = :Id.valueOf(vendorId) group by Vendor_Name__c];
dataMap.put('Onsite Employees',onsEmpCount[0].get('onsEmpCount'));
return dataMap;
}

@AuraEnabled(cacheable=true)
public static Map<String,Integer> getDataForHorizontalBarChart(String vendorId)
{
Map<String,Integer> dataMap=new Map<String,Integer>();
List<Work_Orders__c> woList=[select Id, Name, (select Id from Incidents__r) from Work_Orders__c where Vendor__c=:Id.valueOf(vendorId)];
for(Work_Orders__c wo: woList)
{
if(wo.Incidents__r.size()>0){
dataMap.put(wo.Name,wo.Incidents__r.size());
}
}
return dataMap;
}
@AuraEnabled
public static String getRelatedRecords(String vendorId, String objName, String fieldName, List<String> fieldSet)
{
System.debug('SELECT '+String.join(fieldSet,',')+' FROM '+objName+' WHERE '+fieldName+' = \''+vendorId+'\'');
return String.valueOf(Database.query('SELECT '+String.join(fieldSet,',')+' FROM '+objName+' WHERE '+fieldName+' = \''+vendorId+'\''));
}*/
}