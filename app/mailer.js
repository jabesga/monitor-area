var nodemailer = require('nodemailer');

var settings = require('../temp/settings');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: settings.gmail.user,
        pass: settings.gmail.password
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

module.exports = {
    sendMail: function(options, callback){
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: settings.gmail.user, // sender address
            to: options['to'], // list of receivers
            subject: 'Cuenta de monitor creada en el Area de monitores de Camptecnologico', // Subject line
            text: options['text'], // plaintext body
            html: options['html'] // html body
        };  
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
                callback(error);
            }
            else{
                console.log('Message sent: ' + info.response);
                callback('sent');
            }
        });
    }
}