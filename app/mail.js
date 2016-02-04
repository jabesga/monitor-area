var nodemailer = require('nodemailer');

var mail_settings = require('../temp/settings.js');
var smtpConfig = mail_settings.gmailConfig
var transporter = nodemailer.createTransport(smtpConfig);

module.exports = {
    send_mail : function(mailOptions){
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('\tMessage sent: ' + info.response);
        });
    }
}