({
	saveRecord : function(component, event, helper) {
		var testCMP = component.find('accountForm');
        if(testCMP){
            var accountRecord = testCMP.saveRecord(); // Returns JSON record.
            if(accountRecord){                
                console.log(JSON.stringify(accountRecord)); // Account record is ready to save.
            }
            else{
                // Required fields are missing.
            }
        }        
	}
})