# Salesforce DX Project: Reusable & Customisable salesforce solutions

- ## Project 1: Reusable and customisable edit page layout aura component

    Do you like [force:recordEdit](https://developer.salesforce.com/docs/component-library/bundle/force:recordEdit).

    Love page layout editor to add/remove/modify fields in page layout dynamically after deployment.

    Hate no control on record save operation, no control on page layout assignment, can not use this when user do not have edit access on object/fields (public sites).

    This solutions is developed to take advantage of dynamic customization of page layout editor and control on save operation, no need of edit access and limitless potential to develop on top.

    ### Screenshots:
    ![Account record edit example 1](https://psl392-dev-ed--c.visualforce.com/resource/1656154881000/auraDemo1)
    ![Account record edit example 2](https://psl392-dev-ed--c.visualforce.com/resource/1656155082000/auraDemo2?)

    ReusableExample1.cmp
    ```
    <aura:component  access="global">
        <c:ReusableLayoutCMP aura:id="accountForm" sObject="Account" layoutname="Account Layout"/>
        <lightning:button variant="brand" label="Save" title="Save Account" onclick="{!c.saveRecord}"/>
    </aura:component>
    ```

    ReusableExample1Controller.js
    ```
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
    ```
    ### Component List:

        - `ReusableLayoutCMP` : Aura component. 
        - `GenericLookupCMP` : Aura component.
        - `GenericLookupResult` : Aura component.
        - `GenericLookupEvent` : Component event.
        - `ReusableLayoutCtrl` : Apex class.
        - `LayoutWrapper` : Apex class.





