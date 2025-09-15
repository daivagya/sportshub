"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ClientSafeUser } from "@/types/next-auth"; // Import the client-safe user type

// The Navbar now accepts a 'user' prop of the client-safe type
export default function Navbar({ user }: { user: ClientSafeUser | null }) {
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
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-green-600 tracking-tight">
        <Link href="/manager/dashboard">Sportshub</Link>
      </div>

      {/* Center: Manager Navigation */}
      <div className="hidden md:flex space-x-4 items-center">
        <Link
          href="/manager/dashboard"
          className={linkClasses("/manager/dashboard")}
        >
          Dashboard
        </Link>
        <Link href="/manager/venues" className={linkClasses("/manager/venues")}>
          Owned Venues
        </Link>
        <Link
          href="/manager/bookings"
          className={linkClasses("/manager/bookings")}
        >
          Bookings
        </Link>
        <Link
          href="/manager/reviews"
          className={linkClasses("/manager/reviews")}
        >
          Reviews
        </Link>
      </div>

      {/* Right: Auth - Now uses the 'user' prop */}
      <div className="hidden md:flex items-center space-x-4 relative">
        {user ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAvatarDropdownOpen(!avatarDropdownOpen);
              }}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-600 shadow-sm hover:scale-105 transition-transform"
            >
              <img
                src={user.avatarUrl || "/default-avatar.png"}
                alt="Manager Avatar"
                className="w-full h-full object-cover"
              />
            </button>

            {avatarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/manager/profile"
                  className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Profile
                </Link>
                <Link
                  href="/manager/settings"
                  className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700 focus:outline-none"
        >
          {/* SVG Icon */}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center md:hidden py-4 space-y-2">
          {/* Mobile Links */}
          {user ? (
            <>
              <Link
                href="/manager/profile"
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
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
