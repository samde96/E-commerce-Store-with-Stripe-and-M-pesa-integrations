"use client";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CartItem = ({ product, quantity }) => {
  const { currency, updateCartQuantity, loading, formatPrice } =
    useAppContext();

  return (
    <div className="flex items-center gap-4 py-3 border-b">
      {/* Product Image */}
      <div className="relative w-20 h-20">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">
          {currency} {product.offerPrice}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={loading}
          onClick={() => updateCartQuantity(product._id, quantity - 1)}
        >
          {quantity === 1 ? (
            <Trash2 className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
        </Button>

        <span className="w-8 text-center">{quantity}</span>

        <Button
          variant="outline"
          size="icon"
          disabled={loading}
          onClick={() => updateCartQuantity(product._id, quantity + 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Total Price */}
      <div className="w-24 text-right">
        <p className="font-medium">
          {currency} {formatPrice(product.offerPrice * quantity)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
