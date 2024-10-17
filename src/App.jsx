import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import MarkdownEditor from './components/MarkdownEditor';
import '../src/App.css';

const DW_AUTH_TOKEN = import.meta.env.VITE_DW_AUTH_TOKEN;

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUsername(user.uid);
      } else {
        setUser(null);
        setUsername('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = form;

    // Reset error message
    setError('');

    // Check if passwords match when registering
    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProject(userCredential.user.uid.toLowerCase());
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
    setError(''); // Reset the error when toggling
  };

  const createUserProject = async (userId) => {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${DW_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        visibility: 'OPEN',
        title: userId
      })
    };
    const response = await fetch('https://api.data.world/v0/projects/markable-repo', options);
    const projectResponse = await response.json();

    if (!response.ok) {
      throw new Error(projectResponse.message || 'Failed to create project');
    }

    console.log("Project created successfully:", projectResponse);
  };

  return (
    <div>
      {user ? (
        <MarkdownEditor username={username.toLowerCase()} />
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

function AuthForm({ form, handleInputChange, handleAuth, isRegistering, toggleRegistering, error }) {
  return (
    <div className="auth-form-container">
      <h1>Markable</h1>
      <form className="auth-form" onSubmit={handleAuth}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleInputChange}
          required
        />
        {isRegistering && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword || ""}
            onChange={handleInputChange}
            required
          />
        )}
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="auth-submit-btn">
          {isRegistering ? "Register" : "Login"}
        </button>

        {/* Switch Mode Link-like Button */}
        <span className="switch-mode-link" onClick={toggleRegistering}>
          {isRegistering ? "Already have an account? Click here to Login" : "Need an account? Click here to Register"}
        </span>
      </form>
    </div>
  );
}

export default App;
