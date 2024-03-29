'use strict';
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');

/**
 * SSO
 * @returns {Object} SSO Service
 */
function initializeService() {
    return LocalServiceRegistry.createService('http.sso.token.google', {
        createRequest: function(service, args) {
            service.setURL(service.getURL() + '/token');
        },
        parseResponse: function (response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        },
    });
}


/**
 * service call to get access token
 * @param {{Object}}serviceRequest - input
 * @returns{{string}} access token
 */



function getSSOAccessToken(auth_code, grant_type, refresh_token) {
    //var client_idd='c99a74c7-271b-437c-a38c-9374f68cca6b';
    //var client_secret='rETaKOk6CvLGo1APqhVrHxejbg1c9cuhPQ9jDWnuRNc';
    //var base64 = require('dw/util/StringUtils').encodeBase64(client_idd + ':' + client_secret);
    var authResult;
    var service = initializeService();

    var config = service.getConfiguration();
    var credential = config.getCredential();
    var user = credential.getUser();
    var password = credential.getPassword();
    var base64 = require('dw/util/StringUtils').encodeBase64(user + ':' + password);

    service.setRequestMethod('POST');
    service.addHeader('Content-Type','application/x-www-form-urlencoded');
    service.addHeader('Authorization', 'Basic ' + base64);
    service.addParam('client_id',Site.current.getCustomPreferenceValue('SSO_Client_id'));
    service.addParam('redirect_uri',Site.current.getCustomPreferenceValue('SSO_Redirect_uri'));
    service.addParam('channel_id',Site.current.getCustomPreferenceValue('SSO_Channel_id'));
    if (grant_type == 'authorization_code') {
        service.addParam('code',auth_code);
    } else if (grant_type == 'refresh_token') {
        service.addParam('refresh_token', refresh_token);
    }
    service.addParam('grant_type', grant_type);
    var responseObject;
    try {
        responseObject = service.call();
        if(responseObject.object &&
            responseObject.object.client &&
            responseObject.object.client.text) {
                authResult = JSON.parse(responseObject.object.client.text);
            }
    } catch (e) {
        Logger.error('Exception : ' + e);
    }
    return authResult;
}

/**
 * SSO - userinfo
 * @returns {Object} SSO Service (Get user info)
 */
function initializeUserInfoGetService() {
    return LocalServiceRegistry.createService('http.sso.userinfo.google', {
        createRequest: function(service, args) {
            service.setURL(service.getURL());
        },
        parseResponse: function (response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        },
    });
}

/**
 * service call to get IDP user info
 * @param {{Object}}serviceRequest - input
 * @returns{{string}} User Info
 */
function getIDPUserInfo(idp_token) {
    var authResult;
    var service = initializeUserInfoGetService();
    service.setRequestMethod('GET');
    service.addHeader('Authorization', 'Bearer '+idp_token);
    var responseObject;
    try {
        responseObject = service.call();
        if(responseObject.object &&
            responseObject.object.client &&
            responseObject.object.client.text) {
                authResult = JSON.parse(responseObject.object.client.text);
            }
    } catch (e) {
        Logger.error('Exception : ' + e);
    }

    return authResult;
}


module.exports = {
    getSSOAccessToken: getSSOAccessToken,
    getIDPUserInfo: getIDPUserInfo
};