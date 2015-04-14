Xrm = window.Xrm || { __namespace: true };
Xrm.CRMAuth = Xrm.CRMAuth || { __namespace: true };

/// <summary>Gets a CRM Online SOAP header & expiration.</summary>
/// <param name="url" type="String">The Url of the CRM Online organization (https://org.crm.dynamics.com).</param>
/// <param name="username" type="String">Username of a valid CRM user.</param>
/// <param name="password" type="String">Password of a valid CRM user.</param>
/// <returns type="Object">An object containing the SOAP header and expiration date/time of the header.</returns>
Xrm.CRMAuth.GetHeaderOnline = function (url, username, password) {
    if (!url.match(/\/$/)) url += '/';
    var urnAddress = Xrm.CRMAuth.GetUrnOnline(url);
    var now = new Date();
    var xml = [];
    xml.push('<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">');
    xml.push('<s:Header>');
    xml.push('<a:Action s:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/02/trust/RST/Issue</a:Action>');
    xml.push('<a:MessageID>urn:uuid:' + Xrm.CRMAuth.CreateGuid() + '</a:MessageID>');
    xml.push('<a:ReplyTo>');
    xml.push('<a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>');
    xml.push('</a:ReplyTo>');
    xml.push('<a:To s:mustUnderstand="1">https://login.microsoftonline.com/RST2.srf</a:To>');
    xml.push('<o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<u:Timestamp u:Id="_0">');
    xml.push('<u:Created>' + now.toISOString() + '</u:Created>');
    xml.push('<u:Expires>' + new Date(now.setMinutes(now.getMinutes() + 60)).toISOString() + '</u:Expires>');
    xml.push('</u:Timestamp>');
    xml.push('<o:UsernameToken u:Id="uuid-' + Xrm.CRMAuth.CreateGuid() + '-1">');
    xml.push('<o:Username>' + username + '</o:Username>');
    xml.push('<o:Password>' + password + '</o:Password>');
    xml.push('</o:UsernameToken>');
    xml.push('</o:Security>');
    xml.push('</s:Header>');
    xml.push('<s:Body>');
    xml.push('<trust:RequestSecurityToken xmlns:trust="http://schemas.xmlsoap.org/ws/2005/02/trust">');
    xml.push('<wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">');
    xml.push('<a:EndpointReference>');
    xml.push('<a:Address>urn:' + urnAddress + '</a:Address>');
    xml.push('</a:EndpointReference>');
    xml.push('</wsp:AppliesTo>');
    xml.push('<trust:RequestType>http://schemas.xmlsoap.org/ws/2005/02/trust/Issue</trust:RequestType>');
    xml.push('</trust:RequestSecurityToken>');
    xml.push('</s:Body>');
    xml.push('</s:Envelope>');

    var authentication = {};
    var request = xml.join('');
    var req = new XMLHttpRequest();
    req.open('POST', 'https://login.microsoftonline.com/RST2.srf', false);
    req.setRequestHeader('Connection', 'Keep-Alive');
    req.setRequestHeader('Content-Type', 'application/soap+xml; charset=UTF-8');
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var token = $(req.response).find('CipherValue');
                var keyIdentifer = $(req.response).find('wsse\\:KeyIdentifier:first');
                authentication.TokenExpires = $(req.response).find('wsu\\:Expires:first').text();
                authentication.Header = Xrm.CRMAuth.CreateSOAPHeaderOnline(url, $(keyIdentifer).text(), $(token[0]).text(), $(token[1]).text());
            }
        }
    };
    req.send(request);
    return authentication;
};

