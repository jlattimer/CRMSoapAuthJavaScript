// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    'use strict';

    WinJS.UI.Pages.define('/pages/whoami/whoami.html', {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            CrmWhoAmI();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });

    function CrmWhoAmI() {
        var body = [];
        body.push('<s:Body>');
        body.push('<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services">');
        body.push('	<request i:type="c:WhoAmIRequest" xmlns:b="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:c="http://schemas.microsoft.com/crm/2011/Contracts">');
        body.push('		<b:Parameters xmlns:d="http://schemas.datacontract.org/2004/07/System.Collections.Generic"/>');
        body.push('		<b:RequestId i:nil="true"/>');
        body.push('		<b:RequestName>WhoAmI</b:RequestName>');
        body.push('	</request>');
        body.push('</Execute>');
        body.push('</s:Body>');

        Xrm.ExecuteSOAP.Execute(WinJS.Application.sessionState.authHeader, body.join(''), WinJS.Application.sessionState.url, CrmWhoAmIResponse);
    }

    function CrmWhoAmIResponse(response) {
        var userId = $(response).find('b\\:KeyValuePairOfstringanyType').find('d\\:key:contains(UserId)').parent();
        var id = $(userId).find('d\\:value:first').text();
        $('#userId').val(id);
        CrmRetrieveUserInfo(id);
    }

    function CrmRetrieveUserInfo(id) {
        var body = [];
        body.push('<s:Body>');
        body.push('	<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">');
        body.push('		<request i:type="a:RetrieveRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">');
        body.push('			<a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">');
        body.push('				<a:KeyValuePairOfstringanyType>');
        body.push('					<b:key>Target</b:key>');
        body.push('					<b:value i:type="a:EntityReference">');
        body.push('						<a:Id>' + id + '</a:Id>');
        body.push('						<a:LogicalName>systemuser</a:LogicalName>');
        body.push('						<a:Name i:nil="true" />');
        body.push('					</b:value>');
        body.push('				</a:KeyValuePairOfstringanyType>');
        body.push('				<a:KeyValuePairOfstringanyType>');
        body.push('					<b:key>ColumnSet</b:key>');
        body.push('					<b:value i:type="a:ColumnSet">');
        body.push('						<a:AllColumns>false</a:AllColumns>');
        body.push('						<a:Columns xmlns:c="http://schemas.microsoft.com/2003/10/Serialization/Arrays">');
        body.push('							<c:string>firstname</c:string>');
        body.push('							<c:string>lastname</c:string>');
        body.push('						</a:Columns>');
        body.push('					</b:value>');
        body.push('				</a:KeyValuePairOfstringanyType>');
        body.push('			</a:Parameters>');
        body.push('			<a:RequestId i:nil="true" />');
        body.push('			<a:RequestName>Retrieve</a:RequestName>');
        body.push('		</request>');
        body.push('	</Execute>');
        body.push('</s:Body>');

        Xrm.ExecuteSOAP.Execute(WinJS.Application.sessionState.authHeader, body.join(''), WinJS.Application.sessionState.url, CrmRetrieveUserInfoResponse);
    }

    function CrmRetrieveUserInfoResponse(response) {
        var firstnameElement = $(response).find('b\\:KeyValuePairOfstringanyType').find('c\\:key:contains(firstname)').parent();
        var firstname = $(firstnameElement).find('c\\:value:first').text();
        var lastnameElement = $(response).find('b\\:KeyValuePairOfstringanyType').find('c\\:key:contains(lastname)').parent();
        var lastname = $(lastnameElement).find('c\\:value:first').text();
        $('#fullname').text(firstname + ' ' + lastname);
    }

})();
