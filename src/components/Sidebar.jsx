import React from 'react';
import './Sidebar.css';

const NoteItem = ({ note, onSelectNote, onDeleteNote }) => {
    const handleDelete = (e) => {
        e.stopPropagation(); // Prevents onSelectNote from firing
        onDeleteNote(note.title);
    };

    return (
        <li className="note-item" onClick={() => onSelectNote(note.title)} style={{ cursor: 'pointer' }}>
            <span>{note.title}</span>
            <button className="delete-note-btn" onClick={handleDelete} aria-label={`Delete note: ${note.title}`}>
                &#10005;
            </button>
        </li>
    );
};

const NoteList = ({ notes, onSelectNote, onDeleteNote }) => {
    return (
        <ul className="note-list">
            {notes.map((note, index) => (
                <NoteItem key={index} note={note} onSelectNote={onSelectNote} onDeleteNote={onDeleteNote} />
            ))}
        </ul>
    );
};

const Sidebar = ({ notes, onSaveNote, noteTitle, setNoteTitle, buttonText, buttonColor, isButtonDisabled, isEditing, onCreateNewNote, onDeleteNote, onSelectNote }) => {
    const handleSaveNote = () => {
        if (noteTitle.trim() !== '') {
            onSaveNote(noteTitle);
        }
    };

    return (
        <div className="sidebar">
            <input
                type="text"
                className="note-title-input"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                aria-label="Note title input"
            />
            <button 
                className="save-note-btn" 
                onClick={handleSaveNote} 
                style={{ backgroundColor: buttonColor }}
                disabled={isButtonDisabled}
                aria-label={isButtonDisabled ? "Button disabled" : buttonText}
            >
                {buttonText}
            </button>
            <NoteList notes={notes} onSelectNote={onSelectNote} onDeleteNote={onDeleteNote} />
            {isEditing && (
                <button className="new-note-btn" onClick={onCreateNewNote} aria-label="Create new note">
                    New Note
                </button>
            )}
        </div>
    );
};

export default Sidebar;
