export default function SigninButton({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}