/// <summary>Gets a CRM Online SOAP header.</summary>
/// <param name="url" type="String">The Url of the CRM Online organization (https://org.crm.dynamics.com).</param>
/// <param name="keyIdentifer" type="String">The KeyIdentifier from the initial request.</param>
/// <param name="token0" type="String">The first token from the initial request.</param>
/// <param name="token1" type="String">The second token from the initial request.</param>
/// <returns type="String">The XML SOAP header to be used in future requests.</returns>
Xrm.CRMAuth.CreateSOAPHeaderOnline = function (url, keyIdentifer, token0, token1) {
    var xml = [];
    xml.push('<s:Header>');
    xml.push('<a:Action s:mustUnderstand="1">http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute</a:Action>');
    xml.push('<Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<EncryptedData Id="Assertion0" Type="http://www.w3.org/2001/04/xmlenc#Element" xmlns="http://www.w3.org/2001/04/xmlenc#">');
    xml.push('<EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#tripledes-cbc"/>');
    xml.push('<ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">');
    xml.push('<EncryptedKey>');
    xml.push('<EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"/>');
    xml.push('<ds:KeyInfo Id="keyinfo">');
    xml.push('<wsse:SecurityTokenReference xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<wsse:KeyIdentifier EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509SubjectKeyIdentifier">' + keyIdentifer + '</wsse:KeyIdentifier>');
    xml.push('</wsse:SecurityTokenReference>');
    xml.push('</ds:KeyInfo>');
    xml.push('<CipherData>');
    xml.push('<CipherValue>' + token0 + '</CipherValue>');
    xml.push('</CipherData>');
    xml.push('</EncryptedKey>');
    xml.push('</ds:KeyInfo>');
    xml.push('<CipherData>');
    xml.push('<CipherValue>' + token1 + '</CipherValue>');
    xml.push('</CipherData>');
    xml.push('</EncryptedData>');
    xml.push('</Security>');
    xml.push('<a:MessageID>urn:uuid:' + Xrm.CRMAuth.CreateGuid() + '</a:MessageID>');
    xml.push('<a:ReplyTo>');
    xml.push('<a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>');
    xml.push('</a:ReplyTo>');
    xml.push('<a:To s:mustUnderstand="1">' + url + 'XRMServices/2011/Organization.svc</a:To>');
    xml.push('</s:Header>');
    return xml.join('');
};

/// <summary>Gets the correct URN Address based on the Online region.</summary>
/// <param name="url" type="String">The Url of the CRM Online organization (https://org.crm.dynamics.com).</param>
/// <returns type="String">URN Address.</returns>
Xrm.CRMAuth.GetUrnOnline = function (url) {
    if (url.toUpperCase().indexOf('CRM2.DYNAMICS.COM') !== -1) {
        return 'crmsam:dynamics.com';
    }
    if (url.toUpperCase().indexOf('CRM4.DYNAMICS.COM') !== -1) {
        return 'crmemea:dynamics.com';
    }
    if (url.toUpperCase().indexOf('CRM5.DYNAMICS.COM') !== -1) {
        return 'crmapac:dynamics.com';
    }
    if (url.toUpperCase().indexOf('CRM6.DYNAMICS.COM') !== -1) {
        return 'crmoce:dynamics.com';
    }
    if (url.toUpperCase().indexOf('CRM7.DYNAMICS.COM') !== -1) {
        return 'crmjpn:dynamics.com';
    }
    if (url.toUpperCase().indexOf('CRM9.DYNAMICS.COM') !== -1) {
        return 'crmgcc:dynamics.com';
    }
    return 'crmna:dynamics.com';
};

