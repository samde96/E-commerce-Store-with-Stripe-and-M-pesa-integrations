"use client";
import React from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import Cartlabel from "@/components/Cartlabel";
import FavoriteButton from "@/components/FavoriteButton";
import Logo from "./ui/Logo";
import MobileMenu from "./MobileMenu";
import { Search } from "lucide-react";


const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
  const { openSignIn } = useClerk();

  const handleSignIn = () => {
    try {
      openSignIn({
        redirectUrl: window.location.href,
        appearance: {
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl'
          }
        }
      });
    } catch (error) {
      console.error('Error opening sign in:', error);
      // Fallback: redirect to Clerk's hosted sign-in page
      window.location.href = '/sign-in';
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <div className="w-auto md:w-1/3 flex items-center gap-2.5 justify-start md:gap-0 ">
        <MobileMenu />
        <Logo
          className="cursor-pointer w-28 md:w-32"
          onClick={() => router.push("/")}
          src={assets.logo}
          alt="logo"
        />
      </div>

      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-green-600 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-green-600 transition">
          Shop
        </Link>
        <Link href="/about" className="hover:text-green-600 transition">
          About Us
        </Link>
        <Link href="/blog" className="hover:text-green-600 transition">
          Blog
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs text-white border px-4 py-1.5 rounded-full bg-green-600"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      <ul className="hidden md:flex items-center gap-4 ">
        <Search className="w-5 h-5 cursor-pointer text-orange-500 hover:text-green-900" />
        <Cartlabel />
        <FavoriteButton />
        {user ? (
          <>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 hover:text-green-500 transition justify-end"
          >
            <Image src={assets.user_icon} alt="user icon" />
            SignIn
          </button>
        )}
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
        {user ? (
          <>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Home"
                  labelIcon={<HomeIcon />}
                  onClick={() => router.push("/")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                  label="Products"
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push("/all-products")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
              </UserButton.MenuItems>

              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 hover:text-green-600 transition "
          >
            <Image src={assets.user_icon} alt="user icon" />
            SignIn
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
