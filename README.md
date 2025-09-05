<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
#sportshub
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250902080032_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ images
│  │  └─ sports-tools.jpg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ (auth)
│  │  │  ├─ (otp)
│  │  │  │  └─ verifyOtp
│  │  │  │     └─ page.tsx
│  │  │  ├─ login
│  │  │  │  └─ page.tsx
│  │  │  └─ register
│  │  │     └─ page.tsx
│  │  ├─ (owner)
│  │  │  └─ manager
│  │  │     ├─ bookings
│  │  │     │  └─ page.tsx
│  │  │     ├─ dashboard
│  │  │     │  └─ page.tsx
│  │  │     ├─ layout.tsx
│  │  │     ├─ onboarding
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ venues
│  │  │        └─ page.tsx
│  │  ├─ (user)
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ profile
│  │  │     └─ page.tsx
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ verify-otp
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ owner
│  │  │  │  └─ route.ts
│  │  │  └─ upload
│  │  │     └─ route.ts
│  │  ├─ context
│  │  │  └─ AuthenticationProvider.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ venues
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ owner
│  │  │  ├─ AddVenueForm.tsx
│  │  │  ├─ BookingsTable.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  └─ VenuesTable.tsx
│  │  ├─ ui
│  │  │  ├─ Button.tsx
│  │  │  └─ card.tsx
│  │  └─ user
│  │     ├─ AllowedSports.tsx
│  │     ├─ CourtCard.tsx
│  │     ├─ CourtsSlider.tsx
│  │     ├─ FilterSidebar.tsx
│  │     ├─ Footer.tsx
│  │     ├─ HeroSection.tsx
│  │     ├─ Navbar.tsx
│  │     ├─ SportCard.tsx
│  │     ├─ sportsWeOffer.tsx
│  │     ├─ VenueCard.tsx
│  │     └─ VenueSlider.tsx
│  ├─ generated
│  │  └─ prisma
│  │     ├─ client.d.ts
│  │     ├─ client.js
│  │     ├─ default.d.ts
│  │     ├─ default.js
│  │     ├─ edge.d.ts
│  │     ├─ edge.js
│  │     ├─ index-browser.js
│  │     ├─ index.d.ts
│  │     ├─ index.js
│  │     ├─ package.json
│  │     ├─ query_engine-windows.dll.node
│  │     ├─ runtime
│  │     │  ├─ edge-esm.js
│  │     │  ├─ edge.js
│  │     │  ├─ index-browser.d.ts
│  │     │  ├─ index-browser.js
│  │     │  ├─ library.d.ts
│  │     │  ├─ library.js
│  │     │  ├─ react-native.js
│  │     │  ├─ wasm-compiler-edge.js
│  │     │  └─ wasm-engine-edge.js
│  │     ├─ schema.prisma
│  │     ├─ wasm.d.ts
│  │     └─ wasm.js
│  ├─ lib
│  │  ├─ authOptions.ts
│  │  ├─ cloudinary.ts
│  │  ├─ dummyData.ts
│  │  ├─ hash.ts
│  │  ├─ mailer.ts
│  │  ├─ prisma.ts
│  │  ├─ utils.ts
│  │  └─ validationFrontend.ts
│  ├─ middleware.ts
│  └─ types
│     └─ next-auth.d.ts
└─ tsconfig.json

```