/// <summary>Gets a CRM On Premise SOAP header & expiration.</summary>
/// <param name="url" type="String">The Url of the CRM On Premise (IFD) organization (https://org.domain.com).</param>
/// <param name="username" type="String">Username of a valid CRM user.</param>
/// <param name="password" type="String">Password of a valid CRM user.</param>
/// <returns type="Object">An object containing the SOAP header and expiration date/time of the header.</returns>
Xrm.CRMAuth.GetHeaderOnPremise = function (url, username, password) {
    if (!url.match(/\/$/)) url += '/';
    var adfsUrl = Xrm.CRMAuth.GetADFS(url);
    var now = new Date();
    var urnAddress = url + 'XRMServices/2011/Organization.svc';
    var usernamemixed = adfsUrl + '/13/usernamemixed';
    var xml = [];
    xml.push('<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">');
    xml.push('<s:Header>');
    xml.push('<a:Action s:mustUnderstand="1">http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue</a:Action>');
    xml.push('<a:MessageID>urn:uuid:' + Xrm.CRMAuth.CreateGuid() + '</a:MessageID>');
    xml.push('<a:ReplyTo>');
    xml.push('<a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>');
    xml.push('</a:ReplyTo>');
    xml.push('<Security s:mustUnderstand="1" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<u:Timestamp  u:Id="' + Xrm.CRMAuth.CreateGuid() + '">');
    xml.push('<u:Created>' + now.toISOString() + '</u:Created>');
    xml.push('<u:Expires>' + new Date(now.setMinutes(now.getMinutes() + 60)).toISOString() + '</u:Expires>');
    xml.push('</u:Timestamp>');
    xml.push('<UsernameToken u:Id="' + Xrm.CRMAuth.CreateGuid() + '">');
    xml.push('<Username>' + username + '</Username>');
    xml.push('<Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + password + '</Password>');
    xml.push('</UsernameToken>');
    xml.push('</Security>');
    xml.push('<a:To s:mustUnderstand="1">' + usernamemixed + '</a:To>');
    xml.push('</s:Header>');
    xml.push('<s:Body>');
    xml.push('<trust:RequestSecurityToken xmlns:trust="http://docs.oasis-open.org/ws-sx/ws-trust/200512">');
    xml.push('<wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">');
    xml.push('<a:EndpointReference>');
    xml.push('<a:Address>' + urnAddress + '</a:Address>');
    xml.push('</a:EndpointReference>');
    xml.push('</wsp:AppliesTo>');
    xml.push('<trust:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</trust:RequestType>');
    xml.push('</trust:RequestSecurityToken>');
    xml.push('</s:Body>');
    xml.push('</s:Envelope>\n');

    var authentication = {};
    var request = xml.join('');
    var req = new XMLHttpRequest();
    req.open('POST', usernamemixed, false);
    req.setRequestHeader('Connection', 'Keep-Alive');
    req.setRequestHeader('Content-Type', 'application/soap+xml; charset=UTF-8');
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var token0 = $(req.response).find('e\\:CipherValue');
                var token1 = $(req.response).find('xenc\\:CipherValue');
                var keyIdentifer = $(req.response).find('o\\:KeyIdentifier');
                var issuerNameX509 = $(req.response).find('X509IssuerName');
                var serialNumberX509 = $(req.response).find('X509SerialNumber');
                var serverSecret = $($(req.response).find('trust\\:BinarySecret')[0]).text();
                var created = new Date(now.setMinutes(now.getMinutes() - 1)).toISOString();
                var expires = new Date(now.setMinutes(now.getMinutes() + 60)).toISOString();

                var timestamp = '<u:Timestamp xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" u:Id="_0"><u:Created>' + created + '</u:Created><u:Expires>' + expires + '</u:Expires></u:Timestamp>';
                var hashObj = new jsSHA(timestamp, 'TEXT');
                var digestValue = hashObj.getHash('SHA-1', 'B64', 1);
                var signedInfo = '<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#"><CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></CanonicalizationMethod><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#hmac-sha1"></SignatureMethod><Reference URI="#_0"><Transforms><Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></Transform></Transforms><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></DigestMethod><DigestValue>' + digestValue + '</DigestValue></Reference></SignedInfo>';
                var b64SignedInfo = Base64.encode(signedInfo);
                var shaObj = new jsSHA(b64SignedInfo, 'B64');
                var signatureValue = shaObj.getHMAC(serverSecret, 'B64', 'SHA-1', 'B64');
                authentication.TokenExpires = $(req.response).find('wsu\\:Expires:first').text();
                authentication.Header = Xrm.CRMAuth.CreateSOAPHeaderOnPremise(url, $(keyIdentifer[0]).text(), $(token0[0]).text(), $(token1[0]).text(), $(issuerNameX509[0]).text(), $(serialNumberX509[0]).text(), signatureValue, digestValue, created, expires);
            }
        }
    };
    req.send(request);
    return authentication;
};

