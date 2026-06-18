import { Resend } from 'resend';
import envConfig from '../../config/envconfig.js';

let resend;

try {
    if (envConfig.RESEND_API_KEY) {
        resend = new Resend(envConfig.RESEND_API_KEY);
        console.log('Resend API client initialized');
    } else {
        console.warn('Resend API Key is missing. Resend mail service is disabled.');
    }
} catch (error) {
    console.error('Error initializing Resend client: ', error);
    throw error;
}

/**
 * Sends an email using the Resend.com API.
 * 
 * @param {Object} params - Send parameters
 * @param {string|string[]} params.to - Recipient email address(es)
 * @param {string} params.subject - Email subject
 * @param {string} [params.html] - HTML content of the email
 * @param {string} [params.text] - Plain text content of the email
 * @returns {Promise<{success: boolean, messageId: string, message: string}>} Result payload
 */
export const sendEmailUsingResend = async ({ to, subject, html, text }) => {
    try {
        if (!resend) {
            throw new Error('Resend client is not initialized');
        }

        if (!to) {
            throw new Error('Recipient address ("to") is required');
        }

        if (!subject) {
            throw new Error('Email "subject" is required');
        }

        if (!html && !text) {
            throw new Error('Either "html" or "text" content must be provided');
        }

        const recipients = Array.isArray(to) ? to : [to];

        const payload = {
            from: `Perplexity <${envConfig.RESEND_USER}>`,
            to: recipients,
            subject,
        };

        if (html) {
            payload.html = html;
        }

        if (text) {
            payload.text = text;
        }

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error('Resend API returned error:', error);
            throw new Error(error.message || 'Resend API error');
        }

        return {
            success: true,
            messageId: data.id,
            message: 'email sent successfully to ' + recipients.join(', '),
        };
    } catch (error) {
        console.error('Error sending email via Resend service:', error);
        throw error;
    }
};
