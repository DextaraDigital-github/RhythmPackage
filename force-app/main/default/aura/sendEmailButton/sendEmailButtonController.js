({
	init : function(component, event, helper) {
		let currentPage = component.get('v.pageReference');
        component.set('v.assessmentId',currentPage.state.Rhythm__assessmentId);
        component.set('v.assessmentName',currentPage.state.Rhythm__assessmentName);
	}
})