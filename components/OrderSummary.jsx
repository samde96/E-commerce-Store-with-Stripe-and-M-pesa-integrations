import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import { assets } from "@/assets/assets";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getToken,
    user,
    cartItems,
    setCartItems,
    getCartAmount,
    formatPrice,
  } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [isPlaceOrderClicked, setIsPlaceOrderClicked] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(""); // New state for M-Pesa phone number
  const [loading, setLoading] = useState(false); // New state for loading

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));

      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error("Your Cart is empty");
      }

      setLoading(true);
      toast.loading("Creating your order...", { id: "cod-order" });

      const token = await getToken();

      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss("cod-order");

      if (data.success) {
        toast.success(data.message || "Order placed successfully!");
        setCartItems({});
        router.push("/order-placed?method=Cash on Delivery");
      } else {
        toast.error(data.message);
        const errorMessage = encodeURIComponent(data.message || "Failed to create order");
        router.push(`/payment-failed?message=${errorMessage}&method=Cash on Delivery`);
      }
    } catch (error) {
      toast.dismiss("cod-order");
      const errorMessage = error.response?.data?.message || error.message || "Failed to create order";
      console.error("COD order error:", error);
      toast.error(errorMessage);

      const encodedMessage = encodeURIComponent(errorMessage);
      setTimeout(() => {
        router.push(`/payment-failed?message=${encodedMessage}&method=Cash on Delivery`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const createOrderStripe = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));

      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error("Your Cart is empty");
      }

      setLoading(true);
      toast.loading("Redirecting to Stripe checkout...", { id: "stripe-order" });

      const token = await getToken();

      const { data } = await axios.post(
        "/api/order/stripe",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss("stripe-order");

      if (data.success) {
        // Stripe will handle the redirect and payment status
        window.location.href = data.url;
      } else {
        toast.error(data.message);
        const errorMessage = encodeURIComponent(data.message || "Failed to initiate Stripe payment");
        router.push(`/payment-failed?message=${errorMessage}&method=Stripe`);
      }
    } catch (error) {
      toast.dismiss("stripe-order");
      const errorMessage = error.response?.data?.message || error.message || "Failed to initiate payment";
      console.error("Stripe order error:", error);
      toast.error(errorMessage);

      const encodedMessage = encodeURIComponent(errorMessage);
      setTimeout(() => {
        router.push(`/payment-failed?message=${encodedMessage}&method=Stripe`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };
  // create order for mpesa
  const createOrderMpesa = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }
      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);
      if (cartItemsArray.length === 0) {
        return toast.error("Your Cart is empty");
      }
      if (!phoneNumber) {
        return toast.error("Please enter your phone number");
      }
      if (phoneNumber.length !== 10) {
        return toast.error("Please enter a valid phone number");
      }

      // Calculate total amount
      const totalAmount = Math.ceil(getCartAmount());

      setLoading(true);
      toast.loading("Initiating M-Pesa payment...", { id: "mpesa-payment" });

      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/mpesa",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          phoneNumber: phoneNumber,
          amount: totalAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss("mpesa-payment");

      if (data.success) {
        toast.success(data.message || "STK Push sent! Please check your phone");
        setCartItems({});
        // Redirect to payment processing page to wait for confirmation
        router.push(`/payment-processing?orderId=${data.orderId}&method=M-Pesa`);
      } else {
        toast.error(data.message);
        // Redirect to payment failed page with error details
        const errorMessage = encodeURIComponent(data.message || "Payment initiation failed");
        router.push(`/payment-failed?message=${errorMessage}&method=M-Pesa`);
      }
    } catch (error) {
      toast.dismiss("mpesa-payment");
      const errorMessage = error.response?.data?.message || error.message || "Payment failed";

      console.error("M-Pesa payment error:", error);
      toast.error(errorMessage);

      // Redirect to payment failed page with error details
      const encodedMessage = encodeURIComponent(errorMessage);
      setTimeout(() => {
        router.push(`/payment-failed?message=${encodedMessage}&method=M-Pesa`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-green-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        {isPlaceOrderClicked && (
          <div>
            <label className="text-base font-medium uppercase text-gray-600 block mb-2">
              Phone Number (for M-Pesa)
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full outline-none p-2.5 text-gray-600 border"
            />
          </div>
        )}

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {formatPrice(getCartAmount())}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (0%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {formatPrice(Math.floor(getCartAmount() * 0.0))}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {formatPrice(getCartAmount() + Math.floor(getCartAmount() * 0.0))}
            </p>
          </div>
        </div>
      </div>

      {!isPlaceOrderClicked ? (
        <button
          onClick={() => setIsPlaceOrderClicked(true)}
          className="w-full bg-green-600 text-white py-2 mt-5 hover:bg-orange-700"
          disabled={loading}
        >
          Place Order
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={createOrder}
            className="w-full bg-green-600 text-white py-2 mt-5 hover:bg-orange-700 rounded-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Cash On Delivery"}
          </button>
          <button
            onClick={createOrderStripe}
            className="w-full flex justify-center items-center border border-indigo-500 bg-white hover:bg-gray-100 mt-5 py-2 rounded-md"
            disabled={loading}
          >
            <Image className="w-12" src={assets.stripe_logo} alt="Stripe" />
          </button>
          <button
            onClick={createOrderMpesa}
            className="w-full flex justify-center items-center border border-green-500 bg-white hover:bg-gray-100 mt-5 py-2 rounded-md"
            disabled={loading}
          >
            <Image className="w-12" src={assets.Mpesa_logo} alt="M-Pesa" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
