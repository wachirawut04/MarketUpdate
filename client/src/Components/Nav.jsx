// Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaReact } from "react-icons/fa";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Market", to: "/market" },
    { name: "Graph", to: "/graph" },
    { name: "Download", to: "/download" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-black hover:text-blue-600 transition-colors"
          >
            <FaReact className="h-7 w-7 mr-2 animate-spin-slow text-blue-500" />
            <span className="font-semibold text-lg">MarketApp</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-md text-black hover:text-blue-600 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`absolute top-16 left-0 w-full bg-white shadow-md border-t border-gray-200 transform transition-transform duration-300 ease-in-out ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-5 opacity-0 pointer-events-none"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-black"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile menu links */}
        <div className="flex flex-col px-6 pb-4 space-y-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
