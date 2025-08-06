// Nav.jsx

import { Link } from "react-router-dom"; // Using react-router-dom for routing
import { CiBank, CiMenuFries } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";
import Button from "./Button";
import { useState } from "react";

const Nav = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <nav className="w-full bg-[#323643] fixed top-0 left-0 z-40">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center text-[#93DEFF] py-4 px-5">
        <div className="flex items-center">
          <span className="text-4xl font-semibold">
            <Link to="/"><CiBank /></Link>
          </span>
        </div>

        <ul className="hidden md:flex items-center justify-end gap-10 text-sm font-normal">
          <li className="list-none border-b-2 border-transparent hover:border-[#5EC3FF] hover:text-[#5EC3FF] transition-all duration-300 cursor-pointer">
            <Link to="/Market">Market</Link>
          </li>
          <li className="list-none border-b-2 border-transparent hover:border-[#5EC3FF] hover:text-[#5EC3FF] transition-all duration-300 cursor-pointer">
            <Link to="/Graph">Graph</Link>
          </li>
          <li className="list-none border-b-2 border-transparent hover:border-[#5EC3FF] hover:text-[#5EC3FF] transition-all duration-300 cursor-pointer">
            <Link to="/Download">Download</Link>
          </li>
          <li className="list-none">
            <Button>Sign In</Button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-2xl transition"
          onClick={handleClick}
        >
          {click ? <FaTimes /> : <CiMenuFries />}
        </button>
      </div>

      {/* Mobile Menu */}
      {click && (
        <div className="md:hidden absolute top-16 w-full left-0 right-0 bg-slate-900 transition-all duration-300">
          <ul className="flex flex-col text-center text-xl p-10 space-y-4">
            <li
              className="border-b border-slate-800 hover:bg-slate-800 hover:rounded py-4 cursor-pointer"
              onClick={closeMobileMenu}
            >
              <Link to="/Market" className="text-[#93DEFF]  hover:border-[#5EC3FF] hover:text-[#5EC3FF] transition-all duration-300 cursor-pointer" >Market</Link>
            </li>
            <li
              className="border-b border-slate-800 hover:bg-slate-800 hover:rounded py-4 cursor-pointer"
              onClick={closeMobileMenu}
            >
              <Link to="/Graph" className="text-[#93DEFF]  hover:border-[#5EC3FF] hover:text-[#5EC3FF] transition-all duration-300 cursor-pointer">Graph</Link>
            </li>
            <li
              className="border-b border-slate-800 hover:bg-slate-800 hover:rounded py-4 cursor-pointer"
              onClick={closeMobileMenu}
            >
              <Link to="/Download" className="text-[#93DEFF]  hover:border-[#5EC3FF] hover:text-[#5EC3FF] transition-all duration-300 cursor-pointer">Download</Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;
