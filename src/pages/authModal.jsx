import { useEffect, useState } from "react";
import api from "../services/api";

function AuthModal({ isOpen, onClose, formType, onToggleForm, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    f_name: "",
    l_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // reset when form type changes (e.g., parent switched between login/signup)
  useEffect(() => {
    setError("");
    setFormData({
      f_name: "",
      l_name: "",
      email: "",
      password: "",
      phone_number: "",
      address: "",
    });
  }, [formType]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/signup", formData);
      console.log("Signup success:", res.data);
      alert("Signup successful!");
      onToggleForm("login"); // switch to login after successful signup
    } catch (err) {
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onAuthSuccess(token);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFormLocal = () => {
    onToggleForm(formType === "login" ? "signup" : "login");
  };

  return (
    <div className="fixed inset-0 bg-pink-100 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-8 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-pink-600 mb-4">
          {formType === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        <form
          className="space-y-4"
          onSubmit={formType === "login" ? handleLogin : handleSignup}
        >
          {formType === "signup" && (
            <>
              <input
                type="text"
                name="f_name"
                placeholder="First Name"
                value={formData.f_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                name="l_name"
                placeholder="Last Name"
                value={formData.l_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading
              ? formType === "login"
                ? "Logging in..."
                : "Signing up..."
              : formType === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          {formType === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={toggleFormLocal}
            className="text-pink-600 hover:underline font-medium"
          >
            {formType === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
