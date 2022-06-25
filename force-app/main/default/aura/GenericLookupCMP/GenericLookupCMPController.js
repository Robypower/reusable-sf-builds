({

    doInit: function (component, event, helper) {

        var params = event.getParam('arguments');
        var field = component.get("v.field");
        if ((field && field.value) || (params != undefined || params != null)) {
            if (!component.get('v.disabled')) {
                component.set('v.disabled', true);
            }
            var lookupObjStr = field['lookupObjStr'];
            var selectedRec = {
                Id: field.value,
                Name: field.lookupRecordName
            };
            if (lookupObjStr) {
                try {
                    var lookupObj = JSON.parse(lookupObjStr);
                    selectedRec['lookupObj'] = lookupObj;
                    field['lookupObj'] = lookupObj;
                } catch (e) {
                    console.log(e);
                    console.log('parseLookup exception.');
                }
            }
            component.set("v.selectedRecord", selectedRec);
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show');
        }
    },

    onfocus: function (component, event, helper) {
        if (component.get("v.disabled")) {
            return;
        }
        $A.util.addClass(component.find("mySpinner"), "slds-show");
        var forOpen = component.find("searchRes");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
        var getInputkeyWord = '';
        helper.searchHelper(component, event, getInputkeyWord);
    },
    onblur: function (component, event, helper) {
        if (component.get("v.disabled")) {
            return;
        }
        component.set("v.listOfSearchRecords", null);
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    keyPressController: function (component, event, helper) {
        if (component.get("v.disabled")) {
            return;
        }
        var getInputkeyWord = component.get("v.SearchKeyWord");
        if (getInputkeyWord.length > 0) {
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            helper.searchHelper(component, event, getInputkeyWord);
        } else {
            component.set("v.listOfSearchRecords", null);
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
        }
    },
    clear: function (component, event, helper) {
        helper.clearHandler(component, event, helper);
    },

    handleComponentEvent: function (component, event, helper) {
        var selectedRecordGetFromEvent = event.getParam("recordObj");
        component.set("v.selectedRecord", selectedRecordGetFromEvent);
        var field = component.get('v.field');
        field['value'] = selectedRecordGetFromEvent.Id;
        field['lookupObj'] = selectedRecordGetFromEvent;
        component.set("v.field", field);

        var forclose = component.find("lookup-pill");
        $A.util.addClass(forclose, 'slds-show');
        $A.util.removeClass(forclose, 'slds-hide');

        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');

        var lookUpTarget = component.find("lookupField");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show');

    },
    selectRecord: function (component, event, helper) {
        component.set("v.advancedSearch", true);
    },
    closeModel: function (component, event, helper) {
        component.set("v.advancedSearch", false);
        helper.clearHandler(component, event, helper);
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    submitDetails: function (component, event, helper) {
        component.set("v.advancedSearch", true);
    },
    handleSort: function (cmp, event, helper) {
        helper.handleSort(cmp, event);
    },
    onRowSelect: function (component, event, helper) {
        var selectedRows = event.getParam('selectedRows')[0];
        console.log('selectedRows->' + JSON.stringify(selectedRows));

        component.set("v.selectedRecord", selectedRows);
        var field = component.get('v.field');
        field['value'] = selectedRows.Id;
        field['lookupObj'] = selectedRows;
        component.set("v.field", field);

        var forclose = component.find("lookup-pill");
        $A.util.addClass(forclose, 'slds-show');
        $A.util.removeClass(forclose, 'slds-hide');

        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');

        var lookUpTarget = component.find("lookupField");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show');
        component.set("v.advancedSearch", false);
    },

})