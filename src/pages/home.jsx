import { useEffect, useState } from "react";
import api from "../services/api";
import AuthModal from "./authModal";

function Home() {
  const [secrets, setSecrets] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authFormType, setAuthFormType] = useState("login");

  const openAuthModal = (type) => {
    setAuthFormType(type);
    setIsAuthModalOpen(true);
  };
  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const res = await api.get("/secrets"); // <-- adjust this if your route is different
        setSecrets(res.data);
      } catch (err) {
        console.error("Error fetching secrets:", err);
      }
    };

    fetchSecrets();
  }, []);
  const [loggedinUser, setLoggedInUser] = useState(
    localStorage.getItem("token")
  );
  useEffect(() => {
    console.log("Logged in user:", loggedinUser);
    const handleStorageChange = () => {
      setLoggedInUser(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-700">🕵️ SecretVault</h1>
        <div className="space-x-4">
          {loggedinUser ? (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setLoggedInUser(null); // manually trigger state update
              }}
              className="bg-white border border-pink-500 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg font-medium transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Login
            </button>
          )}

          {loggedinUser ? null : (
            <button
              onClick={() => openAuthModal("signup")}
              className="bg-white border border-pink-500 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg font-medium transition"
            >
              Signup
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-pink-700 mb-10">
            Anonymous Secrets
          </h2>

          {secrets.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No secrets yet!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {secrets.map((secret) => (
                <div
                  key={secret._id}
                  className="bg-white border border-pink-200 shadow-sm p-6 rounded-xl text-gray-800 hover:shadow-md transition duration-200"
                >
                  {secret.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white text-center text-gray-500 text-sm py-4 border-t">
        © {new Date().getFullYear()} SecretVault. All rights reserved.
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialForm={authFormType}
        onAuthSuccess={(token) => {
          localStorage.setItem("token", token);
          setLoggedInUser(token);
        }}
      />
    </div>
  );
}

export default Home;
