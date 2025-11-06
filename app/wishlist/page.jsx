'use client';
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import useStore from "@/store";
import Image from "next/image";

import Link from "next/link";
import toast from "react-hot-toast";
import { assets } from "@/assets/assets";

export async function getServerProps(context) {
  const { userId } = useAuth(context.req);
  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

const WishlistPage = () => {
  const { products, currency, formatPrice, getToken, addToCart } = useAppContext();
  const { favoriteProduct, addToFavorite } = useStore();
  const router = useRouter();


  console.log("WishlistPage - favoriteProduct:", favoriteProduct);
  console.log("WishlistPage - products:", products.map(p => ({ _id: p._id, image: p.image })));

  const wishlistedProducts = products.filter((product) =>
    favoriteProduct.includes(product._id)
  

  );

  if(wishlistedProducts.length === 1){
    e.preventDefault();
    return(
      div(
        <h1>Your Wishlist </h1>
      )
    )
  }


  const handleRemoveFromWishlist = async (productId) => {
    if (!productId) {
      console.error("WishlistPage - Invalid productId:", productId);
      toast.error("Invalid product");
      return;
    }
    console.log("WishlistPage - Removing from wishlist, productId:", productId);
    try {
      const { syncStatus } = await addToFavorite(productId, getToken);
      toast.success("Product removed from Wishlist");
      if (syncStatus === "queued") {
        toast.info(
          getToken
            ? "Wishlist updated locally, will sync with server later"
            : "Wishlist updated locally, will sync when logged in"
        );
      }
    } catch (error) {
      console.error("WishlistPage - Remove error:", error.message);
      toast.error(error.message); // Only for invalid product ID
    }
  };

  // Handle adding a product to cart
  const handleAddToCart = async (productId) => {
    if (!productId) {
      console.error("WishlistPage - Invalid productId for cart:", productId);
      toast.error("Invalid product");
      return;
    }
    console.log("WishlistPage - Adding to cart, productId:", productId);
    try {
      await addToCart(productId);
      toast.success("Product added to Cart");
    } catch (error) {
      console.error("WishlistPage - Add to cart error:", error.message);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-600">Your Wishlist</h1>
       <Link
              href="/all-products"
              className="bg-shop_dark_green text-green-500 px-6 py-2 rounded-md hover:bg-shop_light_green hover:text-black transition"
            >
              Go Back
            </Link>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Your wishlist is empty.</p>
          <Link
            href="/all-products"
            className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-800 hover:text-white transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
                onClick={() => {
                  router.push("/product/" + product._id);
                  window.scrollTo(0, 0);
                }}
              >
                <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                  <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                  />
                </div>

                <p className="md:text-base font-medium pt-2 w-full truncate">
                  {product.name}
                </p>
                <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
                  {product.description}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs">{4.5}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Image
                        key={index}
                        className="h-3 w-3"
                        src={
                          index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon
                        }
                        alt="star_icon"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full mt-2">
                  <p className="text-base font-medium">
                    {currency}
                    {formatPrice(product.offerPrice)}
                  </p>
                  <div className="flex flex-col gap-2 w-full mt-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product._id);
                      }}
                      className="flex items-center justify-center max-sm:hidden px-4 py-1.5 text-green-500 border border-green-600/20 rounded-full text-xs hover:bg-green-500 hover:text-white transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/product/" + product._id);
                        window.scrollTo(0, 0);
                      }}
                      className="max-sm:hidden px-4 py-1.5 text-green-500 border border-green-500/20 rounded-full text-xs hover:bg-slate-50 transition"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(product._id);
                      }}
                      className="max-sm:hidden px-4 py-1.5 items-center text-red-500 border border-red-500/20 rounded-full text-xs hover:bg-red-50 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
           
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;















// "use client";

// import { useRouter } from "next/navigation";
// import { getAuth } from "@clerk/nextjs/server";
// import { useAppContext } from "@/context/AppContext";
// import useStore from "@/store";
// import Image from "next/image";
// import { Trash2, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import toast from "react-hot-toast";

// // Server-side authentication
// export async function getServerProps(context) {
//   const { userId } = getAuth(context.req);
//   if (!userId) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }
//   return { props: {} };
// }

// const WishlistPage = () => {
//   const { products, formatPrice, getToken, addToCart } = useAppContext();
//   const { favoriteProduct, addToFavorite } = useStore();
//   const router = useRouter();

