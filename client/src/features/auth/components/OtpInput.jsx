import React, { useRef } from 'react';

const OTP_LENGTH = 6;

const OtpInput = ({
    value = '',
    onChange,
    onComplete,
    disabled = false,
    hasError = false,
}) => {
    const boxes = Array.from({ length: OTP_LENGTH });
    const inputRefs = useRef([]);

    const focusBox = (index) => {
        const el = inputRefs.current[index];
        if (el) el.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (value[index]) {
                const next =
                    value.slice(0, index) + '' + value.slice(index + 1);
                onChange(next.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH));
            } else if (index > 0) {
                const next =
                    value.slice(0, index - 1) + '' + value.slice(index);
                onChange(next.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH));
                focusBox(index - 1);
            }
        }
    };

    const handleChange = (e, index) => {
        const char = e.target.value.slice(-1);
        if (!char) return;

        const next = value.slice(0, index) + char + value.slice(index + 1);
        const trimmed = next.slice(0, OTP_LENGTH);
        onChange(trimmed);

        if (index < OTP_LENGTH - 1) {
            focusBox(index + 1);
        }

        if (trimmed.length === OTP_LENGTH && !trimmed.includes('')) {
            onComplete?.(trimmed);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
        onChange(pasted.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH));
        const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
        focusBox(nextFocus);
        if (pasted.length === OTP_LENGTH) {
            onComplete?.(pasted);
        }
    };

    return (
        <div className="otp-input-group">
            {boxes.map((_, index) => {
                const char = value[index] || '';
                const isFilled = char !== '';
                const boxClass = [
                    'otp-box',
                    hasError ? 'otp-box--error' : '',
                    isFilled && !hasError ? 'otp-box--filled' : '',
                ]
                    .filter(Boolean)
                    .join(' ');

                return (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        className={boxClass}
                        type="text"
                        inputMode="text"
                        maxLength={1}
                        value={char}
                        disabled={disabled}
                        autoFocus={index === 0}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        autoComplete="one-time-code"
                        aria-label={`OTP digit ${index + 1}`}
                    />
                );
            })}
        </div>
    );
};

export default OtpInput;
