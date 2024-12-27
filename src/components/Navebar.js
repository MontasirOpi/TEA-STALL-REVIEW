import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-teal-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-white font-bold">
            <img src={logo} alt="Tea Stall Logo" className="w-12 h-12 mr-3" /> {/* Logo */}
            <span className="text-2xl sm:text-3xl md:text-4xl">TeaStall Reviews</span> {/* Responsive font size */}
          </Link>
        </div>

        {/* Hamburger Icon for mobile view */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white sm:hidden focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Horizontal menu for larger screens */}
        <div className="hidden sm:flex sm:space-x-4">
          <Link to="/" className="text-white hover:text-gray-300 px-4 py-2">
            Home
          </Link>
          <Link to="/review" className="text-white hover:text-gray-300 px-4 py-2">
            Post Review
          </Link>
          <Link to="/login" className="text-white hover:text-gray-300 px-4 py-2">
            Login
          </Link>
          {/* <Link to="/signup" className="text-white hover:text-gray-300 px-4 py-2">
            Signup
          </Link> */}
          <Link to="/profile" className="text-white hover:text-gray-300 px-4 py-2">
            Profile
          </Link>
          {/* <Link to="/admin/login" className="text-white hover:text-gray-300 px-4 py-2">
            Admin Login
          </Link> */}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`sm:hidden ${isMenuOpen ? "block" : "hidden"} bg-teal-700 mt-2 p-4 rounded-lg`}
      >
        <Link
          to="/"
          className="block text-white hover:text-gray-300 py-2"
          onClick={() => setIsMenuOpen(false)} // Close menu after link click
        >
          Home
        </Link>
        <Link
          to="/review"
          className="block text-white hover:text-gray-300 py-2"
          onClick={() => setIsMenuOpen(false)}
        >
          Post Review
        </Link>
        <Link
          to="/login"
          className="block text-white hover:text-gray-300 py-2"
          onClick={() => setIsMenuOpen(false)}
        >
          Login
        </Link>
        {/* <Link
          to="/signup"
          className="block text-white hover:text-gray-300 py-2"
          onClick={() => setIsMenuOpen(false)}
        >
          Signup
        </Link> */}
        <Link
          to="/profile"
          className="block text-white hover:text-gray-300 py-2"
          onClick={() => setIsMenuOpen(false)}
        >
          Profile
        </Link>
        {/* <Link
          to="/admin/login"
          className="block text-white hover:text-gray-300 py-2"
          onClick={() => setIsMenuOpen(false)}
        >
          Admin Login
        </Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
//opi