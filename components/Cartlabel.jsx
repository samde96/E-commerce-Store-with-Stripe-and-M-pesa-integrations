'use client';

import { ShoppingBag } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';


const Cartlabel = () => {
const { getCartCount } = useAppContext();
const cartCount = getCartCount();

  return (
    <Link href="/cart" className="group relative">
      <ShoppingBag className="w-5 h-5 hover:text-orange-500 transition-colors" />
      <span
        className="absolute -top-1 -right-1 h-3.5 w-3.5
        rounded-full text-xs font-semibold flex items-center justify-center"
      >
        {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
      </span>
    </Link>
  );
};

export default Cartlabel;

















// import { ShoppingBag } from "lucide-react";
// import React from "react";
// import Link from "next/link";

// const Cartlabel = () => {
//   const handleAddToCart = async (e) => {
//       e.stopPropagation();
//       if (!product?._id) {
//         console.error("ProductCard - Product ID is missing for cart:", product);
//         toast.error("Invalid product");
//         return;
//       }
//       console.log("ProductCard - Adding to cart, productId:", product._id);
//       try {
//         await addToCart(product._id);
//         toast.success("Product added to Cart");
//       } catch (error) {
//         console.error("ProductCard - Add to cart error:", error.message);
//         toast.error("Failed to add to cart");
//       }
//     };
//   return (
//     <Link href={"/cart"} className="group relative">
//       <ShoppingBag onClick={handleAddToCart} className="w-5 h-5 hover: text-orange-500 hoverEffect" />
//       <span
//         className="absolute -top-1 -right-1 bg-red-500 text-white h-3.5 w-3.5
//        rounded-full text-xs font-semibold flex items-center justify-center"
//       >
//         0
//       </span>
//     </Link>
//   );
// };

// export default Cartlabel;
