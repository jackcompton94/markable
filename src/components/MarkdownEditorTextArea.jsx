import React from 'react';

const MarkdownEditorTextarea = React.forwardRef(({ markdown, setMarkdown, handleKeyDown }, ref) => {
  return (
    <textarea
      className="editor-textarea"
      ref={ref}
      value={markdown}
      onChange={(e) => setMarkdown(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Enter your markdown here..."
    />
  );
});

export default MarkdownEditorTextarea;
