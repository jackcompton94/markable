import React, { useState, useEffect, useRef } from "react";
import { fetchNotes, saveNote, deleteNote, updateNote } from '../services/firestoreService';
import Sidebar from './Sidebar';
import MarkdownEditorTextarea from './MarkdownEditorTextarea';
import MarkdownPreview from './MarkdownPreview';
import { handleScroll, autoScrollPreview } from '../utils/scrollUtils';
import './MarkdownEditor.css'

export default function MarkdownEditor({ userId }) {
  const [markdown, setMarkdown] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const markdownRef = useRef(null);
  const editorRef = useRef(null);

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


  useEffect(() => {
    autoScrollPreview(markdownRef, editorRef);
  }, [markdown]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("scroll", () => handleScroll(editor, markdownRef.current));
    }
    return () => {
      if (editor) {
        editor.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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
        <MarkdownEditorTextarea 
          editorRef={editorRef}
          markdown={markdown}
          setMarkdown={setMarkdown}
          handleKeyDown={handleKeyDown}
        />
        <div className="divider" />
        <MarkdownPreview markdownRef={markdownRef} markdown={markdown} />
      </div>
    </div>
  );
}

