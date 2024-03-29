'use strict';

/**
 * @namespace Account
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

server.extend(module.superModule);

/**
 * Checks if the email value entered is correct format
 * @param {string} email - email string to check if valid
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    return regex.test(email);
}

/**
 * Account-Show : The Account-Show endpoint will render the shopper's account page. Once a shopper logs in they will see is a dashboard that displays profile, address, payment and order information.
 * @name Base/Account-Show
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - registration - A flag determining whether or not this is a newly registered account
 * @param {category} - senstive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace(
    'Show',
    server.middleware.https,
    consentTracking.consent,
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var reportingURLs;

        // Get reporting event Account Open url
        if (req.querystring.registration && req.querystring.registration === 'submitted') {
            reportingURLs = reportingUrlsHelper.getAccountOpenReportingURLs(
                CustomerMgr.registeredCustomerCount
            );
        }

        var accountModel = accountHelpers.getAccountModel(req);






        var ssoService = require('*/cartridge/scripts/serviceGoogle');
        var Cookie = require('dw/web/Cookie');
        var auth_code;
        //var cookies = request.getHttpCookies();
        //var cookieCount = cookies.getCookieCount();
        var sessionTokenCookie;
        var refreshTokenCookie;
         /*for (var i = 0; i < cookieCount; i++) {
           if ('SESSION_COOKIE_NAME_GUEST' == cookies[i].getName()) {
                sessionTokenCookie = delete cookies[i];
            }
            if ('REFRESH_TOKEN_COOKIE_NAME_GUEST' == cookies[i].getName()) {
                refreshTokenCookie = delete cookies[i];
            }
            delete cookies[i];
        } */

      if(sessionTokenCookie == undefined && refreshTokenCookie) {
          var result = ssoService.getSSOAccessToken(1, 'refresh_token', refreshTokenCookie.value);
          if (
              result && result.access_token &&
              result.refresh_token
          ) {
              var sessioncookie    = new Cookie('SESSION_COOKIE_NAME_GUEST', 1);
              sessioncookie.setHttpOnly(true);
              sessioncookie.setSecure(true);
              sessioncookie.setDomain(request.httpHost);
              sessioncookie.setMaxAge(1800);
              sessioncookie.setPath('/');

              response.addHttpCookie(sessioncookie);
          }
      }
        if(sessionTokenCookie == undefined && refreshTokenCookie == undefined && req.httpParameterMap.code && req.httpParameterMap.code.value) {
            auth_code = req.httpParameterMap.code.value;
            var result = ssoService.getSSOAccessToken(auth_code, 'authorization_code');
            if (result && result.access_token && result.refresh_token) {
              var refreshcookie = new Cookie('REFRESH_TOKEN_COOKIE_NAME_GUEST', result.refresh_token);
              refreshcookie.setHttpOnly(true);
              refreshcookie.setSecure(true);
              refreshcookie.setDomain(request.httpHost);
              refreshcookie.setMaxAge(90 * 24 * 60 * 60);
              refreshcookie.setPath('/');

              response.addHttpCookie(refreshcookie);

              var sessioncookie = new Cookie('SESSION_COOKIE_NAME_GUEST', 1);
              sessioncookie.setHttpOnly(true);
              sessioncookie.setSecure(true);
              sessioncookie.setDomain(request.httpHost);
              sessioncookie.setMaxAge(1800);
              sessioncookie.setPath('/');

              response.addHttpCookie(sessioncookie);
          }
        }
        var userInfo;
        //var result = ssoService.getSSOAccessToken(auth_code, 'authorization_code');
        if (result != undefined && result.idp_access_token) {
            userInfo = ssoService.getIDPUserInfo(result.idp_access_token);

            if(userInfo){
                var CustomerMgr = require('dw/customer/CustomerMgr');
            var Transaction = require('dw/system/Transaction');
            var userID = userInfo.email;
            var authenticatedCustomerProfile = CustomerMgr.getExternallyAuthenticatedCustomerProfile(
                "google",
                userID
            );
            if (!authenticatedCustomerProfile) {
                // Create new profile
                Transaction.wrap(function () {
                    var newCustomer = CustomerMgr.createExternallyAuthenticatedCustomer(
                        "google",
                        userID
                    );
                    authenticatedCustomerProfile = newCustomer.getProfile();
                    var firstName;
                    var lastName;
                    var email;
                    // Google comes with a 'name' property that holds first and last name.
                        firstName = userInfo.given_name;
                        lastName = userInfo.family_name;
                    email = userInfo.email;
                    authenticatedCustomerProfile.setFirstName(firstName);
                    authenticatedCustomerProfile.setLastName(lastName);
                    authenticatedCustomerProfile.setEmail(email);
                });
            }
            var credentials = authenticatedCustomerProfile.getCredentials();
            if (credentials.isEnabled()) {
                Transaction.wrap(function () {
                    CustomerMgr.loginExternallyAuthenticatedCustomer("google", userID, false);
                });
            } else {
                res.render('/error', {
                    message: Resource.msg('error.oauth.login.failure', 'login', null)
                });
        }
        }else{
            res.redirect(URLUtils.url('Login-Show'));
        }

    }
    if(req.querystring.checkout){
        res.redirect(URLUtils.url('Checkout-Begin'));
    }











        res.render('account/accountDashboard', {
            account: accountModel,
            accountlanding: true,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                }
            ],
            reportingURLs: reportingURLs,
            payment: accountModel != null ? accountModel.payment : null,
            viewSavedPaymentsUrl: URLUtils.url('PaymentInstruments-List').toString(),
            addPaymentUrl: URLUtils.url('PaymentInstruments-AddPayment').toString(),
            user_info: userInfo
        });
        next();
    }

);

module.exports = server.exports();