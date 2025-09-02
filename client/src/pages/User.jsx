import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function User({ user, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-500">Please sign in first.</p>
    );
  }

  const handleLogout = () => {
    setUser(null);
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user.fullName[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            {user.fullName}
          </h1>
          <p className="text-gray-500 text-center truncate max-w-full">
            {user.email}
          </p>
        </div>

        {/* User Details */}
        <div className="space-y-4">
          <div className="flex justify-between p-4 bg-white rounded-xl shadow-sm">
            <span className="text-gray-600 font-medium">User ID</span>
            <span className="text-gray-900 font-semibold">{user.id}</span>
          </div>
          {/* Add more details if needed */}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
