import { useState } from "react";
import api from "../services/api";

function AuthModal({ isOpen, onClose, initialForm, onAuthSuccess }) {
  const [formType, setFormType] = useState(initialForm);
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

  const toggleForm = () => {
    setFormType((prev) => (prev === "login" ? "signup" : "login"));
    setError("");
    setFormData({
      f_name: "",
      l_name: "",
      email: "",
      password: "",
      phone_number: "",
      address: "",
    });
  };

  if (!isOpen) return null;

  // 🟡 Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔵 Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/signup", formData);
      console.log("Signup success:", res.data);
      alert("Signup successful!");
      setFormType("login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Login handler
  const handleLogin = async (e) => {
    console.log("Login data:", formData);
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      // Destructure both `user` and `token` from the response
      const { token, user } = res.data;

      // ✅ Store the token correctly
      localStorage.setItem("token", token);

      // (Optional) Store user info if needed
      localStorage.setItem("user", JSON.stringify(user));

      onAuthSuccess(token);
      // Close the modal or redirect as needed
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

        {/* 🔴 Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* 🔄 FORM */}
        <form
          className="space-y-4"
          onSubmit={formType === "login" ? handleLogin : handleSignup}
        >
          {/* 🟡 Extra fields for Signup */}
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

          {/* 🔵 Common fields */}
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

        {/* 🔄 TOGGLE FORM */}
        <p className="mt-4 text-sm text-center text-gray-600">
          {formType === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={toggleForm}
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
