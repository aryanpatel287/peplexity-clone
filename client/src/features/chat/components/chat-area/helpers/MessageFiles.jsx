import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import MediaLightbox from './MediaLightbox';

const MessageFiles = ({ files }) => {
    const [lightbox, setLightbox] = useState(null); // { src, type }

    if (!files || files.length === 0) return null;

    const openLightbox = (file) => {
        setLightbox({
            src: file.url || file.preview,
            type: file.mimetype || file.type || (file.fileType === 'image' ? 'image/' : 'application/pdf')
        });
    };

    const closeLightbox = () => setLightbox(null);

    return (
        <>
            <div className="media-preview-strip message-files">
                {files.map((file, index) => {
                    const isImage = file.mimetype?.startsWith('image/') || file.fileType === 'image' || file.type?.startsWith('image/');
                    const src = file.url || file.preview;

                    return (
                        <div key={index} className="media-preview-item">
                            {isImage ? (
                                <img
                                    src={src}
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
                        </div>
                    );
                })}
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

export default MessageFiles;
