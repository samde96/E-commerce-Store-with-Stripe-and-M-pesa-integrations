"use client";
import React, { useRef } from "react";
import { assets } from "@/assets/assets";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import Image from "next/image";

// Dynamically import LeafletMap with SSR disabled
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-300 animate-pulse">Loading map...</div>
  ),
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const form = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic email validation
    if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      alert("Please enter a valid email address");
      return;
    }

    // Send email using EmailJS
    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "your_service_id",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "your_template_id",
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "your_public_key"
      )
      .then(
        () => {
          alert("Message sent successfully!");
          setFormData({ name: "", email: "", message: "" });
        },
        (error) => {
          alert("Failed to send message. Please try again.");
          console.error("EmailJS error:", error.text);
        }
      );
  };

  return (
    <>
      <Head>
        <title>Contact Us - Mshop Store</title>
        <meta
          name="description"
          content="Get in touch with our team for any inquiries or support."
        />
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-900 to-green-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              We're here to help! Reach out with any questions, enquiries, or
              support needs.
            </p>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">
                  Send Us a Message
                </h2>
                <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-indigo-500"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your Message"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-400 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Store Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Our Store</h2>
                  <p className="text-gray-600">
                    Visit us or get in touch using the details below. We’re
                    excited to hear from you!
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-600 mr-3 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-gray-600">
                        
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-600 mr-3 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600">
                       
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-600 mr-3 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">Find Us</h2>
            <div className="w-full h-96 rounded-lg overflow-hidden">
              <LeafletMap />
            </div>
          </div>
        </section>
        
        <footer>
          <div className="flex flex-col md:flex-row max-w-full items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-300 mt-10 bg-gray-800">
            <div className="w-4/5">
              <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
              <p className="mt-6 text-sm">
                Welcome to Mshop – your trusted destination for the latest
                electronic products, smartphones, and accessories. At Mshop,
                we’re passionate about technology and committed to bringing you
                high-quality, reliable gadgets at competitive prices. Whether
                you're upgrading your phone, looking for the perfect accessory,
                or shopping for top-tier electronics, we’ve got you covered.
              </p>
            </div>

            <div className="w-1/2 flex items-center justify-start md:justify-center">
              <div>
                <h2 className="font-medium text-white mb-5">Company</h2>
                <ul className="text-sm space-y-2">
                  <li>
                    <a className="hover:underline transition" href="#">
                      Home
                    </a>
                  </li>
                  <li>
                    <a className="hover:underline transition" href="#">
                      About us
                    </a>
                  </li>
                  <li>
                    <a className="hover:underline transition" href="#">
                      Contact us
                    </a>
                  </li>
                  <li>
                    <a className="hover:underline transition" href="#">
                      Privacy policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-1/2 flex items-start justify-start md:justify-center">
              <div>
                <h2 className="font-medium text-white mb-5">Get in touch</h2>
                <div className="text-sm space-y-2">
                  <p></p>
                  <p></p>
                </div>
              </div>
            </div>
          </div>
          <p className="py-2 text-center text-xs md:text-sm">
            © {new Date().getFullYear()} Mshop. All rights reserved.{" "}
            <span className="justify-items-end">
              Powered by CEM Technologies
            </span>
          </p>
        </footer>
      </div>
    </>
  );
}
