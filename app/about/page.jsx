import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Navbar from '@/components/Navbar';

const AboutPage = () => {
  const categoryData = [
    {
      name: 'Smartphones & Watches',
      image: assets.oraimo_smartwatch_image,
      desc: 'Stay connected with the latest smartphones and smartwatches',
    },
    {
      name: 'Laptops & Cameras',
      image: assets.victus_laptop_image,
      desc: 'Capture moments and work efficiently with top-tier devices',
    },
    {
      name: 'Office Furniture & Desks',
      image: assets.office_furniture,
      desc: 'Create a productive workspace with ergonomic designs',
    },
    {
      name: 'Studio Equipment',
      image: assets.aperture_lightbox,
      desc: 'Elevate your creative projects with professional gear.',
    },
  ];

  return (
    <>
    <Navbar />
      <Head>
        <title>About Us - Mshop Store</title>
        <meta name="description" content="Learn more about our e-commerce store, offering top-quality electrical products, smartphones, laptops, and more." />
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-900 to-green-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Mshop Store</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Empowering your lifestyle with cutting-edge technology, stylish accessories, and functional office solutions.
            </p>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  At Mshop Store, we are dedicated to providing high-quality electrical products, innovative gadgets, and stylish office solutions to enhance your daily life. From smartphones and laptops to study desks and studio equipment, we aim to offer products that combine functionality with modern design.
                </p>
                <p className="text-gray-600">
                  Our goal is to make technology and comfort accessible to everyone, with a seamless shopping experience and exceptional customer support.
                </p>
              </div>
              <div className="relative h-96">
                <Image
                  src={assets.happy_man}
                  alt="Our Mission"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories Section */}
        <section className="py-16 bg-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-8 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categoryData.map((category, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-2">{category.name}</h3>
                    <p className="text-gray-600">{category.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-orange-500">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Quality', desc: 'We source only the best products to ensure durability and performance.', icon: 'M12 8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm0 0c0 2.21-1.79 4-4 4S4 10.21 4 8s1.79-4 4-4 4 1.79 4 4z' },
                { title: 'Innovation', desc: 'We embrace the latest technology to bring you cutting-edge solutions.', icon: 'M12 2l10 18H2L12 2zm0 4v8m0 4h.01' },
                { title: 'Customer First', desc: 'Your satisfaction is our priority, with dedicated support and service.', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
              ].map((value) => (
                <div key={value.title} className="text-center">
                  <svg className="w-12 h-12 text-white/80 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={value.icon} />
                  </svg>
                  <h3 className="text-xl font-medium mb-2 text-white/60">{value.title}</h3>
                  <p className="text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Mshop Store. All rights reserved.  Powered by CEM Technologies</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AboutPage;