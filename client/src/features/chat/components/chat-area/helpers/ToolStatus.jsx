import React from 'react';
import { Search, Check } from 'lucide-react';
import { TOOL_LABELS } from './chat.constants';
import '../../../styles/_tool-status.scss';

const ToolStatus = ({ toolName, done }) => {
    const info = TOOL_LABELS[toolName] ?? {
        icon: Search,
        label: toolName,
        doneLabel: toolName,
        doneIcon: Check,
        animation: '',
    };
    
    if (info.hidden) return null;

    const IconComponent = done ? info.doneIcon : info.icon;

    return (
        <div className={`tool-status ${done ? 'done' : 'active'}`}>
            <div className={`tool-icon-wrapper ${!done ? info.animation : ''}`}>
                <IconComponent size={14} className={done ? 'done-icon' : ''} />
            </div>
            <span>
                {done ? info.doneLabel : info.label}
                {done ? '.' : '...'}
            </span>
            {!done && (
                <div className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </div>
            )}
        </div>
    );
};

export default ToolStatus;
