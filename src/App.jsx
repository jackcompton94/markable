import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import MarkdownEditor from './components/MarkdownEditor';
import '../src/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUsername(user ? user.uid : '');
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
    setError(''); // Reset error when toggling
  };

  const createUserProject = async (userId) => {
    const response = await fetch('/api/createUserProject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || 'Failed to create project');
    }

    const projectResponse = await response.json();
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
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleInputChange}
          required
        />
        <InputField
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleInputChange}
          required
        />
        {isRegistering && (
          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleInputChange}
            required
          />
        )}
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="auth-submit-btn">
          {isRegistering ? "Register" : "Login"}
        </button>

        <span className="switch-mode-link" onClick={toggleRegistering}>
          {isRegistering ? "Already have an account? Click here to Login" : "Need an account? Click here to Register"}
        </span>
      </form>
    </div>
  );
}

function InputField({ type, name, placeholder, value, onChange, required }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

export default App;
