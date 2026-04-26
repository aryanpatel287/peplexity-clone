import { tool } from 'langchain';
import * as z from 'zod';
import { sendEmail } from './mail.service.js';
import { searchWeb } from './internet.service.js';

const emailTool = tool(sendEmail, {
    name: 'emailTool',
    description: 'Use this tool to send an email',
    schema: z.object({
        to: z.string().describe("The recipient's email address"),
        html: z.string().describe('The HTML content of the email'),
        subject: z.string().describe('The subject of the email'),
    }),
});

const searchInternetTool = tool(searchWeb, {
    name: 'searchInternetTool',
    description:
        'Use this tool to search for the latest information on internet.',
    schema: z.string().describe('The query to search on web'),
});

const getCurrentDateTimeTool = tool(
    async () => {
        const now = new Date();

        const formatted = now.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'medium',
        });

        const iso = now.toISOString();

        return JSON.stringify({
            readable: formatted,
            iso,
            timezone: 'Asia/Kolkata',
        });
    },
    {
        name: 'getCurrentDateTime',
        description:
            "Returns the current date and time in the user's timezone. Use this when the user asks about current time, today, now, or date.",
    },
);

export { emailTool, searchInternetTool, getCurrentDateTimeTool };
