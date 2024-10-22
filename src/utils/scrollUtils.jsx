export const autoScrollPreview = (markdownRef, editorRef) => {
    if (markdownRef.current && editorRef.current) {
      const isAtBottom =
        editorRef.current.scrollTop + editorRef.current.clientHeight >=
        editorRef.current.scrollHeight - 100;
  
      if (isAtBottom) {
        markdownRef.current.scrollTop = markdownRef.current.scrollHeight;
      }
    }
  };
  
  export const handleScroll = (editor, markdown) => {
    if (markdown) {
      const scrollTop = editor.scrollTop;
      const scrollHeight = editor.scrollHeight - editor.clientHeight;
      const scrollPercentage = scrollTop / scrollHeight;
  
      markdown.scrollTop = scrollPercentage * (markdown.scrollHeight - markdown.clientHeight);
    }
  };
  