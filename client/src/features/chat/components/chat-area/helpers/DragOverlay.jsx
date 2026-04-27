import React from 'react';
import { createPortal } from 'react-dom';
import '../../../styles/_drag-overlay.scss';

const DragOverlay = ({ visible }) => {
    if (!visible) return null;

    return createPortal(
        <div className="drag-overlay">
            <div className="drag-overlay-content">
                <div className="drag-overlay-icon">
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                        <rect x="8" y="20" width="38" height="46" rx="5" fill="#32575c" opacity="0.9" />
                        <rect x="18" y="12" width="38" height="46" rx="5" fill="#3d6b72" opacity="0.9" />
                        <rect x="28" y="6" width="36" height="46" rx="5" fill="#468a93" opacity="0.95" />
                        <path d="M36 28 L50 28 M36 36 L50 36 M36 44 L44 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                        <circle cx="54" cy="48" r="12" fill="#32575c" />
                        <path d="M50 48 L54 52 L59 44" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h3 className="drag-overlay-title">Add anything</h3>
                <p className="drag-overlay-sub">Drop any file here to add it to the conversation</p>
            </div>
        </div>,
        document.body
    );
};

export default DragOverlay;
