import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";
import "./Login.css";
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const destination = location.state?.from?.pathname || "/";
 const saveTokensAndNavigate = useCallback((data) => {
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  window.dispatchEvent(new Event("auth-changed"));
  navigate(destination, { replace: true });
}, [destination, navigate]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("auth/login/", formData);
      saveTokensAndNavigate(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleCredential = useCallback(async (response) => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await api.post("accounts/google-login/", {
        credential: response.credential,
      });
      saveTokensAndNavigate(result.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  }, [saveTokensAndNavigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
  return;
}
    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId);

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (script) {
      script.addEventListener("load", initializeGoogle);
    } else {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        setError("Unable to load Google sign-in. Please try again.");
      };
      document.head.appendChild(script);
    }
    return () => {
      script?.removeEventListener("load", initializeGoogle);
    };
  }, [handleGoogleCredential]);

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in"
      description="Enter your details to continue your QELVORA experience."
      sideEyebrow="THE ART OF PERSONAL STYLE"
      sideTitle="Style is a way to say who you are."
      sideText="Clothing, bags, footwear, watches, jewelry and accessories, all in one place."
      bottomText="Don't have an account?"
      bottomLink="/register"
      bottomLinkText="Create account"
    >
      {location.state?.registered && (
        <p className="auth-success">
          Account created successfully. Please sign in.
        </p>
      )}
     {error && <p className="auth-error">{error}</p>}
      {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
  <p className="auth-error">
    Google Client ID is missing from frontend .env.
  </p>
)}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          icon="user"
          placeholder="Enter your username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          icon="lock"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
      <div className="google-login-divider">
        <span>OR CONTINUE WITH</span>
      </div>
      <div className="google-login-container" ref={googleButtonRef}></div>
      {googleLoading && (
        <p className="google-login-status">Signing in with Google...</p>
      )}
    </AuthLayout>
  );
}
export default Login;
