import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaReact } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";

export default function Nav({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const links = [
    { name: "Market", to: "/market" },
    { name: "Graph", to: "/graph" },
    { name: "Download", to: "/download" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        // scrolling down
        setShowNav(false);
      } else {
        // scrolling up
        setShowNav(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md transition-transform duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      }`}
    >
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

            {/* User Dropdown */}
            {user && (
              <Menu as="div" className="relative">
                <Menu.Button className="text-black font-medium hover:text-blue-600 transition-colors">
                  My Account
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/user"
                            className={`block px-4 py-2 text-sm text-gray-900 relative ${
                              active ? "bg-blue-100" : ""
                            } after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/CustomTable"
                            className={`block px-4 py-2 text-sm text-gray-900 relative ${
                              active ? "bg-blue-100" : ""
                            } after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300`}
                          >
                            Custom Table
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/CustomReport"
                            className={`block px-4 py-2 text-sm text-gray-900 relative ${
                              active ? "bg-blue-100" : ""
                            } after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300`}
                          >
                            Custom Report
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {!user && (
              <Link
                to="/signin"
                className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                Sign In
              </Link>
            )}
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
        className={`absolute top-16 left-0 w-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
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
          {user && (
            <>
              <Link
                to="/user"
                onClick={() => setMobileOpen(false)}
                className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                Profile
              </Link>
              <Link
                to="/CustomTable"
                onClick={() => setMobileOpen(false)}
                className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                Custom Table
              </Link>
              <Link
                to="/CustomReport"
                onClick={() => setMobileOpen(false)}
                className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                Custom Report
              </Link>
            </>
          )}
          {!user && (
            <Link
              to="/signin"
              onClick={() => setMobileOpen(false)}
              className="relative text-black font-medium hover:text-blue-600 transition-colors after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
