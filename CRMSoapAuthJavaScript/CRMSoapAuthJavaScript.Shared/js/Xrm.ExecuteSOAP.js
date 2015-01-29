Xrm = window.Xrm || { __namespace: true };
Xrm.ExecuteSOAP = Xrm.ExecuteSOAP || { __namespace: true };

/// <summary>
/// Executes the SOAP request.
/// </summary>
/// <param name="authHeader">CrmAuthenticationHeader.</param>
/// <param name="requestBody">The SOAP request body.</param>
/// <param name="url">The CRM URL.</param>
/// <param name="callback">The callback function to execute.</param>
/// <returns>SOAP response.</returns>
Xrm.ExecuteSOAP.Execute = function (header, body, url, callback) {
    var xml = [];
    xml.push('<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">');
    xml.push(header);
    xml.push(body);
    xml.push('</s:Envelope>');
    var request = xml.join('');

    var req = new XMLHttpRequest();
    req.open('POST', url + 'XRMServices/2011/Organization.svc', true);
    req.setRequestHeader('Content-Type', 'application/soap+xml; charset=utf-8');
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                callback(req.response);
            }
        } 
    };
    req.send(request);
};