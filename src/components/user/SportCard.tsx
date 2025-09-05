"use client";

import Image from "next/image";

type Props = { image: string; name: string };

export default function CircleCard({ image, name }: Props) {
  return (
    <div
      className="relative h-[180px] w-[180px] cursor-pointer drop-shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:drop-shadow-xl"
      aria-label={name}
    >
      {/* SVG definition for the circular mask */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="circle-clip-path" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>
      </svg>

      {/* Container for the image and overlay, clipped to the circle shape */}
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ clipPath: "url(#circle-clip-path)" }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* 👇 THE CHANGE IS HERE! 
        Added `gap-2` to the flex container to create vertical space.
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 p-4 pb-6">
        <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-gray-900 backdrop-blur-sm">
          {name}
        </span>
        
        {/* ✅ This image will now have a proper gap above it */}
        {/*
        <Image
          src="/path/to/your/logo.svg"
          alt="Brand Logo"
          width={30}
          height={30}
        />
        */}
      </div>
    </div>
  );
} 