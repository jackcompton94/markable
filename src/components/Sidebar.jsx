import React from 'react'
import './Sidebar.css'

const Sidebar = ({ notes, onSaveNote, onSelectNote, noteTitle, setNoteTitle, buttonText, buttonColor, isButtonDisabled, isEditing, onCreateNewNote, onDeleteNote }) => {
    const handleSaveNote = () => {
        if (noteTitle.trim() !== '') {
            onSaveNote(noteTitle)
        }
    }

    return (
        <div className="sidebar">
            <input
                type="text"
                className="note-title-input"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
            />
            <button 
                className="save-note-btn" 
                onClick={handleSaveNote} 
                style={{ backgroundColor: buttonColor, cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }}
                disabled={isButtonDisabled}
            >
                {buttonText}
            </button>
            <ul className="note-list">
                {notes.map((note, index) => (
                    <li 
                        key={index} 
                        className="note-item" 
                        onClick={() => onSelectNote(note.title)} 
                        style={{ cursor: 'pointer' }}
                    >
                        <span>{note.title}</span>
                        <button 
                            className="delete-note-btn" 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents onSelectNote from firing
                                onDeleteNote(note.title);
                            }}
                        >
                            &#10005;
                        </button>
                    </li>
                ))}
            </ul>
            {isEditing && (
                <button 
                    className="new-note-btn" 
                    onClick={onCreateNewNote}>New Note
                </button>
            )}
        </div>
    )
}

export default Sidebar
