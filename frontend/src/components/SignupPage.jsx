import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import "./SignupPage.css";

const API = import.meta.env.VITE_API_URL;

const SignupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    letters: false,
    numbers: false,
    special: false,
  });

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      letters: /[a-zA-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordRequirements(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!checkPasswordRequirements(password)) {
      setError("Please meet all password requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API}/auth/signup`, { // ✅ FIXED: was /signup
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ FIX: Handle both response formats:
        // Format 1: { token, username, email }
        // Format 2: { token, user: { username, email } }
        const savedUsername = data.username || data.user?.username || username;
        const savedEmail = data.email || data.user?.email || email;

        localStorage.setItem("username", savedUsername);
        localStorage.setItem("email", savedEmail);
        localStorage.setItem("token", data.token);

        alert("Signed up successfully!");
        navigate("/");
      } else {
        setError(data.error || data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Server not responding. Check backend.");
    }
  };

  return (
    <div className="signuppage-container">
      <div className="signuppage-card">
        <div className="signuppage-left">
          <h2 className="signuppage-welcome">Come join us!</h2>
          <p className="signuppage-message">
            We are so excited to have you here! Create an account to get access.
          </p>
          <button
            className="signuppage-signin-btn"
            onClick={() => navigate("/LoginPage")}
          >
            Already have an account? Sign in.
          </button>
        </div>

        <div className="signuppage-right">
          <h1 className="signuppage-title">Signup</h1>

          <form onSubmit={handleSubmit} className="signuppage-form">
            <input
              type="text"
              className="signuppage-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              className="signuppage-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="signuppage-input"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />

            <input
              type="password"
              className="signuppage-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <p className="signuppage-error">{error}</p>}

            <button type="submit" className="signuppage-submit-btn">
              Signup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;