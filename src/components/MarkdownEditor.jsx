import React, { useState, useEffect, useRef } from "react";
import { fetchNotes, saveNote, deleteNote, updateNote } from '../services/firestoreService';
import Sidebar from './Sidebar';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import './MarkdownEditor.css';

export default function MarkdownEditor({ userId }) {
  const [markdown, setMarkdown] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const markdownRef = useRef(null);
  const editorRef = useRef(null);

  // Handle scrolling sync between textarea and preview
  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current && markdownRef.current) {
        const scrollTop = editorRef.current.scrollTop;
        const scrollHeight = editorRef.current.scrollHeight - editorRef.current.clientHeight;
        const scrollPercentage = scrollTop / scrollHeight;

        markdownRef.current.scrollTop = scrollPercentage * (markdownRef.current.scrollHeight - markdownRef.current.clientHeight);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (editor) {
        editor.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Auto-scroll the markdown preview when at the bottom of the editor
  useEffect(() => {
    if (markdownRef.current && editorRef.current) {
      const isAtBottom = 
        editorRef.current.scrollTop + editorRef.current.clientHeight >= 
        editorRef.current.scrollHeight - 100;

      if (isAtBottom) {
        markdownRef.current.scrollTop = markdownRef.current.scrollHeight;
      }
    }
  }, [markdown]);
  
  // Auto fetch notes when component mounts
  useEffect(() => {
    const fetchNoteTitles = async () => {
      if (!userId) return; // Prevent fetching if userId is not set
      try {
        const fetchedNotes = await fetchNotes(userId);
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching note titles:', error);
      }
    };

    fetchNoteTitles();
  }, [userId]);

  const handleSaveNote = async (title) => {
    if (!title.trim()) return; // Prevent saving if title is empty
    const newNote = { title, content: markdown };

    try {
      const existingNoteIndex = notes.findIndex(note => note.title === title);

      if (existingNoteIndex > -1) {
        // Update existing note
        const noteId = notes[existingNoteIndex].id;
        await updateNote(noteId, { title, content: markdown });
        setNotes(prevNotes => {
          const updatedNotes = [...prevNotes];
          updatedNotes[existingNoteIndex] = { ...updatedNotes[existingNoteIndex], content: markdown };
          return updatedNotes;
        });
      } else {
        // Save a new note
        const docRef = await saveNote(userId, title, markdown);
        setNotes(prevNotes => [...prevNotes, { id: docRef.id, ...newNote }]);
      }

      // Reset form
      setNoteTitle('');
      setMarkdown('');
      setOriginalContent('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const selectNote = async (title) => {
    setNoteTitle(title);
    const selectedNote = notes.find(note => note.title === title);
    if (selectedNote) {
      setMarkdown(selectedNote.content);
      setOriginalContent(selectedNote.content);
    }
  };

  const handleDeleteNote = async (title) => {
    const noteToDelete = notes.find(note => note.title === title);
    if (noteToDelete) {
      try {
        await deleteNote(noteToDelete.id);
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
        createNewNote(); // Reset the editor
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const tab = "\t";
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setMarkdown(prevMarkdown => 
        prevMarkdown.substring(0, start) + tab + prevMarkdown.substring(end)
      );
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + tab.length;
      }, 0);
    }
  };

  const createNewNote = () => {
    setNoteTitle('');
    setMarkdown('');
    setOriginalContent('');
  };

  const hasUnsavedChanges = markdown !== originalContent;
  const isEditing = noteTitle && originalContent;
  const buttonText = isEditing ? 'Edit Note' : 'Save Note';
  const buttonColor = isEditing 
    ? (hasUnsavedChanges ? '#B8860B' : '#ccc') 
    : '#007acc'; 
  const isButtonDisabled = isEditing && !hasUnsavedChanges;

  return (
    <div className="markdown-editor">
      <div className="editor-container">
        <Sidebar 
          notes={notes} 
          onSaveNote={handleSaveNote} 
          onSelectNote={selectNote}
          noteTitle={noteTitle}
          setNoteTitle={setNoteTitle}
          buttonText={buttonText}
          buttonColor={buttonColor}
          isButtonDisabled={isButtonDisabled}
          isEditing={isEditing}
          onCreateNewNote={createNewNote}
          onDeleteNote={handleDeleteNote}
        />
        <textarea
          className="editor-textarea"
          ref={editorRef} // Use ref for the textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your markdown here..."
        />
        <div className="divider" />
        <div className="markdown-preview" ref={markdownRef} style={{ width: '100%', height: '400px', overflowY: 'auto' }}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
