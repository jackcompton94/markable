import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where
} from 'firebase/firestore';

// Function to save a note
export const saveNote = async (userId, title, content) => {
    try {
        const docRef = await addDoc(collection(db, "notes"), {
            userId,
            title,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
            parentId: null, // Set parentId to null as specified
        });
        console.log("Note saved with ID: ", docRef.id);
        return docRef;
    } catch (e) {
        console.error("Error adding note: ", e);
        throw e;
    }
};

// Function to fetch notes for a specific user
export const fetchNotes = async (userId) => {
    const notesRef = collection(db, "notes");
    const q = query(notesRef, where("userId", "==", userId)); // Query only notes for the specific user
    const querySnapshot = await getDocs(q);

    // Map to notes
    const notes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    return notes; // Return the notes array for rendering in your app
};

// Function to delete a note by ID
export const deleteNote = async (noteId) => {
    try {
        await deleteDoc(doc(db, "notes", noteId));
        console.log(`Note with ID: ${noteId} deleted successfully.`);
    } catch (e) {
        console.error("Error deleting note: ", e);
        throw e; // Propagate the error for handling in the calling function
    }
};

// Function to update a note by ID
export const updateNote = async (noteId, updatedData) => {
    try {
        const noteRef = doc(db, "notes", noteId);
        await updateDoc(noteRef, {
            ...updatedData,
            updatedAt: new Date() // Update timestamp
        });
        console.log(`Note with ID: ${noteId} updated successfully.`);
    } catch (e) {
        console.error("Error updating note: ", e);
        throw e; // Propagate the error for handling in the calling function
    }
};
