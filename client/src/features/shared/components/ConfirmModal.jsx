import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/_confirm-modal.scss';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    variant = 'danger' // 'danger' | 'primary'
}) => {
    const [render, setRender] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setIsClosing(false);
        } else if (render) {
            setIsClosing(true);
            setTimeout(() => {
                setRender(false);
                setIsClosing(false);
            }, 190); // slightly less than CSS 0.2s duration
        }
    }, [isOpen]);

    if (!render) return null;

    return (
        <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`confirm-btn ${variant}`} onClick={() => {
                        onConfirm();
                        onClose();
                    }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
