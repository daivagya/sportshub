"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = () => setAvatarDropdownOpen(false);
    if (avatarDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [avatarDropdownOpen]);

  // Utility for active link
  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md transition-colors duration-200 ${
      pathname === path
        ? "text-green-600 font-semibold bg-green-50"
        : "text-gray-700 hover:text-green-600"
    }`;

  return (
    <nav
      className="
        sticky top-0 z-50 w-full
        bg-white/40 backdrop-blur-md
        shadow-lg border-b border-white/20
        px-6 py-3 flex items-center justify-between
      "
    >
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-green-600 tracking-tight">
        <Link href="/">Sportshub</Link>
      </div>

      {/* Center: Navigation */}
      <div className="hidden md:flex space-x-4 items-center">
        <Link href="/" className={linkClasses("/")}>
          Home
        </Link>
        <Link href="/about" className={linkClasses("/about")}>
          About
        </Link>
        <Link href="/venues" className={linkClasses("/venues")}>
          Venues
        </Link>
        {session && (
          <Link href="/my-bookings" className={linkClasses("/my-bookings")}>
            Your Bookings
          </Link>
        )}
      </div>

      {/* Right: Auth */}
      <div className="hidden md:flex items-center space-x-4 relative">
        {session ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAvatarDropdownOpen(!avatarDropdownOpen);
              }}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-600 shadow-sm hover:scale-105 transition-transform"
            >
              <img
                src={session.user?.image || "/default-avatar.png"}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </button>

            {avatarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-md shadow-xl rounded-xl overflow-hidden border border-gray-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {session.user?.email}
                  </p>
                </div>

                {/* Links */}
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Profile
                </Link>
                <Link
                  href="/my-bookings"
                  className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  My Bookings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/90 backdrop-blur-md shadow-md flex flex-col items-center md:hidden py-4 space-y-2 border-b border-gray-200">
          <Link href="/" className={linkClasses("/")}>
            Home
          </Link>
          <Link href="/about" className={linkClasses("/about")}>
            About
          </Link>
          <Link href="/venues" className={linkClasses("/venues")}>
            Venues
          </Link>
          {session && (
            <Link href="/my-bookings" className={linkClasses("/my-bookings")}>
              My Bookings
            </Link>
          )}
          {session ? (
            <>
              <div className="text-center py-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800">
                  {session.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-600">{session.user?.email}</p>
              </div>
              <Link
                href="/profile"
                className="py-2 text-gray-700 hover:text-green-600 font-medium"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="py-2 text-gray-700 hover:text-green-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
