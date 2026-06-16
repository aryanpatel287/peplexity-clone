import React, { useLayoutEffect, useRef } from 'react';
import mermaid from 'mermaid';
import '../../../styles/_mermaid.scss';

// Initialize Mermaid with safe dark-mode options
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    background: '#171615',
    primaryColor: '#252421',
    primaryTextColor: '#ffffff',
    lineColor: '#468a93',
  }
});

const Mermaid = React.memo(({ chart }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    let isMounted = true;
    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    const renderDiagram = async () => {
      if (!chart) return;
      try {
        const { svg } = await mermaid.render(id, chart);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        // Clean up Mermaid's temporary elements if they exist in the DOM
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
        
        // Render fallback code view during streaming or on syntax error
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `<pre class="mermaid-container__fallback"><code>${chart}</code></pre>`;
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    };
  }, [chart]);

  return <div className="mermaid-container" ref={containerRef} />;
});

Mermaid.displayName = 'Mermaid';

export default Mermaid;
