import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        
        mongoose.set('strictQuery', true);
        
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('Connected to MongoDB');
                return mongoose;
            })
            .catch((error) => {
                console.error('MongoDB connection error:', error);
                cached.promise = null; // Reset the promise on error
                throw error;
            });
    }
    
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null; // Reset the promise on error
        throw error;
    }
}

export default connectDB;