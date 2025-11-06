"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/blog/${slug}`);

      if (data.success) {
        setBlog(data.blog);
        // Fetch related blogs from same category
        fetchRelatedBlogs(data.blog.category, data.blog._id);
      } else {
        toast.error(data.message);
        router.push("/blog");
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to load blog post");
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category, currentBlogId) => {
    try {
      const { data } = await axios.get(
        `/api/blog/list?category=${category}&limit=3`
      );

      if (data.success) {
        // Filter out current blog
        const filtered = data.blogs.filter((b) => b._id !== currentBlogId);
        setRelatedBlogs(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Blog post not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/blog")}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Blog</span>
        </button>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-full">
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {blog.authorImage && (
                <Image
                  src={blog.authorImage}
                  alt={blog.author}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-800">{blog.author}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{blog.views} views</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          {/* Cover Image */}
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-10">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-gray-200">
              <Tag className="w-5 h-5 text-gray-400" />
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Posts */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Related <span className="text-green-600">Articles</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <div
                    key={relatedBlog._id}
                    onClick={() => router.push(`/blog/${relatedBlog.slug}`)}
                    className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={relatedBlog.coverImage}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-green-600 font-medium">
                        {relatedBlog.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-800 mt-2 line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      <Footer />
    </>
  );
};

export default BlogPost;
