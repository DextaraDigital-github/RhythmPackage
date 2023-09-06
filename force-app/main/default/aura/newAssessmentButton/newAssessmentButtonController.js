({
    init: function(component, event, helper) {
        // Initialize event handler on component initialization
       
    },
    
   	refreshPage: function(cmp, event, helper){
        $A.get('e.force:refreshView').fire();
    },
    onPageReferenceChange: function(cmp, event, helper) {
    	var myPageRef = cmp.get("v.pageReference");
        $A.get('e.force:refreshView').fire();
	},
})