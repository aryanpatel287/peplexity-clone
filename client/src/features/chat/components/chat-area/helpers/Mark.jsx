import React from 'react';
import '../../../styles/_mark.scss';

const Mark = ({ children, ...props }) => {
  return (
    <mark className="markdown-mark" {...props}>
      {children}
    </mark>
  );
};

export default Mark;
