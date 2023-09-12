({
    init : function(component, event, helper) {
		let currentPage = component.get('v.pageReference');
        if(currentPage.state.Rhythm__assessmentId != '' && typeof currentPage.state.Rhythm__assessmentId !== 'undefined'){
            component.set('v.assessmentId',currentPage.state.Rhythm__assessmentId);
            component.set('v.fromAura',true);
        }
	},
    onPageReferenceChange: function(cmp, event, helper) {
    	var myPageRef = cmp.get("v.pageReference");
        $A.get('e.force:refreshView').fire();
	}
})
