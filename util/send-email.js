const nodemailer = require('nodemailer');

//https://myaccount.google.com/lesssecureapps

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noncetest2@gmail.com',
        pass: 'password123!@#'
    }
});

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

var mailOptions = {
    from: 'sender@gmail.com',
    to: '',
    subject: 'Test',
    text: 'Lorem ipsum'
};

const sendMail=(req, res, next) => {
    mailOptions.to = res.locals.result.email;
    if(req.headers.subject) 
        mailOptions.subject = req.headers.subject;
    if(req.headers.text)
        mailOptions.text = req.headers.text;
    else
        mailOptions.text = makeid(6);
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.locals.result.resultEmail={ success: false, error: error};
            next();
        }
        else{
            console.log('Email id: '+ info.response);
            res.locals.result.resultEmail={ success: true, error: 'none', text: mailOptions.text};
            next();
        }
    });
    return;
};

module.exports=sendMail;

