import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../Components/AuthModal";

export default function SignIn({ setUser }) {
  const [isOpen, setIsOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const res = await fetch("http://localhost:8080/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/User");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Sign In failed");
    }
  };

  return (
    <AuthModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Sign In</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/SignUp")}
          className="text-blue-600 font-medium hover:underline cursor-pointer"
        >
          Sign Up
        </span>
      </p>
    </AuthModal>
  );
}
