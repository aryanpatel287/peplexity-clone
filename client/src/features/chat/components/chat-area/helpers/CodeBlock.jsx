import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Use the tomorrow Prism style, which fits beautifully with our charcoal palette
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clipboard, Check } from 'lucide-react';
import '../../../styles/_code-block.scss';

const CodeBlock = React.memo(({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }, [code]);

  return (
    <div className="code-block-card">
      <div className="code-block-card__header">
        <span className="code-block-card__language">{language || 'text'}</span>
        <button
          className="code-block-card__copy-btn"
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          title="Copy Code"
        >
          {copied ? (
            <>
              <Check className="copy-success-icon" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Clipboard className="copy-default-icon" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={tomorrow}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: 'transparent',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
