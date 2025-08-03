export default function Button({ type = "button", onClick, children, full = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[#93DEFF] hover:bg-[#6EC7F2] text-[#F7F7F7] font-semibold px-6 py-2 rounded-2xl shadow-md transition duration-200 ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </button>
  );
}
