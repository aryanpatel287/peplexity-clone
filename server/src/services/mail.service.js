import nodemailer from 'nodemailer';
import envConfig from '../config/envconfig.js';

//NodeMailer Service Using the GmailApi
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: envConfig.GOOGLE_USER,
        clientId: envConfig.GOOGLE_CLIENT_ID,
        clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
        refreshToken: envConfig.GOOGLE_REFRESH_TOKEN,
    },
});

transporter
    .verify()
    .then(() => {
        console.log('email server is ready to send email');
    })
    .catch((error) => {
        console.error('Error connecting to the email server', error);
    });

export async function sendEmail({ to, subject, html, text }) {
    const mailOptions = {
        from: envConfig.GOOGLE_USER,
        to,
        subject,
        html,
        text,
    };

    const details = await transporter.sendMail(mailOptions);
    console.log('email sent successfully');
    return 'email sent successfully to ' + to;
}
