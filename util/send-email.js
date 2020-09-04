const nodemailer = require('nodemailer');

//https://myaccount.google.com/lesssecureapps

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sender@gmail.com',
        pass: '******'
    }
});

var mailOptions = {
    from: 'sender@gmail.com',
    to: '',
    subject: 'Test',
    text: 'Lorem ipsum'
};

const sendMail=(req, res, next) => {
    mailOptions={
        to: req.headers.to,
        subject: req.headers.subject,
        text: req.headers.text
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.status(500).send({sucess: false, error: 'Internal sever error'});
            next();
        }
        else{
            console.log('Email id: '+ info.response);
            res.status(400).send({sucess: false, error: 'Bad request'});
            next();
        }
    });
};

module.exports=sendMail;

