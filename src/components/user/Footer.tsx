import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            About QuickCourt
          </h3>
          <p className="text-sm leading-6">
            QuickCourt helps you discover, book, and play at the best sports
            venues around you. Play. Connect. Compete.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-green-500">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500">
                Book Venues
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500">
                Top Rated Courts
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500">
                Sports We Offer
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <p className="text-sm">📍 Ahmedabad, India</p>
          <p className="text-sm">📞 +91 98765 43210</p>
          <p className="text-sm">✉️ support@quickcourt.com</p>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#">
              <Facebook className="w-5 h-5 hover:text-green-500" />
            </a>
            <a href="#">
              <Instagram className="w-5 h-5 hover:text-green-500" />
            </a>
            <a href="#">
              <Twitter className="w-5 h-5 hover:text-green-500" />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center py-4 border-t border-gray-700 text-sm">
        © {new Date().getFullYear()} QuickCourt. All rights reserved.
      </div>
    </footer>
  );
}