/// <summary>Gets a CRM On Premise (IFD) SOAP header.</summary>
/// <param name="url" type="String">The Url of the CRM On Premise (IFD) organization (https://org.domain.com).</param>
/// <param name="keyIdentifer" type="String">The KeyIdentifier from the initial request.</param>
/// <param name="token0" type="String">The first token from the initial request.</param>
/// <param name="token1" type="String">The second token from the initial request.</param>
/// <param name="issuerNameX509" type="String">The certificate issuer.</param>
/// <param name="serialNumberX509" type="String">The certificate serial number.</param>
/// <param name="signatureValue" type="String">The hashsed value of the header signature.</param>
/// <param name="digestValue" type="String">The hashed value of the header timestamp.</param>
/// <param name="created" type="String">The header created date/time.</param>
/// <param name="expires" type="String">The header expiration date/tim.</param>
/// <returns type="String">The XML SOAP header to be used in future requests.</returns>
Xrm.CRMAuth.CreateSOAPHeaderOnPremise = function (url, keyIdentifer, token0, token1, issuerNameX509, serialNumberX509, signatureValue, digestValue, created, expires) {
    var xml = [];
    xml.push('<s:Header>');
    xml.push('<a:Action s:mustUnderstand="1">http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute</a:Action>');
    xml.push('<a:MessageID>urn:uuid:' + Xrm.CRMAuth.CreateGuid() + '</a:MessageID>');
    xml.push('<a:ReplyTo>');
    xml.push('<a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>');
    xml.push('</a:ReplyTo>');
    xml.push('<a:To s:mustUnderstand="1">' + url + 'XRMServices/2011/Organization.svc</a:To>');
    xml.push('<o:Security xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<u:Timestamp xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" u:Id="_0">');
    xml.push('<u:Created>' + created + '</u:Created>');
    xml.push('<u:Expires>' + expires + '</u:Expires>');
    xml.push('</u:Timestamp>');
    xml.push('<xenc:EncryptedData Type="http://www.w3.org/2001/04/xmlenc#Element" xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">');
    xml.push('<xenc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/>');
    xml.push('<KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">');
    xml.push('<e:EncryptedKey xmlns:e="http://www.w3.org/2001/04/xmlenc#">');
    xml.push('<e:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p">');
    xml.push('<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>');
    xml.push('</e:EncryptionMethod>');
    xml.push('<KeyInfo>');
    xml.push('<o:SecurityTokenReference xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<X509Data>');
    xml.push('<X509IssuerSerial>');
    xml.push('<X509IssuerName>' + issuerNameX509 + '</X509IssuerName>');
    xml.push('<X509SerialNumber>' + serialNumberX509 + '</X509SerialNumber>');
    xml.push('</X509IssuerSerial>');
    xml.push('</X509Data>');
    xml.push('</o:SecurityTokenReference>');
    xml.push('</KeyInfo>');
    xml.push('<e:CipherData>');
    xml.push('<e:CipherValue>' + token0 + '</e:CipherValue>');
    xml.push('</e:CipherData>');
    xml.push('</e:EncryptedKey>');
    xml.push('</KeyInfo>');
    xml.push('<xenc:CipherData>');
    xml.push('<xenc:CipherValue>' + token1 + '</xenc:CipherValue>');
    xml.push('</xenc:CipherData>');
    xml.push('</xenc:EncryptedData>');
    xml.push('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">');
    xml.push('<SignedInfo>');
    xml.push('<CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>');
    xml.push('<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#hmac-sha1"/>');
    xml.push('<Reference URI="#_0">');
    xml.push('<Transforms>');
    xml.push('<Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>');
    xml.push('</Transforms>');
    xml.push('<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>');
    xml.push('<DigestValue>' + digestValue + '</DigestValue>');
    xml.push('</Reference>');
    xml.push('</SignedInfo>');
    xml.push('<SignatureValue>' + signatureValue + '</SignatureValue>');
    xml.push('<KeyInfo>');
    xml.push('<o:SecurityTokenReference xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">');
    xml.push('<o:KeyIdentifier ValueType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.0#SAMLAssertionID">' + keyIdentifer + '</o:KeyIdentifier>');
    xml.push('</o:SecurityTokenReference>');
    xml.push('</KeyInfo>');
    xml.push('</Signature>');
    xml.push('</o:Security>');
    xml.push('</s:Header>');
    return xml.join('');
};

/// <summary>Gets the name of the AD FS server CRM uses for authentication.</summary>
/// <param name="url" type="String">The Url of the CRM On Premise (IFD) organization (https://org.domain.com).</param>
/// <returns type="String">The AD FS server url.</returns>
Xrm.CRMAuth.GetADFS = function (url) {
    var adfsUrl = null;
    var req = new XMLHttpRequest();
    req.open('GET', url + '/XrmServices/2011/Organization.svc?wsdl=wsdl0', false);
    req.setRequestHeader('Connection', 'Keep-Alive');
    req.setRequestHeader('Content-Type', 'application/soap+xml; charset=UTF-8');
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                adfsUrl = $(req.response).find('ms-xrm\\:Identifier');
            }
        }
    };
    req.send();
    return $(adfsUrl[0]).text().replace('http://', 'https://');
};

/// <summary>Creates a GUID.</summary>
/// <returns type="String">GUID.</returns>
Xrm.CRMAuth.CreateGuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

///Cross browser base 64 encoding
/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Base64 = {
    // private property
    _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    // public method for encoding
    encode: function (input) {
        var output = '';
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    decode: function (input) {
        var output = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = '';
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}