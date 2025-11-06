"use client";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useSignIn } from "@clerk/nextjs";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "@/components/Loading";

const AddAddress = () => {

  const { getToken, router, user } = useAppContext();
  const { openSignIn } = useSignIn();
  const [loading, setLoading] = useState(true);

  const [address, setAddress] = useState({
    fullName: "",
    PhoneNumber: "",
    postalcode: "",
    area: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    // Check if user is logged in
    if (user === null) {
      // Still loading user state
      return;
    }

    if (!user) {
      // User is not logged in, open sign-in modal
      toast.error("Please sign in to add an address");
      try {
        openSignIn({
          redirectUrl: window.location.href
        });
      } catch (error) {
        console.error('Error opening sign in:', error);
        toast.error("Please sign in from the navbar");
      }
    } else {
      setLoading(false);
    }
  }, [user, openSignIn]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();

      if (!token) {
        toast.error("Please sign in to add an address");
        try {
          openSignIn({
            redirectUrl: window.location.href
          });
        } catch (error) {
          console.error('Error opening sign in:', error);
        }
        return;
      }

      // get request api
      const { data } = await axios.post(
        "/api/user/add-address",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
        // response
      if (data.success) {
        toast.success(data.message);
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            Add Shipping{" "}
            <span className="font-semibold text-green-600">Address</span>
          </p>
          <div className="space-y-3 max-w-sm mt-10">
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-green-500 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Full name"
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              value={address.fullName}
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-green-500 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Phone number"
              onChange={(e) =>
                setAddress({ ...address, PhoneNumber: e.target.value })
              }
              value={address.PhoneNumber}
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-green-500 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Postal code"
              onChange={(e) =>
                setAddress({ ...address, postalcode: e.target.value })
              }
              value={address.postalcode}
            />
            <textarea
              className="px-2 py-2.5 focus:border-orange-500 transition border border-green-500 rounded outline-none w-full text-gray-500 resize-none"
              type="text"
              rows={4}
              placeholder="Address (Area and Street)"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
            ></textarea>
            <div className="flex space-x-3">
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-green-500 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="City/District/Town"
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                value={address.city}
              />
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-green-500 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="State"
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                value={address.state}
              />
            </div>
          </div>
          <button
            type="submit"
            className="max-w-sm w-full mt-6 bg-green-600 text-white py-3 hover:bg-orange-700 uppercase"
          >
            Save address
          </button>
        </form>
        <Image
          className="md:mr-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;
