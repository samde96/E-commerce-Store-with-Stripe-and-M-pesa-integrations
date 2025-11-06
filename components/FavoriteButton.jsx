"use client";

import useStore from "@/store";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";

const FavoriteButton = ({ showProduct = false, product }) => {
  const { favoriteProduct, addToFavorite } = useStore();
  const { getToken } = useAppContext();

  // Debug: Log favoriteProduct and count
  console.log(
    "FavoriteButton - favoriteProduct:",
    favoriteProduct,
    "Count:",
    favoriteProduct?.length || 0
  );

  // Check if product is wishlisted (for showProduct=true)
  const existingProduct = useMemo(
    () => favoriteProduct.includes(product?._id),
    [favoriteProduct, product]
  );

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product?._id) {
      addToFavorite(product._id, getToken)
        .then(() => {
          toast.success(
            existingProduct
              ? "Product removed successfully!"
              : "Product added successfully!"
          );
        })
        .catch((error) => {
          toast.error("Failed to update wishlist");
        });
    }
  };

  return (
    <>
      {!showProduct ? (
        <Link href="/wishlist" className="group relative">
          <Heart className="w-5 h-5 text-red-500" />
          {favoriteProduct.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
              {favoriteProduct.length}
            </span>
          )}
        </Link>
      ) : (
        <button
          onClick={handleFavorite}
          className="group relative hover:text-shop_light_green hoverEffect border border-shop_light_green/80 hover:border-shop_light_green p-1.5 rounded-sm "
        >
          {existingProduct ? (
            <Heart
              fill="#3b9c3c"
              className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5 w-5 h-5"
            />
          ) : (
            <Heart className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5 w-5 h-5" />
          )}
        </button>
      )}
    </>
  );
};

export default FavoriteButton;
