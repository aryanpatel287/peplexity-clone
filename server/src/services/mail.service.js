import nodemailer from 'nodemailer';
import Mailjet from 'node-mailjet';
import envConfig from '../config/envconfig.js';
import { sendEmailUsingGmailAPI } from './gmailapi.service.js';

// NodeMailer Service Using the GmailApi
let nodeMailerTransporter;
function initializeNodeMailer() {
    nodeMailerTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: envConfig.GOOGLE_USER,
            clientId: envConfig.GOOGLE_CLIENT_ID,
            clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
            refreshToken: envConfig.GOOGLE_REFRESH_TOKEN,
        },
    });

    nodeMailerTransporter
        .verify()
        .then(() => {
            console.log('email server is ready to send email');
        })
        .catch((error) => {
            console.error('Error connecting to the email server', error);
        });
}

//Note: To use the sendEmailWithNodeMailer function, make sure to call initializeNodeMailer() once application starts.
async function sendEmailWithNodeMailer({ to, subject, html, text }) {
    const mailOptions = {
        from: envConfig.GOOGLE_USER,
        to,
        subject,
        html,
        text,
    };

    const details = await nodeMailerTransporter.sendMail(mailOptions);
    console.log('email sent successfully');
    return {
        message: 'email sent successfully to ' + to,
    };
}

//Mailjet Service
let mailjet;
function initializeMailjet() {
    try {
        mailjet = Mailjet.apiConnect(
            envConfig.MJ_APIKEY_PUBLIC,
            envConfig.MJ_APIKEY_PRIVATE,
        );
        console.log('Mailjet is ready to send email');
    } catch (error) {
        console.error('Error connecting to Mailjet API: ', error);
        throw error;
    }
}

//Note: To use the sendEmailWithNodeMailer function, make sure to call initializeNodeMailer() once application starts.
async function sendEmailWithMailjet({ to, subject, html, text }) {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: envConfig.MJ_USER,
                    Name: 'Perplexity AI',
                },
                To: [
                    {
                        Email: to,
                        Name: 'Perplexity AI',
                    },
                ],
                Subject: subject,
                TextPart: text || '',
                HTMLPart: html,
            },
        ],
    });
    request
        .then((result) => {
            return {
                message: 'email sent successfully to ' + to,
            };
        })
        .catch((err) => {
            console.log(err.statusCode);
            throw err;
        });
}

export async function sendEmail({ to, subject, html, text }) {
    try {
        // return await sendEmailWithMailjet({ to, subject, html, text });
        const emailResponse = await sendEmailUsingGmailAPI({
            to,
            subject,
            html,
            text,
        });
        return emailResponse.message;
    } catch (error) {
        try {
            await initializeMailjet();
            return await sendEmailWithMailjet({ to, subject, html, text });
        } catch (error) {
            console.error('Error sending email: ', error);
            throw error;
            return 'Failed to send email to ' + to;
        }
    }
}
