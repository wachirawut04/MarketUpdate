export default function Button({ type = "button", onClick, children, full = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[#0077C0] hover:bg-[#008FE0] text-[#FAFAFA] font-regular px-6 py-2 rounded-2xl shadow-md transition duration-200 ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </button>
  );
}
