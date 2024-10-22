import React from 'react';

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

export default AuthForm;
