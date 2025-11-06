import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";


const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row max-w-full items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-300 mt-10">
       
        <div className="w-4/5">
          <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
          Welcome to Mshop – your trusted destination for the latest electronic products, smartphones, and accessories. At Mshop, we’re passionate about technology and committed to bringing you high-quality, reliable gadgets at competitive prices. Whether you're upgrading your phone, looking for the perfect accessory, or shopping for top-tier electronics, we’ve got you covered. 
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-white mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="#">Home</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Contact us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch 1</h2>
            <div className="text-sm space-y-2">
              <p>gh</p>
              <p></p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-2 text-center text-xs md:text-sm">
        © {new Date().getFullYear()} Mshop. All rights reserved. { " "}   <span className="justify-items-end">Powered by CEM Technologies</span>
      </p>
     
    </footer>
  );
};

export default Footer;