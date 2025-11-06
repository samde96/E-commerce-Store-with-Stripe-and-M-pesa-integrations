"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";


const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setOrders(data.orders);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false)
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className="max-w-6xl border-t border-gray-300 text-sm">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-lg">No orders yet</p>
                  <p className="mt-2">Start shopping to see your orders here!</p>
                </div>
              ) : (
                orders.map((order, index) => (
                  <div
                    key={index}
                    className="p-5 border-b border-gray-300 hover:bg-gray-50 transition"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap justify-between items-start mb-4 gap-3">
                      <div>
                        <p className="font-semibold text-base">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "Order Placed" ? "bg-green-100 text-green-700" :
                          order.status === "Payment Failed" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.isPaid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <Image
                            className="w-20 h-20 object-cover rounded border"
                            src={item.product.image?.[0] || assets.box_icon}
                            alt={item.product.name}
                            width={80}
                            height={80}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Quantity: {item.quantity} × {currency}{item.product.offerPrice || item.product.price}
                            </p>
                            {item.product.color && (
                              <p className="text-gray-500 text-xs">Color: {item.product.color}</p>
                            )}
                          </div>
                          <p className="font-medium text-right">
                            {currency}{(item.quantity * (item.product.offerPrice || item.product.price)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-wrap justify-between gap-4 pt-3 border-t">
                      <div>
                        <p className="text-gray-600 text-xs uppercase font-medium mb-1">Delivery Address</p>
                        <p className="font-medium">{order.address.fullName}</p>
                        <p className="text-gray-600 text-xs">{order.address.area}</p>
                        <p className="text-gray-600 text-xs">{order.address.city}, {order.address.state}</p>
                        <p className="text-gray-600 text-xs">{order.address.PhoneNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-xs uppercase font-medium mb-1">Payment Details</p>
                        <p className="text-gray-600 text-xs">Method: {order.paymentType}</p>
                        {order.mpesaReceiptNumber && (
                          <p className="text-gray-600 text-xs">Receipt: {order.mpesaReceiptNumber}</p>
                        )}
                        <p className="font-semibold text-lg mt-2">{currency}{order.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
