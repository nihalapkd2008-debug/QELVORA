import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("auth/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login", {
        state: { registered: true },
      });
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="JOIN QELVORA"
      title="Create your account"
      description="Sign up and make your next discovery."
      sideEyebrow="FIND YOUR SIGNATURE"
      sideTitle="Make every detail feel like you."
      sideText="A considered collection. A style of your own."
      bottomText="Already have an account?"
      bottomLink="/login"
      bottomLinkText="Sign in"
    >
      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          icon="user"
          placeholder="Choose a username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          icon="mail"
          placeholder="Enter your email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          icon="lock"
          placeholder="Create a password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
        />

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          icon="lock"
          placeholder="Enter your password again"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
