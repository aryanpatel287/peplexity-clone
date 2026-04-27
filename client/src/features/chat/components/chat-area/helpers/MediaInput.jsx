import React, { useRef, useState } from 'react';
import { X, FileText, Plus } from 'lucide-react';
import '../../../styles/_media-input.scss';
import MediaLightbox from './MediaLightbox';

export const MediaPreviewStrip = ({ filePreviews, onRemoveFile }) => {
    const [lightbox, setLightbox] = useState(null); // { src, type }

    if (!filePreviews?.length) return null;

    const openLightbox = (file) => setLightbox({ src: file.preview, type: file.type });
    const closeLightbox = () => setLightbox(null);

    return (
        <>
            <div className="media-preview-strip">
                {filePreviews.map((file, index) => (
                    <div key={index} className="media-preview-item">
                        {file.type?.startsWith('image/') ? (
                            <img
                                src={file.preview}
                                alt={file.name}
                                className="media-preview-thumb"
                                onClick={() => openLightbox(file)}
                            />
                        ) : (
                            <div className="media-preview-doc" onClick={() => openLightbox(file)}>
                                <FileText size={16} />
                                <span>{file.name}</span>
                            </div>
                        )}
                        <button
                            type="button"
                            className="media-preview-remove"
                            onClick={() => onRemoveFile(index)}
                        >
                            <X size={11} />
                        </button>
                    </div>
                ))}
            </div>

            {lightbox && (
                <MediaLightbox
                    src={lightbox.src}
                    type={lightbox.type}
                    onClose={closeLightbox}
                />
            )}
        </>
    );
};

export const MediaAttachButton = ({ isUploading, isDisabled, onFileSelect }) => {
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        if (e.target.files?.length) {
            onFileSelect(e.target.files);
            e.target.value = '';
        }
    };

    return (
        <div className="media-attach">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleChange}
            />
            <button
                type="button"
                className={`attach-btn${isUploading ? ' uploading' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
            >
                {isUploading ? <div className="spinner-small" /> : <Plus size={18} />}
            </button>
        </div>
    );
};
