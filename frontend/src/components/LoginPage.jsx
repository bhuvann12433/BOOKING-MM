import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const API = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${API}/auth/login`, { // ✅ FIXED: was /login, must be /auth/login
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);

        alert("Logged in successfully!");
        navigate("/");
      } else {
        setError(data.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("Server not responding. Check backend.");
    }
  };

  return (
    <div className="loginpage-background">
      <div className="loginpage-container">
        <div className="loginpage-card">
          <div className="loginpage-left">
            <h2 className="loginpage-welcome">Welcome Back!</h2>
            <p className="loginpage-message">
              We are glad to see you again. Please log in to access your
              account.
            </p>
            <button
              className="loginpage-signup-btn"
              onClick={() => navigate("/SignupPage")}
            >
              Don&apos;t have an account? Sign up.
            </button>
          </div>

          <div className="loginpage-right">
            <h1 className="loginpage-title">Login</h1>

            <form onSubmit={handleSubmit} className="loginpage-form">
              <input
                type="email"
                className="loginpage-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="loginpage-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="loginpage-error">{error}</p>}

              <button type="submit" className="loginpage-submit-btn">
                Login
              </button>
            </form>

            <div className="loginpage-divider">OR</div>

            <div className="loginpage-social">
              <button className="loginpage-google-btn">
                Login with Google
              </button>
              <button className="loginpage-facebook-btn">
                Login with Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;