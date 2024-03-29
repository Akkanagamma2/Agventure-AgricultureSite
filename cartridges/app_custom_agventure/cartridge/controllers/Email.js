'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var ArrayList = require('dw/util/ArrayList');

var server = require('server');
var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

server.post("Trigger",function(req,res,next){
    var list = new ArrayList();

    var Record = CustomObjectMgr.getCustomObject("footer-Email-lk",req.form.email);
    Transaction.wrap(function(){
        if(!Record){
            Record = CustomObjectMgr.createCustomObject("footer-Email-lk",req.form.email);
        }
    });

    const EmailObjlk = {};
    EmailObjlk.to = req.form.email;
    EmailObjlk.subject = "Thank you for Subscribing Agventure";
    EmailObjlk.from = "lkk@gmail.com";

    var templatelk = "Email/email2";

    const contextlk = {
        "email":req.form.email
    }
    emailHelpers.send(EmailObjlk,templatelk,contextlk);
    res.render('Email/email1',{email:contextlk.email});
    next();
});
module.exports=server.exports();