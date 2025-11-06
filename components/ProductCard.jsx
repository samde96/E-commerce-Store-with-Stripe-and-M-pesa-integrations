
"use client";

import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { toast } from "react-hot-toast";
import { Heart, ShoppingCart } from "lucide-react";
import useStore from "@/store";

const ProductCard = ({ product }) => {
  const { currency, router, formatPrice, getToken} = useAppContext();
  const { favoriteProduct, addToFavorite } = useStore();

  const isWishlisted = favoriteProduct.includes(product._id);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!product?._id) {
      console.error("ProductCard - Product ID is missing:", product);
      toast.error("Invalid product");
      return;
    }
    console.log("ProductCard - Toggling wishlist, productId:", product._id);
    try {
      await addToFavorite(product._id, getToken);
      toast.success(
        isWishlisted ? "Product removed from Wishlist" : "Product added to Wishlist"
      );
    } catch (error) {
      console.error("ProductCard - Wishlist toggle error:", error.message);
      toast.error(error.message); // Only for invalid product ID
    }
  };

  // function to handle product stock status



  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        window.scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
    >
      <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
        <Image
          src={product.image[0]}
          alt={product.name}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
          width={800}
          height={800}
        />
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2"
        >
          {isWishlisted ? (
            <Heart
              size={20}
              onClick={handleWishlistToggle}
              className="text-red-500 fill-red-500"
            />
          ) : (
            <Heart
              size={20}
              onClick={handleWishlistToggle}
              className="text-green-500"
            />
          )}
        </button>
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
           <p className="text-xs text-green-500 flex items-center">{product.stockStatus}</p>
      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-medium">
          {currency}
          {formatPrice(product.offerPrice)}
        </p>
      
        <div className="flex items-center gap-2">
                  
          <button className="max-sm:hidden px-4 py-1.5 text-green-500 border border-green-500/20 rounded-full text-xs hover:bg-slate-50 transition">
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;




































// "use client";

// import React from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import { toast } from "react-hot-toast";
// import { Heart, ShoppingCart } from "lucide-react";
// import useStore from "@/store";

// const ProductCard = ({ product }) => {
//   const { currency, router, formatPrice, getToken, addToCart } = useAppContext();
//   const { favoriteProduct, addToFavorite } = useStore();

//   const isWishlisted = favoriteProduct.includes(product._id);

//   const handleWishlistToggle = async (e) => {
//     e.stopPropagation();
//     if (!product?._id) {
//       console.error("ProductCard - Product ID is missing:", product);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("ProductCard - Toggling wishlist, productId:", product._id);
//     try {
//       await addToFavorite(product._id, getToken);
//       toast.success(
//         isWishlisted ? "Product removed from Wishlist" : "Product added to Wishlist"
//       );
//     } catch (error) {
//       console.error("ProductCard - Wishlist toggle error:", error.message);
//       toast.error(error.message || "Failed to update wishlist");
//     }
//   };

//   const handleAddToCart = async (e) => {
//     e.stopPropagation();
//     if (!product?._id) {
//       console.error("ProductCard - Product ID is missing for cart:", product);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("ProductCard - Adding to cart, productId:", product._id);
//     try {
//       await addToCart(product._id);
//       toast.success("Product added to Cart");
//     } catch (error) {
//       console.error("ProductCard - Add to cart error:", error.message);
//       toast.error("Failed to add to cart");
//     }
//   };

//   return (
//     <div
//       onClick={() => {
//         router.push("/product/" + product._id);
//         window.scrollTo(0, 0);
//       }}
//       className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
//     >
//       <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
//         <Image
//           src={product.image[0]}
//           alt={product.name}
//           className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
//           width={800}
//           height={800}
//         />
//         <button
//           onClick={(e) => e.stopPropagation()}
//           className="absolute top-2 right-2"
//         >
//           {isWishlisted ? (
//             <Heart
//               size={20}
//               onClick={handleWishlistToggle}
//               className="text-red-500 fill-red-500"
//             />
//           ) : (
//             <Heart
//               size={20}
//               onClick={handleWishlistToggle}
//               className="text-green-500"
//             />
//           )}
//         </button>
//       </div>

//       <p className="md:text-base font-medium pt-2 w-full truncate">
//         {product.name}
//       </p>
//       <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
//         {product.description}
//       </p>
//       <div className="flex items-center gap-2">
//         <p className="text-xs">{4.5}</p>
//         <div className="flex items-center gap-0.5">
//           {Array.from({ length: 5 }).map((_, index) => (
//             <Image
//               key={index}
//               className="h-3 w-3"
//               src={
//                 index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon
//               }
//               alt="star_icon"
//             />
//           ))}
//         </div>
//       </div>

//       <div className="flex items-end justify-between w-full mt-1">
//         <p className="text-base font-medium">
//           {currency}
//           {formatPrice(product.offerPrice)}
//         </p>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleAddToCart}
//             className="max-sm:hidden px-4 py-1.5 text-shop_dark_green border border-shop_dark_green/20 rounded-full text-xs hover:bg-shop_light_green hover:text-black transition"
//           >
//             Add to Cart
//           </button>
//           <button className="max-sm:hidden px-4 py-1.5 text-green-500 border border-green-500/20 rounded-full text-xs hover:bg-slate-50 transition">
//             Buy now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;































// "use client";

// import React from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import { toast } from "react-hot-toast";
// import { Heart, ShoppingCart } from "lucide-react";
// import useStore from "@/store";

// const ProductCard = ({ product }) => {
//   const { currency, router, formatPrice, getToken, addToCart } = useAppContext();
//   const { favoriteProduct, addToFavorite } = useStore();

