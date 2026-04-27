import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const MediaLightbox = ({ src, type, onClose }) => {
    if (!src) return null;

    const isImage = type?.startsWith('image/') || type === 'image';

    return createPortal(
        <div className="media-lightbox" onClick={onClose}>
            <button type="button" className="media-lightbox-close" onClick={onClose}>
                <X size={18} />
            </button>
            {isImage ? (
                <img src={src} alt="Preview" onClick={(e) => e.stopPropagation()} />
            ) : (
                <iframe
                    src={src}
                    title="PDF Preview"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </div>,
        document.body
    );
};

export default MediaLightbox;
