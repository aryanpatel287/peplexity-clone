import { sendEmailUsingGmailAPI } from './gmail.mail.service.js';
import { sendEmailUsingResend } from './resend.mail.service.js';

export async function sendEmail({ to, subject, html, text }) {
    try {
        const emailResponse = await sendEmailUsingResend({
            to,
            subject,
            html,
            text,
        });

        return emailResponse.message;
    } catch (error) {
        console.error('Error sending email via Resend: ', error);
        console.log('Attempting fallback to Gmail API...');
        
        try {
            const emailResponse = await sendEmailUsingGmailAPI({
                to,
                subject,
                html,
                text,
            });

            return emailResponse.message;
        } catch (gmailError) {
            console.error('Error sending email via Gmail API: ', gmailError);
            return 'Failed to send email to ' + to;
        }
    }
}
