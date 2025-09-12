// app/(user)/booking/success/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-10 text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle className="text-green-600 w-20 h-20" />
        </motion.div>

        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Booking Confirmed 🎉
        </h1>
        <p className="text-gray-700 mb-6">
          Your booking has been successfully completed.  
          A confirmation email has been sent to you.
        </p>

        <Link
          href="/venues"
          className="inline-block bg-black text-green-100 px-6 py-3 rounded-xl font-medium shadow-md hover:bg-green-700 hover:text-white transition duration-300"
        >
          Back to Venues
        </Link>
      </motion.div>
    </div>
  );
}
