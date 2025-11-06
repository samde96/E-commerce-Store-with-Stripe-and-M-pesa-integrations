"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products uploaded by the logged-in seller
  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/products/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setProducts(data.products);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete product by ID
  const handleDelete = async (productId) => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/products/delete/[id]/?id=${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Product deleted successfully");
        fetchSellerProduct(); // Refresh product list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //edit product by ID
  const handleEdit = async (productId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/products/edit/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        router.push(`/seller/edit-product/${productId}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (user) fetchSellerProduct();
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>

          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.map((product, index) => (
                  <tr key={index} className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={product.image[0]}
                          alt="product"
                          className="w-16"
                          width={1280}
                          height={720}
                        />
                      </div>
                      <span className="truncate w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                    <td className="px-4 py-3">Ksh.{product.offerPrice}</td>
                    <td className="px-4 py-3 max-sm:hidden flex gap-2 items-center">
                      {/* Visit */}
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
                      >
                        Visit
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(product._id)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded-md"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

//  onClick={() => router.push(`/seller/edit-product/${product._id}`)}