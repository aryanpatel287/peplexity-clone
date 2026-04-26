import { Search, Mail, MailCheck, SearchCheck } from 'lucide-react';

export const TOOL_LABELS = {
    searchInternetTool: {
        icon: Search,
        label: 'Searching the web',
        doneLabel: 'Searched the web',
        doneIcon: SearchCheck,
        animation: 'search-pulse',
    },
    emailTool: {
        icon: Mail,
        label: 'Sending email',
        doneLabel: 'Sent email',
        doneIcon: MailCheck,
        animation: 'mail-float',
    },
    getCurrentDateTime: {
        hidden: true,
    },
};
