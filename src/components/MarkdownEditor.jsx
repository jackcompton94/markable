import React, { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import './MarkdownEditor.css'
import Sidebar from './Sidebar'

const DW_AUTH_TOKEN = import.meta.env.VITE_DW_AUTH_TOKEN
const DW_BASE_URL = import.meta.env.VITE_DW_BASE_URL

export default function MarkdownEditor({username}) {
  const [markdown, setMarkdown] = useState('')
  const [notes, setNotes] = useState([]) 
  const [noteTitle, setNoteTitle] = useState('') 
  const [originalContent, setOriginalContent] = useState('') 
  const markdownRef = useRef(null)
  const editorRef = useRef(null)

  // Auto-scroll the markdown preview
  useEffect(() => {
    if (markdownRef.current && editorRef.current) {
      // Only auto-scroll if the user is at the bottom of the editor
      const isAtBottom =
        editorRef.current.scrollTop + editorRef.current.clientHeight >=
        editorRef.current.scrollHeight - 100

      if (isAtBottom) {
        markdownRef.current.scrollTop = markdownRef.current.scrollHeight
      }
    }
  }, [markdown])

  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current && markdownRef.current) {
        const scrollTop = editorRef.current.scrollTop
        const scrollHeight = editorRef.current.scrollHeight - editorRef.current.clientHeight
        const scrollPercentage = scrollTop / scrollHeight
  
        markdownRef.current.scrollTop = scrollPercentage * (markdownRef.current.scrollHeight - markdownRef.current.clientHeight)
      }
    }
  
    const editor = editorRef.current
    if (editor) {
      editor.addEventListener("scroll", handleScroll)
    }
    return () => {
      if (editor) {
        editor.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Fetch all note titles on component mount
  useEffect(() => {
    const fetchNoteTitles = async () => {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${DW_AUTH_TOKEN}`
        }
      }

      try {
        const response = await fetch(`${DW_BASE_URL}/projects/markable-repo/${username}`, options)
        const data = await response.json()
        const titles = data.files.map(file => ({title: file.name}))
        setNotes(titles)
      } catch (error) {
        console.error('Error fetching note titles:', error)
      }
    }

    fetchNoteTitles()
  }, [])

  const saveNote = async (title) => {
    if (!title.trim()) return

    const newNote = { title, content: markdown }

    try {
      const formData = new FormData()
      formData.append('file', new Blob([markdown], { type: 'text/markdown' }), title)

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${DW_AUTH_TOKEN}`
        },
        body: formData,
      }

      await fetch(`${DW_BASE_URL}/uploads/markable-repo/${username}/files`, options)

      // Update local notes array
      const existingNoteIndex = notes.findIndex(note => note.title === title)
      if (existingNoteIndex > -1) {
        const updatedNotes = [...notes]
        updatedNotes[existingNoteIndex] = newNote
        setNotes(updatedNotes)
      } else {
        setNotes(prevNotes => [...prevNotes, newNote])
      }

      setNoteTitle('') 
      setMarkdown('') 
      setOriginalContent('')
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const selectNote = async (title) => {
    setNoteTitle(title)
    const options = {
      method: 'GET',
      headers: {
        accept: '*/*',
        authorization: `Bearer ${DW_AUTH_TOKEN}`
      }
    }

    try {
      const response = await fetch(`${DW_BASE_URL}/file_download/markable-repo/${username}/${encodeURIComponent(title)}`, options)
      const data = await response.text()
      setMarkdown(data)
      setOriginalContent(data)
    } catch (error) {
      console.error('Error fetching note content:', error)
    }
  }

  const deleteNote = async (title) => {
    const options = {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${DW_AUTH_TOKEN}`
      }
    }

    try {
      const response = await fetch(`${DW_BASE_URL}/datasets/markable-repo/${username}/files/${encodeURIComponent(title)}`, options)
      
      if (response.ok) {
        console.log(`Deleted note titled "${title}" successfully.`)

        // Optimistically delete
        setNotes((prevNotes) => prevNotes.filter(note => note.title !== title))
        createNewNote()
      } else {
        console.error('Failed to delete note:', response.statusText)
        }
        } catch (error) {
          console.error('Error deleting note:', error)
        }
  }

  const handleKeyDown = (e) => {

    if (e.key === "Tab") {
      e.preventDefault()
      const tab = "\t"
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      
      setMarkdown(prevMarkdown => 
        prevMarkdown.substring(0, start) + tab + prevMarkdown.substring(end)
      )

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + tab.length
      }, 0)
    }
  }

  const createNewNote = () => {
    setNoteTitle('')
    setMarkdown('')
    setOriginalContent('')
  }

  // Determine editing state and button properties
  const hasUnsavedChanges = markdown !== originalContent
  const isEditing = noteTitle && originalContent
  const buttonText = isEditing ? 'Edit Note' : 'Save Note'
  let buttonColor = isEditing 
    ? (hasUnsavedChanges ? '#B8860B' : '#ccc') // Yellow or grey based on unsaved changes
    : '#007acc' // Default color for new notes
  const isButtonDisabled = isEditing && !hasUnsavedChanges

  return (
    <div className="markdown-editor">
      <div className="editor-container">
      <Sidebar 
        notes={notes} 
        onSaveNote={saveNote} 
        onSelectNote={selectNote}
        noteTitle={noteTitle}
        setNoteTitle={setNoteTitle}
        buttonText={buttonText}
        buttonColor={buttonColor}
        isButtonDisabled={isButtonDisabled}
        isEditing={isEditing}
        onCreateNewNote={createNewNote}
        onDeleteNote={deleteNote}
      />
        <textarea
          className="editor-textarea"
          ref={editorRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your markdown here..."
        />
        <div className="divider" />
        <div className="markdown-preview" ref={markdownRef}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
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
                )
              }
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
