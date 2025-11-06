import React from "react";
import { motion } from "framer-motion"


const NewsLetter = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 pt-8 pb-14">
      <motion.h1 
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: -100 }}
      transition={{ duration: 1.5 }}  
      className="md:text-4xl text-2xl font-medium text-green-600">
        Subscribe now & get 20% off
      </motion.h1>
      <p className="md:text-base text-gray-500/80 pb-8">
      Stay updated with the latest gadgets, exclusive offers, and electronics.
      </p>
      <div className="flex items-center justify-between max-w-2xl w-full md:h-14 h-12">
        <input
          className="border border-gray-500/30 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
          type="text"
          placeholder="Enter your email id"
        />
        <button className="md:px-12 px-8 h-full text-white bg-green-600 rounded-md rounded-l-none">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default NewsLetter;
