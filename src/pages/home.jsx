import { useEffect, useState } from "react";
import api from "../services/api";
import AuthModal from "./AuthModal";

function Home() {
  const [secrets, setSecrets] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authFormType, setAuthFormType] = useState("login");
  const [loggedinUser, setLoggedInUser] = useState(
    localStorage.getItem("token")
  );
  const [newSecret, setNewSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMySecrets, setViewMySecrets] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null); // for viewing detail

  const openAuthModal = (type) => {
    setAuthFormType(type);
    setIsAuthModalOpen(true);
  };

  const fetchSecrets = async () => {
    try {
      const url = viewMySecrets ? "/secrets/my-secrets" : "/secrets";
      const headers = loggedinUser
        ? { Authorization: `Bearer ${loggedinUser}` }
        : {};
      const res = await api.get(url, { headers });
      setSecrets(res.data);
    } catch (err) {
      console.error("Error fetching secrets:", err);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, [viewMySecrets, loggedinUser]);

  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedInUser(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedInUser(null);
    setViewMySecrets(false);
  };

  const handleSecretSubmit = async (e) => {
    e.preventDefault();
    if (!newSecret.trim()) return;
    try {
      setLoading(true);
      const res = await api.post(
        "/secrets/create",
        { text: newSecret },
        {
          headers: {
            Authorization: `Bearer ${loggedinUser}`,
          },
        }
      );
      setSecrets((prev) => [res.data, ...prev]);
      setNewSecret("");
    } catch (error) {
      console.error("Error submitting secret:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/secrets/${id}`, {
        headers: {
          Authorization: `Bearer ${loggedinUser}`,
        },
      });
      alert(res.data.message);
      setSecrets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete secret.");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`/secrets/${id}`, {
        headers: {
          Authorization: `Bearer ${loggedinUser}`,
        },
      });
      setSelectedSecret(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to view secret.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-700">🕵️ SecretVault</h1>
        <div className="space-x-4">
          {loggedinUser ? (
            <button
              onClick={handleLogout}
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

          {!loggedinUser && (
            <button
              onClick={() => openAuthModal("signup")}
              className="bg-white border border-pink-500 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg font-medium transition"
            >
              Signup
            </button>
          )}
        </div>
      </header>

      {/* Toggle View */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => setViewMySecrets(false)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            !viewMySecrets
              ? "bg-pink-500 text-white"
              : "bg-white border border-pink-400 text-pink-600"
          }`}
        >
          All Secrets
        </button>
        {loggedinUser && (
          <button
            onClick={() => setViewMySecrets(true)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMySecrets
                ? "bg-pink-500 text-white"
                : "bg-white border border-pink-400 text-pink-600"
            }`}
          >
            My Secrets
          </button>
        )}
      </div>

      {/* Main */}
      <main className="flex-grow py-12 px-6">
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-4xl font-extrabold text-center text-pink-700 mb-6">
            {viewMySecrets ? "My Secrets" : "Anonymous Secrets"}
          </h2>

          {loggedinUser && !viewMySecrets && (
            <form onSubmit={handleSecretSubmit} className="mb-10">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  placeholder="Share your secret anonymously..."
                  className="flex-grow px-4 py-3 rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}

          {secrets.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No secrets yet!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {secrets.map((secret) => (
                <div
                  key={secret._id}
                  className="bg-white border border-pink-200 shadow-sm p-6 rounded-xl text-gray-800 hover:shadow-md transition duration-200 relative"
                >
                  <p className="mb-2">{secret.text}</p>

                  {viewMySecrets && (
                    <div className="flex justify-end gap-2 text-sm">
                      <button
                        onClick={() => handleViewDetail(secret._id)}
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(secret._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Secret Detail Modal */}
      {selectedSecret && (
        <div className="fixed inset-0 bg-pink-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2 text-pink-700">
              Secret Detail
            </h3>
            <p className="mb-2">
              📝 <strong>Text:</strong> {selectedSecret.text}
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Created at: {new Date(selectedSecret.createdAt).toLocaleString()}
            </p>
            <button
              onClick={() => setSelectedSecret(null)}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white text-center text-gray-500 text-sm py-4 border-t">
        © {new Date().getFullYear()} SecretVault. All rights reserved.
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        formType={authFormType}
        onToggleForm={(next) => setAuthFormType(next)}
        onAuthSuccess={(token) => {
          localStorage.setItem("token", token);
          setLoggedInUser(token);
        }}
      />
    </div>
  );
}

export default Home;
