'use client';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const AddToCartButton = ({ productId, className = '' }) => {
    const { addToCart, cartItems, loading } = useAppContext();

    const isInCart = productId in cartItems;
    const quantity = cartItems[productId] || 0;

    return (
        <Button
            onClick={() => addToCart(productId)}
            disabled={loading}
            className={`${className} gap-2`}
            variant={isInCart ? "secondary" : "default"}
        >
            <ShoppingCart className="w-4 h-4" />
            {isInCart ? `In Cart (${quantity})` : 'Add to Cart'}
        </Button>
    );
};

export default AddToCartButton;