//   // Debug: Log wishlist state
//   console.log("WishlistPage - favoriteProduct:", favoriteProduct);

//   // Filter products to show only those in the wishlist
//   const wishlistedProducts = products.filter((product) =>
//     favoriteProduct.includes(product._id)
//   );

//   // Handle removing a product from wishlist
//   const handleRemoveFromWishlist = async (productId) => {
//     if (!productId) {
//       console.error("WishlistPage - Invalid productId:", productId);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("WishlistPage - Removing from wishlist, productId:", productId);
//     try {
//       await addToFavorite(productId, getToken);
//       toast.success("Product removed from Wishlist");
//     } catch (error) {
//       console.error("WishlistPage - Remove error:", error.message);
//       toast.error(error.message); // Only for invalid product ID
//     }
//   };

//   // Handle adding a product to cart
//   const handleAddToCart = async (productId) => {
//     if (!productId) {
//       console.error("WishlistPage - Invalid productId for cart:", productId);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("WishlistPage - Adding to cart, productId:", productId);
//     try {
//       await addToCart(productId);
//       toast.success("Product added to Cart");
//     } catch (error) {
//       console.error("WishlistPage - Add to cart error:", error.message);
//       toast.error("Failed to add to cart");
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

//       {wishlistedProducts.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-lg text-gray-600">Your wishlist is empty.</p>
//           <Link
//             href="/all-products"
//             className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-800 hover:text-white transition"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {wishlistedProducts.map((product) => (
//               <div
//                 key={product._id}
//                 className="border rounded-lg p-4 shadow-md hover:shadow-lg transition"
//               >
//                 <div className="relative h-48 mb-4">
//                   <Image
//                     src={product.image || "/placeholder.png"}
//                     alt={product.name}
//                     fill
//                     style={{ objectFit: "cover" }}
//                     className="rounded-md"
//                   />
//                 </div>
//                 <h2 className="text-lg font-semibold truncate">
//                   {product.name}
//                 </h2>
//                 <p className="text-gray-600">
//                   {formatPrice(product.offerPrice)}{" "}
//                   {process.env.NEXT_PUBLIC_CURRENCY}
//                 </p>
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     onClick={() => handleRemoveFromWishlist(product._id)}
//                     className="flex items-center text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5 mr-1" />
//                     Remove
//                   </button>
//                   <button
//                     onClick={() => handleAddToCart(product._id)}
//                     className="flex items-center bg-shop_dark_green text-white px-3 py-1 rounded-md hover:bg-shop_light_green hover:text-black transition"
//                   >
//                     <ShoppingCart className="w-5 h-5 mr-1" />
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-8 text-center">
//             <Link
//               href="/all-products"
//               className="bg-shop_dark_green text-white px-6 py-2 rounded-md hover:bg-shop_light_green hover:text-black transition"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default WishlistPage;







// 'use client';

// import { useRouter } from "next/navigation";
// import { getAuth } from "@clerk/nextjs/server";
// import { useAppContext } from "@/context/AppContext";
// import useStore from "@/store";
// import Image from "next/image";
// import { Trash2, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import toast from "react-hot-toast";

// // Server-side authentication
// export async function getServerProps(context) {
//   const { userId } = getAuth(context.req);
//   if (!userId) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }
//   return { props: {} };
// }

// const WishlistPage = () => {
//   const { products, formatPrice, getToken, addToCart } = useAppContext();
//   const { favoriteProduct, addToFavorite } = useStore();
//   const router = useRouter();

//   // Debug: Log wishlist state
//   console.log("WishlistPage - favoriteProduct:", favoriteProduct);

//   // Filter products to show only those in the wishlist
//   const wishlistedProducts = products.filter((product) =>
//     favoriteProduct.includes(product._id)
//   );

//   // Handle removing a product from wishlist
//   const handleRemoveFromWishlist = async (productId) => {
//     if (!productId) {
//       console.error("WishlistPage - Invalid productId:", productId);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("WishlistPage - Removing from wishlist, productId:", productId);
//     try {
//       await addToFavorite(productId, getToken);
//       toast.success("Product removed from Wishlist");
//     } catch (error) {
//       console.error("WishlistPage - Remove error:", error.message);
//       toast.error(error.message || "Failed to update wishlist");
//     }
//   };

