import { createContext, useState } from 'react';

const WishlistContext = createContext();

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const addProductToWishlist = (product) => {
    setWishlist(prev => [...prev, product]);
  };

  const removeProductFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addProductToWishlist, removeProductFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export { WishlistProvider, WishlistContext };
