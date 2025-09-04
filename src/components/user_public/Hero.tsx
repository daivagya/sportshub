"use client";

export default function Hero() {
  return (
    <section className="relative w-full h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
      <img
        src="/banner-sports.jpg"
        alt="Sports action background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
      />
      <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md">
          Book. Play. Connect.<br />
          <span className="text-yellow-300">Your Local Sports, One Click Away.</span>
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-white/90 font-medium">
          Discover venues, book courts, join matches &amp; connect with local players—all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-yellow-300 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition shadow">
            Find Venues Near Me
          </button>
          <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition shadow">
            Register to Play
          </button>
        </div>
        <div className="mt-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by sport or location..."
            className="w-full max-w-xs px-4 py-3 rounded-lg border border-gray-300 focus:outline-none shadow"
          />
        </div>
        <p className="mt-6 text-white text-xs opacity-80">Over 5,000 matches booked this month!</p>
      </div>
    </section>
  );
}