//   const isWishlisted = favoriteProduct.includes(product._id);

//   const handleWishlistToggle = async (e) => {
//     e.stopPropagation();
//     if (!product._id) {
//       console.error("Product ID is missing:", product);
//       toast.error("Invalid product");
//       return;
//     }
//     console.log("ProductCard - Toggling wishlist, productId:", product._id);
//     try {
//       await addToFavorite(product._id, getToken);
//       toast.success(
//         isWishlisted ? "Product removed from Wishlist" : "Product added to Wishlist"
//       );
//     } catch (error) {
//       console.error("Wishlist toggle error:", error.message);
//       toast.error(error.message || "Failed to update wishlist");
//     }
//   };

//   const handleAddToCart = async (e) => {
//     e.stopPropagation();
//     try {
//       await addToCart(product._id);
//       toast.success("Product added to Cart");
//     } catch (error) {
//       console.error("Add to cart error:", error.message);
//       toast.error("Failed to add to cart");
//     }
//   };

//   return (
//     <div
//       onClick={() => {
//         router.push("/product/" + product._id);
//         window.scrollTo(0, 0);
//       }}
//       className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
//     >
//       <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
//         <Image
//           src={product.image[0]}
//           alt={product.name}
//           className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
//           width={800}
//           height={800}
//         />
//         <button
//           onClick={(e) => e.stopPropagation()}
//           className="absolute top-2 right-2"
//         >
//           {isWishlisted ? (
//             <Heart
//               size={20}
//               onClick={handleWishlistToggle}
//               className="text-red-500 fill-red-500"
//             />
//           ) : (
//             <Heart
//               size={20}
//               onClick={handleWishlistToggle}
//               className="text-green-500"
//             />
//           )}
//         </button>
//       </div>

//       <p className="md:text-base font-medium pt-2 w-full truncate">
//         {product.name}
//       </p>
//       <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
//         {product.description}
//       </p>
//       <div className="flex items-center gap-2">
//         <p className="text-xs">{4.5}</p>
//         <div className="flex items-center gap-0.5">
//           {Array.from({ length: 5 }).map((_, index) => (
//             <Image
//               key={index}
//               className="h-3 w-3"
//               src={
//                 index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon
//               }
//               alt="star_icon"
//             />
//           ))}
//         </div>
//       </div>

//       <div className="flex items-end justify-between w-full mt-1">
//         <p className="text-base font-medium">
//           {currency}
//           {formatPrice(product.offerPrice)}
//         </p>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleAddToCart}
//             className="max-sm:hidden px-4 py-1.5 text-shop_dark_green border border-shop_dark_green/20 rounded-full text-xs hover:bg-shop_light_green hover:text-black transition"
//           >
//             Add to Cart
//           </button>
//           <button className="max-sm:hidden px-4 py-1.5 text-green-500 border border-green-500/20 rounded-full text-xs hover:bg-slate-50 transition">
//             Buy now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;




























// "use client";

// import React, { useContext, useState, useEffect } from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import { toast } from "react-hot-toast";
// import { Button } from "./ui/Button";

// import { Heart } from "lucide-react";
// import FavoriteButton from "./FavoriteButton";

// const ProductCard = ({ product }) => {
//   const { currency, router, formatPrice } = useAppContext();
//   const [isWishlisted, setIsWishlisted] = useState(false);

//   useEffect(() => {
//     const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
//     setIsWishlisted(wishlist.includes(product._id));
//   }, [product._id]);

//   const toggleWishlist = async (e) => {
//     e.stopPropagation();

//     let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

//     if (isWishlisted) {

//       wishlist = wishlist.filter((id) => id !== product._id);
//       localStorage.setItem("wishlist", JSON.stringify(wishlist));
//       toast.success("Product removed from Wishlist");

//       await fetch("/api/wishlist/remove", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId: product._id }),
//       });
//     } else {

//       wishlist.push(product._id);
//       localStorage.setItem("wishlist", JSON.stringify(wishlist));
//       toast.success("Product added to Wishlist");

//       await fetch("/api/wishlist/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId: product._id }),
//       });
//     }

//     setIsWishlisted(!isWishlisted);
//   };

//   return (
//     <div
//       onClick={() => {
//         router.push("/product/" + product._id);
//         window.scrollTo(0, 0);
//       }}
//       className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
//     >
//       <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
//         <Image
//           src={product.image[0]}
//           alt={product.name}
//           className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
//           width={800}
//           height={800}
//         />

//         <Button
//           onClick={(e) => e.stopPropagation()}
//           className="absolute top-2 right-2"
//         >
//           <div className="absolute top-2 right-2">
//           <FavoriteButton showProduct={true} product={product} />
//         </div>
//         </Button>

//       </div>

//       <p className="md:text-base font-medium pt-2 w-full truncate">
//         {product.name}
//       </p>
//       <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
//         {product.description}
//       </p>
//       <div className="flex items-center gap-2">
//         <p className="text-xs">{4.5}</p>
//         <div className="flex items-center gap-0.5">
//           {Array.from({ length: 5 }).map((_, index) => (
//             <Image
//               key={index}
//               className="h-3 w-3"
//               src={
//                 index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon
//               }
//               alt="star_icon"
//             />
//           ))}
//         </div>
//       </div>

//       <div className="flex items-end justify-between w-full mt-1">
//         <p className="text-base font-medium">
//           ${currency}
//           {formatPrice(product.offerPrice)}
//         </p>
//         <button className="max-sm:hidden px-4 py-1.5 text-green-500 border border-green-500/20 rounded-full text-xs hover:bg-slate-50 transition">
//           Buy now
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
