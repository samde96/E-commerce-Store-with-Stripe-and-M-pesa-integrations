import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const useStore = create((set, get) => ({
  favoriteProduct: [], // Array of product IDs
  pendingWishlistUpdates: [], // Queue for failed API updates

  // Initialize wishlist from localStorage or backend
  initializeWishlist: async (getToken) => {
    try {
      let storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      let pendingUpdates = JSON.parse(localStorage.getItem("pendingWishlistUpdates")) || [];

      // Fetch server wishlist if logged in
      if (getToken) {
        const token = await getToken();
        console.log("InitializeWishlist - Token:", token ? "Valid" : "Null");
        if (token) {
          const { data } = await axios.get("/api/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) {
            storedWishlist = data.wishlist; // Expect array of product IDs
            console.log("Fetched wishlist from backend:", storedWishlist);
          } else {
            console.warn("Wishlist fetch failed:", data.message);
          }
        }
      }

      // Merge pending updates
      pendingUpdates.forEach(({ productId, action }) => {
        if (action === "add" && !storedWishlist.includes(productId)) {
          storedWishlist.push(productId);
        } else if (action === "remove" && storedWishlist.includes(productId)) {
          storedWishlist = storedWishlist.filter((id) => id !== productId);
        }
      });

      console.log("Initializing wishlist:", storedWishlist);
      set({ favoriteProduct: storedWishlist, pendingWishlistUpdates: [] });
      localStorage.setItem("wishlist", JSON.stringify(storedWishlist));
      localStorage.setItem("pendingWishlistUpdates", JSON.stringify([]));

      // Retry pending updates
      if (pendingUpdates.length > 0 && getToken) {
        await retryPendingUpdates(getToken);
      }
    } catch (error) {
      console.error("Failed to initialize wishlist:", error.message);
      set({ favoriteProduct: [], pendingWishlistUpdates: [] });
      localStorage.setItem("wishlist", JSON.stringify([]));
      localStorage.setItem("pendingWishlistUpdates", JSON.stringify([]));
    }
  },

  // Retry queued API updates
  retryPendingUpdates: async (getToken) => {
    const { pendingWishlistUpdates } = get();
    if (!pendingWishlistUpdates.length) return;

    try {
      const token = await getToken();
      if (!token) {
        console.warn("No token for retry, keeping pending updates");
        return;
      }

      for (const { productId, action } of pendingWishlistUpdates) {
        const endpoint = action === "add" ? "/api/wishlist/add" : "/api/wishlist/remove";
        const response = await axios.post(
          endpoint,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`Retry API ${endpoint} response:`, response.data);
      }

      // Clear pending updates on success
      set({ pendingWishlistUpdates: [] });
      localStorage.setItem("pendingWishlistUpdates", JSON.stringify([]));
    } catch (error) {
      console.error("Retry API error:", error.response?.data?.message || error.message);
      // toast.error("Wishlist synced locally, will retry server sync later");
    }
  },

  // Toggle product in wishlist
  addToFavorite: async (productId, getToken) => {
    if (!productId || typeof productId !== "string") {
      console.error("Invalid productId:", productId);
      throw new Error("Invalid product ID");
    }

    console.log("addToFavorite - productId:", productId);

    const { favoriteProduct, pendingWishlistUpdates } = get();
    const isInWishlist = favoriteProduct.includes(productId);

    // Update local wishlist
    const updatedWishlist = isInWishlist
      ? favoriteProduct.filter((id) => id !== productId)
      : [...favoriteProduct, productId];

    set({ favoriteProduct: updatedWishlist });
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    console.log(
      `Updated favoriteProduct: ${updatedWishlist}, Count: ${updatedWishlist.length}`
    );

    // Sync with backend if logged in
    if (getToken) {
      try {
        const token = await getToken();
        console.log("addToFavorite - Token sample:", token ? token.slice(0, 10) + "..." : "Null");
        if (!token) {
          console.warn("No token provided, using local wishlist only");
          set({
            pendingWishlistUpdates: [
              ...pendingWishlistUpdates,
              { productId, action: isInWishlist ? "remove" : "add" },
            ],
          });
          localStorage.setItem(
            "pendingWishlistUpdates",
            JSON.stringify([...pendingWishlistUpdates, { productId, action: isInWishlist ? "remove" : "add" }])
          );
          // toast.error("Wishlist updated locally, will sync when logged in");
          return updatedWishlist;
        }

        const endpoint = isInWishlist
          ? "/api/wishlist/remove"
          : "/api/wishlist/add";
        const response = await axios.post(
          endpoint,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`API ${endpoint} response:`, response.data);

        // Retry any pending updates
        await retryPendingUpdates(getToken);
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        console.error(
          `API error for ${isInWishlist ? "remove" : "add"}:`,
          message,
          "Status:",
          status
        );

        // Queue the update for later
        set({
          pendingWishlistUpdates: [
            ...pendingWishlistUpdates,
            { productId, action: isInWishlist ? "remove" : "add" },
          ],
        });
        localStorage.setItem(
          "pendingWishlistUpdates",
          JSON.stringify([...pendingWishlistUpdates, { productId, action: isInWishlist ? "remove" : "add" }])
        );
        // toast.error("Wishlist updated locally, will sync with server later");
      }
    }

    return updatedWishlist;
  },
}));

export default useStore;





// import { create } from "zustand";
// import axios from "axios";

// const useStore = create((set, get) => ({
//   favoriteProduct: [], // Array of product IDs, default empty

//   // Initialize wishlist from localStorage or backend
//   initializeWishlist: async (getToken) => {
//     try {
//       let storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
//       if (getToken) {
//         const token = await getToken();
//         if (token) {
//           const { data } = await axios.get("/api/wishlist", {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (data.success) {
//             storedWishlist = data.wishlist; // Expect array of product IDs
//             console.log("Fetched wishlist from backend:", storedWishlist); // Debug
//           }
//         }
//       }
//       console.log("Initializing wishlist:", storedWishlist); // Debug
//       set({ favoriteProduct: storedWishlist });
//       localStorage.setItem("wishlist", JSON.stringify(storedWishlist));
//     } catch (error) {
//       console.error("Failed to initialize wishlist:", error);
//       set({ favoriteProduct: [] }); // Default empty on error
//     }
//   },

//   // Toggle product in wishlist
//   addToFavorite: async (productId, getToken) => {
//     if (!productId) {
//       console.error("Invalid productId:", productId);
//       throw new Error("Invalid product ID");
//     }

//     const { favoriteProduct } = get();
//     const isInWishlist = favoriteProduct.includes(productId);
//     const originalWishlist = [...favoriteProduct];

//     const updatedWishlist = isInWishlist
//       ? favoriteProduct.filter((id) => id !== productId)
//       : [...favoriteProduct, productId];

//     set({ favoriteProduct: updatedWishlist });
//     localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
//     console.log("Updated favoriteProduct:", updatedWishlist, "Count:", updatedWishlist.length); // Debug

//     if (getToken) {
//       try {
//         const token = await getToken();
//         if (!token) {
//           console.warn("No token provided, skipping API call");
//           return updatedWishlist;
//         }

//         const response = await axios.post(
//           isInWishlist ? "/api/wishlist/remove" : "/api/wishlist/add",
//           { productId },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         console.log("API response:", response.data);
//       } catch (error) {
//         console.error("API error:", error.response?.data || error.message);
//         set({ favoriteProduct: originalWishlist });
//         localStorage.setItem("wishlist", JSON.stringify(originalWishlist));
//         throw new Error("Failed to sync wishlist");
//       }
//     }

//     return updatedWishlist;
//   },
// }));

// export default useStore;