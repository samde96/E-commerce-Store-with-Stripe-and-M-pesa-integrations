import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  coverImage: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorImage: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Fashion', 'Lifestyle', 'Business', 'Tips & Tricks', 'Reviews', 'News']
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create slug from title if not provided
blogSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;
