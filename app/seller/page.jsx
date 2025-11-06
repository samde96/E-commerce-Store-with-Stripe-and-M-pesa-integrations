"use client";
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AddProduct = () => {
  const { getToken } = useAppContext();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Earphone");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("in_stock");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState(""); // Assuming brand is a static value for now

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one image is uploaded
    const validFiles = files.filter(file => file !== undefined && file !== null);
    if (validFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = validFiles.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error("Please upload only image files (JPEG, PNG, WebP, GIF)");
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = validFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);
    formData.append("stockStatus", stockStatus);
    formData.append("color", color);
    formData.append("brand", brand || "Brand Name");

    // Only append valid files
    validFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      toast.loading("Uploading product...", { id: "upload" });
      const token = await getToken();
      const { data } = await axios.post("/api/products/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      toast.dismiss("upload");

      if (data.success) {
        toast.success(data.message);
        // Reset form
        setFiles([]);
        setName("");
        setDescription("");
        setCategory("Earphone");
        setPrice("");
        setOfferPrice("");
        setStockStatus("in_stock");
        setColor("");
        setBrand("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss("upload");
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to add product");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  onChange={(e) => {
                    const updatedFiles = [...files];
                    updatedFiles[index] = e.target.files[0];
                    setFiles(updatedFiles);
                  }}
                  type="file"
                  id={`image${index}`}
                  hidden
                />
                <Image
                  key={index}
                  className="max-w-24 cursor-pointer"
                  src={
                    files[index]
                      ? URL.createObjectURL(files[index])
                      : assets.upload_area
                  }
                  alt=""
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Accessories">Accessories</option>
              <option value="TV">TV</option>
              <option value="Speaker">Speaker</option>
              <option value="Tablet">Tablet</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Fridge">Fridge</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="stock-status">
              Stock Status
            </label>
            <select
              id="stock-status"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStockStatus(e.target.value)}
              value={stockStatus}
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="limited_stock">Limited Stock</option>
            </select>
          </div>
          {/* // Color */}
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="color">
              Color
            </label>
            <input
              id="color"
              type="text"
              placeholder="Color here"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setColor(e.target.value)}
              value={color}
              required
            />
          </div>
          {/* //Brand */}

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="brand">
              Brand
            </label>
            <input
              id="brand"
              type="text"
              placeholder="Brand here"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setBrand(e.target.value)}
              value={brand}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
