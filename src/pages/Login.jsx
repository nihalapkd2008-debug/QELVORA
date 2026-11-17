import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      window.dispatchEvent(new Event("auth-changed"));

      const destination = location.state?.from?.pathname || "/";

      navigate(destination, { replace: true });
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.detail ||
          "Login failed. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

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
    </AuthLayout>
  );
}

export default Login;