//   // Handle adding a product to cart
//   const handleAddToCart = async (productId) => {
//     if (!productId) {
//       console.error("WishlistPage - Invalid productId for cart:", productId);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("W parserssWishlistPage - Adding to cart, productId:", productId);
//     try {
//       await addToCart(productId);
//       toast.success("Product added to Cart");
//     } catch (error) {
//       console.error("WishlistPage - Add to cart error:", error.message);
//       toast.error("Failed to add to cart");
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

//       {wishlistedProducts.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-lg text-gray-600">Your wishlist is empty.</p>
//           <Link
//             href="/all-products"
//             className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-800 hover:text-white transition"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {wishlistedProducts.map((product) => (
//               <div
//                 key={product._id}
//                 className="border rounded-lg p-4 shadow-md hover:shadow-lg transition"
//               >
//                 <div className="relative h-48 mb-4">
//                   <Image
//                     src={product.image || "/placeholder.png"}
//                     alt={product.name}
//                     fill
//                     style={{ objectFit: "cover" }}
//                     className="rounded-md"
//                   />
//                 </div>
//                 <h2 className="text-lg font-semibold truncate">{product.name}</h2>
//                 <p className="text-gray-600">
//                   {formatPrice(product.offerPrice)} {process.env.NEXT_PUBLIC_CURRENCY}
//                 </p>
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     onClick={() => handleRemoveFromWishlist(product._id)}
//                     className="flex items-center text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5 mr-1" />
//                     Remove
//                   </button>
//                   <button
//                     onClick={() => handleAddToCart(product._id)}
//                     className="flex items-center bg-shop_dark_green text-white px-3 py-1 rounded-md hover:bg-shop_light_green hover:text-black transition"
//                   >
//                     <ShoppingCart className="w-5 h-5 mr-1" />
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-8 text-center">
//             <Link
//               href="/all-products"
//               className="bg-shop_dark_green text-white px-6 py-2 rounded-md hover:bg-shop_light_green hover:text-black transition"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default WishlistPage;

// 'use client';

// import { useRouter } from "next/navigation";
// import { getAuth } from "@clerk/nextjs/server";
// import { useAppContext } from "@/context/AppContext";
// import useStore from "@/store";
// import Image from "next/image";
// import { Heart, Trash2 } from "lucide-react";
// import Link from "next/link";
// import toast from "react-hot-toast";

// // Server-side authentication
// export async function getServerProps(context) {
//   const { userId } = getAuth(context.req);
//   if (!userId) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }
//   return { props: {} };
// }

// const WishlistPage = () => {
//   const { products, formatPrice, getToken } = useAppContext();
//   const { favoriteProduct, addToFavorite } = useStore();
//   const router = useRouter();

//   // Debug: Log wishlist state
//   console.log("WishlistPage - favoriteProduct:", favoriteProduct);

//   // Filter products to show only those in the wishlist
//   const wishlistedProducts = products.filter((product) =>
//     favoriteProduct.includes(product._id)
//   );

//   // Handle removing a product from wishlist
//   const handleRemoveFromWishlist = async (productId) => {
//     try {
//       await addToFavorite(productId, getToken);
//       toast.success("Product removed from Wishlist");
//     } catch (error) {
//       console.error("Remove from wishlist error:", error.message);
//       toast.error("Failed to remove from wishlist");
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

//       {wishlistedProducts.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-lg text-gray-600">Your wishlist is empty.</p>
//           <Link
//             href="/all-products"
//             className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-800 hover:text-white transition"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {wishlistedProducts.map((product) => (
//               <div
//                 key={product._id}
//                 className="border rounded-lg p-4 shadow-md hover:shadow-lg transition"
//               >
//                 <div className="relative h-48 mb-4">
//                   <Image
//                     src={product.image || "/placeholder.png"}
//                     alt={product.name}
//                     fill
//                     style={{ objectFit: "cover" }}
//                     className="rounded-md"
//                   />
//                 </div>
//                 <h2 className="text-lg font-semibold truncate">{product.name}</h2>
//                 <p className="text-gray-600">
//                   {formatPrice(product.offerPrice)} {process.env.NEXT_PUBLIC_CURRENCY}
//                 </p>
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     onClick={() => handleRemoveFromWishlist(product._id)}
//                     className="flex items-center text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5 mr-1" />
//                     Remove
//                   </button>
//                   <Heart
//                     className="text-shop_light_green fill-shop_light_green w-5 h-5"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-8 text-center">
//             <Link
//               href="/all-products"
//               className="bg-shop_dark_green text-white px-6 py-2 rounded-md hover:bg-shop_light_green hover:text-black transition"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default WishlistPage;
