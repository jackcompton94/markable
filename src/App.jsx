import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import MarkdownEditor from './components/MarkdownEditor';
import AuthForm from './components/AuthForm';
import '../src/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
    });
    return () => unsubscribe();
}, []);


  const handleInputChange = ({ target: { name, value } }) => {
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = form;
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setForm({ email: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error(`Error ${isRegistering ? 'registering' : 'logging in'}:`, error);
      setError(error.message);
    }
  };

  const toggleRegistering = () => {
    setIsRegistering(prev => !prev);
    setError(''); // Reset error when toggling
  };

  return (
    <div>
      {user ? (
        <MarkdownEditor userId={user.uid} />
      ) : (
        <AuthForm 
          form={form}
          handleInputChange={handleInputChange}
          handleAuth={handleAuth}
          isRegistering={isRegistering}
          toggleRegistering={toggleRegistering}
          error={error}
        />
      )}
    </div>
  );
}

export default App;
