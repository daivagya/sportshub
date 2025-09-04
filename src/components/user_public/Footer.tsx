"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 pt-8 pb-4">
      <div className="container mx-auto px-6 lg:px-20 flex flex-col md:flex-row items-center md:items-start justify-between">
        <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start">
          <img src="/logo-sportsbook.png" alt="SportsBook Logo" className="mb-2 w-32" />
          <p className="mb-2 text-sm">
            Bringing local sports communities closer, one booking at a time.
          </p>
          <div className="flex space-x-3">
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
              <svg className="w-5 h-5 text-gray-100 hover:text-yellow-300" /* SVG Content */ />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">
              <svg className="w-5 h-5 text-gray-100 hover:text-yellow-300" /* SVG Content */ />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
              <svg className="w-5 h-5 text-gray-100 hover:text-yellow-300" /* SVG Content */ />
            </a>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm mb-6 md:mb-0">
          <div>
            <h4 className="font-semibold mb-2">Pages</h4>
            <ul className="space-y-1">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/venues">Browse Venues</Link></li>
              <li><Link href="/create-match">Create Match</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <ul className="space-y-1">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/faq">FAQs</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
            <ul className="space-y-1">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Use</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
          <h4 className="font-semibold mb-2">Newsletter</h4>
          <form className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 text-gray-900 rounded-l-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-yellow-300 px-4 py-2 rounded-r-lg text-gray-900 font-semibold hover:bg-yellow-400 transition"
            >Subscribe</button>
          </form>
          <span className="mt-3 text-xs opacity-70">© 2025 SportsBook. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
