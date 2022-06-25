({
  searchHelper: function (component, event, getInputkeyWord) {
    var action = component.get("c.fetchLookUpValuesGeneric");
    if (!component.get("v.maxResults")) {
      component.set("v.maxResults", "5");
    }
    action.setParams({
      'searchKeyWord': getInputkeyWord,
      'ObjectName': component.get("v.objectAPIName"),
      "extraFields": component.get("v.extraFields"),
      "maxResults": component.get("v.maxResults"),
      "noLimit": component.get("v.advancedSearch")
    });
    action.setCallback(this, function (response) {
      $A.util.removeClass(component.find("mySpinner"), "slds-show");
      var state = response.getState();
      if (state === "SUCCESS") {
        var columns = [];
        var data = [];
        var nameSet = [];
        var storeResponse = response.getReturnValue();
        if (storeResponse.length == 0) {
          component.set("v.Message", 'No Result Found...');
        } else {
          columns.push({
            label: 'Name',
            fieldName: 'Name',
            type: 'text',
            sortable: true,
            cellAttributes: {
              alignment: 'left'
            },
          });
          component.set("v.Message", '');
          storeResponse.forEach(ele => {
            ele = this.flatenJson(ele);
            data.push(ele);
            if (component.get("v.extraFields")) {
              var fldList = component.get("v.extraFields").split(',');
              if (fldList && fldList.length > 0) {
                fldList.forEach(lbl => {
                  var obj = {
                    label: lbl,
                    fieldName: lbl,
                    type: 'text',
                    sortable: true,
                    cellAttributes: {
                      alignment: 'left'
                    },
                  }
                  if (!nameSet.includes(lbl)) {
                    columns.push(obj);
                    nameSet.push(lbl);
                  }
                });
                ele['extraField'] = ele[fldList[0]];
              }
            }
          });
        }
        component.set('v.columns', columns);
        component.set('v.data', data);
        component.set("v.listOfSearchRecords", storeResponse);
      }
    });
    $A.enqueueAction(action);
  },
  flatenJson: function (element) {
    for (var key in element) {
      if (typeof element[key] === 'object') {
        var obj = element[key];
        for (var subKey in obj) {
          element[key + '.' + subKey] = obj[subKey];
        }
      }
    }
    return element;
  },
  handleSort: function (cmp, event) {
    var sortedBy = event.getParam('fieldName');
    var sortDirection = event.getParam('sortDirection');

    var cloneData = cmp.get('v.data');
    cloneData.sort((a, b) => (a[sortedBy] > b[sortedBy]) ? 1 : -1);
    cloneData = sortDirection !== 'asc' ? cloneData.reverse() : cloneData;
    cmp.set('v.data', cloneData);
    cmp.set('v.sortDirection', sortDirection);
    cmp.set('v.sortedBy', sortedBy);
  },
  clearHandler: function (component, event, heplper) {
    if (component.get("v.disabled")) {
      return;
    }
    var pillTarget = component.find("lookup-pill");
    var lookUpTarget = component.find("lookupField");

    $A.util.addClass(pillTarget, 'slds-hide');
    $A.util.removeClass(pillTarget, 'slds-show');

    $A.util.addClass(lookUpTarget, 'slds-show');
    $A.util.removeClass(lookUpTarget, 'slds-hide');

    component.set("v.SearchKeyWord", null);
    component.set("v.listOfSearchRecords", null);
    component.set("v.selectedRecord", {});
    var field = component.get('v.field');
    field['value'] = null;
    field['lookupObj'] = null;
    component.set("v.field", field);
  },
})