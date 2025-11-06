import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Next-level Clariry",
    description: "Experience crystal-clear audio with premium headphones.",
  },
  {
    id: 2,
    image: assets.man_with_earphone_image,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Work Smarter",
    description: "Shop the latest laptops, cameras, phones and more.",
  },
];

const animationVariants = (duration) => ({
  initial: { y: -10 },
  animate: {
    y: [10, -10],
    transition: {
      duration: duration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
});

const FeaturedProduct = () => {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <motion.p
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -100 }}
          transition={{ duration: 1.5 }}
          className="text-3xl font-medium"
        >
          Featured Products
        </motion.p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <motion.div
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 1.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4"
      >
        {products.map(({ id, image, title, description }) => (
          <div
            initial="initial"
            animate="animate"
            variants={animationVariants(2.5)}
            key={id}
            className="relative group"
          >
            <Image
              src={image}
              alt={title}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>
              <Link href="/all-products">
                <button className="flex items-center gap-1.5 bg-green-600 px-4 py-2 rounded">
                  Buy now{" "}
                  <Image
                    className="h-3 w-3"
                    src={assets.redirect_icon}
                    alt="Redirect Icon"
                  />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeaturedProduct;
