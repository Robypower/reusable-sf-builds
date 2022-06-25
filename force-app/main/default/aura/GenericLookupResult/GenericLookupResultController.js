({
    selectRecord : function(component, event, helper){
       var recordObj = component.get("v.recordObj");
       var compEvent = component.getEvent("genLookupRes");
       compEvent.setParams({"recordObj" : recordObj });
       compEvent.fire();
     },
 })