(function () {
    'use strict';

    WinJS.UI.Pages.define('/pages/home/home.html', {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            element.querySelector('#login').addEventListener('click', this.loginClick, false);
        },

        loginClick: function () {
            var authHeader;
            var url = document.getElementById('url').value;
            if (!url.match(/\/$/)) url += '/';
            
            //Username format could be domain\\username or username in the form of an email
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            //CRM Online or On-Premise IFD
            if (document.getElementById('url').value.indexOf('dynamics.com') !== -1) {
                authHeader = Xrm.CRMAuth.GetHeaderOnline(url, username, password);
            } else {
                authHeader = Xrm.CRMAuth.GetHeaderOnPremise(url, username, password);
            }

            if (authHeader !== null && authHeader != undefined) {
                WinJS.Application.sessionState.authHeader = authHeader.Header;
                WinJS.Application.sessionState.url = url;

                WinJS.Navigation.navigate('/pages/whoami/whoami.html');
            }
        }
    });
})();
