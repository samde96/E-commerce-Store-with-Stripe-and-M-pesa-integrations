import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const Logo = ({ className }) => {
  return (
    <Link href={"/"} className="inline-flex">
      <h2
        className={cn(
          "text-2xl text-green-900 tracking-wide uppercase font-black cursor-pointer hover:text-green-500 hoverEffect group font-sans",
          className
        )}
      >
        Msho<span className="text-green-500  group-hover: hoverEffect">p</span>
      </h2>
    </Link>
  );
};




export default Logo;