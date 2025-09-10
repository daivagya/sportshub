// import Image from "next/image";

// type VenueImagesAndDescriptionProps = {
//   images: string[];
//   description: string;
// };

// export default function VenueImagesAndDescription({ images, description }: VenueImagesAndDescriptionProps) {
//   // Use the first image as the main display, or a placeholder
//   const mainImage = images?.[0] || "/placeholder-image.jpg"; 
//   const thumbnailImages = images?.slice(1, 4) || [];

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//       {/* Image Gallery Section */}
//       <div className="flex flex-col gap-4">
//         <div className="aspect-video w-full overflow-hidden rounded-lg">
//           <Image
//             src={mainImage}
//             alt="Main venue image"
//             width={800}
//             height={450}
//             className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//           />
//         </div>
//         {thumbnailImages.length > 0 && (
//           <div className="grid grid-cols-3 gap-4">
//             {thumbnailImages.map((img, index) => (
//               <div key={index} className="aspect-video w-full overflow-hidden rounded-lg">
//                 <Image
//                   src={img}
//                   alt={`Venue thumbnail ${index + 1}`}
//                   width={200}
//                   height={112}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Description Section */}
//       <div>
//         <h2 className="text-2xl font-semibold text-gray-800 mb-3">About this venue</h2>
//         <p className="text-gray-600 leading-relaxed">
//           {description}
//         </p>
//       </div>
//     </div>
//   );
// }