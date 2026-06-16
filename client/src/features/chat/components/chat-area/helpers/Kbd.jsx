import React from 'react';
import '../../../styles/_kbd.scss';

const Kbd = ({ children, ...props }) => {
  return (
    <kbd className="markdown-kbd" {...props}>
      {children}
    </kbd>
  );
};

export default Kbd;
