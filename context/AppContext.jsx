"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useStore from "@/store"; // Add import

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/products/list");

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchUserData = async () => {
    try {
      if (user.publicMetadata.role === "seller") {
        setIsSeller(true);
      }

      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        console.error("Failed to fetch user data:", data.message);
        // Don't show error toast - user data will be created on first API call
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Don't show toast errors - this is handled silently
      // User data will be auto-created when needed
    }
  };

  const addToCart = async (itemId) => {
    if(!products.find((product) => product._id === itemId)) {
      toast.error("Product not found");
      return;
    }
      
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);

    if (user) {
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Item added to cart");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Cart Updated Successfully");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User logged in, initializing wishlist"); 
      fetchUserData();
      useStore.getState().initializeWishlist();
    } else {
      console.log("No user, initializing wishlist"); 
      setCartItems({});
      setUserData(null);
      setIsSeller(false);
      useStore.getState().initializeWishlist();
    }
  }, [user]);

  useEffect(() => {
    console.log("Initializing wishlist on app start"); 
   
    localStorage.setItem("wishlist", JSON.stringify([]));
    useStore.getState().initializeWishlist();
  }, []);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    formatPrice,
    loading,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};


















































// "use client";

// import { useAuth, useUser } from "@clerk/nextjs";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { createContext, useContext, useEffect, useState } from "react";
// import toast from "react-hot-toast";

// export const AppContext = createContext();

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

// export const AppContextProvider = (props) => {
//   const currency = process.env.NEXT_PUBLIC_CURRENCY;
//   const router = useRouter();

//   const { user } = useUser();
//   const { getToken } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [userData, setUserData] = useState(false);
//   const [isSeller, setIsSeller] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const [loading, setLoading] = useState(false);

//   const fetchProductData = async () => {
//     try {
//       const { data } = await axios.get("/api/products/list");

//       if (data.success) {
//         setProducts(data.products);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const formatPrice = (price) => {
//     return price.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
//   }



//   const fetchUserData = async () => {
//     try {
      
//       if (user.publicMetadata.role === "seller") {
//         setIsSeller(true);
//       }

//       const token = await getToken();
//       //calling API
//       const { data } = await axios.get("/api/user/data", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

      


//       if (data.success) {
//         setUserData(data.user);
//         setCartItems(data.user.cartItems);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const addToCart = async (itemId) => {
//     let cartData = structuredClone(cartItems);
//     if (cartData[itemId]) {
//       cartData[itemId] += 1;
//     } else {
//       cartData[itemId] = 1;
//     }

//     setCartItems(cartData);

//     if (user) {
//       try {
//         const token = await getToken();

//         await axios.post(
//           "/api/cart/update",
//           { cartData },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         toast.success("Item added to cart");
//       } catch (error) {
//         toast.error(error.message);
//       }
//     }
//   };

//   const updateCartQuantity = async (itemId, quantity) => {

//     let cartData = structuredClone(cartItems);
//         if (quantity === 0) {
//             delete cartData[itemId];
//         } else {
//             cartData[itemId] = quantity;
//         }
//         setCartItems(cartData)
//         if (user){
//           try {
//             const token = await getToken();
    
//             await axios.post(
//               "/api/cart/update",
//               { cartData },
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                 },
//               }
//             );
//             toast.success("Cart Updated Successfully");
//           } catch (error) {
//             toast.error(error.message);
//           }
//         }
//   }



//   const getCartCount = () => {
//     let totalCount = 0;
//     for (const items in cartItems) {
//         if (cartItems[items] > 0) {
//             totalCount += cartItems[items];
//         }
//     }
//     return totalCount;
// }

// const getCartAmount = () => {
//     let totalAmount = 0;
//     for (const items in cartItems) {
//         let itemInfo = products.find((product) => product._id === items);
//         if (cartItems[items] > 0) {
//             totalAmount += itemInfo.offerPrice * cartItems[items];
//         }
//     }
//     return Math.floor(totalAmount * 100) / 100;
// }


 
//   useEffect(() => {
//     fetchProductData();
//   }, []);

//   useEffect(() => {
//     if (user) {
//       fetchUserData();
//     } else {
//       setCartItems({});
//       setUserData(null);
//       setIsSeller(false)
//     }
//   }, [user]);

//   const value = {
//     user,
//     getToken,
//     currency,
//     router,
//     isSeller,
//     setIsSeller,
//     userData,
//     fetchUserData,
//     products,
//     fetchProductData,
//     cartItems,
//     setCartItems,
//     addToCart,
//     updateCartQuantity,
//     getCartCount,
//     getCartAmount,
//     formatPrice,
//     loading,
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };
