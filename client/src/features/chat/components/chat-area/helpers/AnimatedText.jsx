import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import '../../../styles/_animated-text.scss';

const AnimatedText = ({ text, speed, onDone }) => {
    const [displayed, setDisplayed] = useState('');
    const indexRef = useRef(0);
    const startTimeRef = useRef(0);
    const onDoneRef = useRef(onDone);

    // Keep onDone ref updated to avoid re-triggering effect if onDone changes
    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayed('');

        if (!text) {
            onDoneRef.current?.();
            return;
        }

        // Calculate dynamic speed if not explicitly provided:
        // - Default base speed is 2.5ms per character.
        // - Capped total duration to ~1000ms max.
        const calculatedSpeed = speed !== undefined 
            ? speed 
            : Math.min(2.5, 1000 / text.length);

        if (calculatedSpeed <= 0.05) {
            setDisplayed(text);
            onDoneRef.current?.();
            return;
        }

        startTimeRef.current = Date.now();
        let intervalId;

        const updateProgress = () => {
            const timePassed = Date.now() - startTimeRef.current;
            const targetIndex = Math.min(
                Math.floor(timePassed / calculatedSpeed),
                text.length
            );

            if (targetIndex !== indexRef.current) {
                indexRef.current = targetIndex;
                setDisplayed(text.slice(0, targetIndex));
            }

            if (targetIndex >= text.length) {
                clearInterval(intervalId);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                onDoneRef.current?.();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateProgress();
            }
        };

        // Run interval at a standard tick rate (e.g. 10ms or calculatedSpeed, whichever is larger/safer)
        const tickRate = Math.max(10, Math.min(50, calculatedSpeed));
        intervalId = setInterval(updateProgress, tickRate);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [text, speed]);

    return (
        <MarkdownRenderer content={displayed} />
    );
};

export default AnimatedText;
