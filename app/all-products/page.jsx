'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { ScrollToTop } from "@/components/ui/ScrollButton";
import { ArrowUpToLine } from "lucide-react";
import { motion } from "framer-motion";

const AllProducts = () => {

    const { products } = useAppContext();

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                <div className="flex flex-col items-end pt-12">
                    <motion.p 
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ duration: 1.5 }}
                    className="text-2xl font-medium">All products</motion.p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
                    {products.map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
            </div>
            <div className="relative ">
            <ScrollToTop minHeight={35} scrollTo={10} className="absolute right-4 bottom-4 text-white bg-green-500">
                <ArrowUpToLine />
            </ScrollToTop>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
