import { ChevronDown } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import '../../../styles/_thinking-bubble.scss';

const ThinkingBubble = ({ thinking }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="thinking-bubble">
            <button
                className="thinking-toggle"
                onClick={() => setOpen((o) => !o)}
            >
                <span>Thought for a moment</span>
                <ChevronDown
                    size={14}
                    className={`chevron ${open ? 'open' : ''}`}
                />
            </button>
            {open && <div className="thinking-content">{thinking}</div>}
        </div>
    );
};

export default ThinkingBubble;
