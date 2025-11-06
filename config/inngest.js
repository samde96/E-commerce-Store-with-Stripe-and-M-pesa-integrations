import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "Mshop-next" });

export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      clerkId: id, // Store Clerk ID in clerkId field
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
      isActive: true,
      isAdmin: false,
    };

    await connectDB();
    const existingUser = await User.findOne({ clerkId: id });
    if (!existingUser) {
      await User.create(userData);
      console.log("User created in MongoDB:", userData);
    } else {
      console.log("User already exists:", id);
    }
  }
);
// Ingest function to update user data in database

export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },

  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + "" + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  }
);

// inngest function to delete users from database

export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  {
    event: "clerk/user.deleted",
  },

  async ({ event }) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdAndDelete(id);
  }
);

// Inngest function to create user orders in DB

export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  {
    event: "order.created",
  },

  async ({ events }) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      };
    });

    await connectDB();

    await Order.insertMany(orders);

    return { success: true, processed: orders.length };
  }
);






















// import { Inngest } from "inngest";
// import connectDB from "./db";
// import User from "@/models/User";
// import Order from "@/models/Order";

// export const inngest = new Inngest({ id: "Mshop-next" });

// // ingest functions to save user data to db

// export const syncUserCreation = inngest.createFunction(
//   {
//     id: "sync-user-from-clerk",
//   },

//   {
//     event: "clerk/user.created",
//   },

//   async ({ event }) => {
//     const { id, first_name, last_name, email_addresses, image_url } =
//       event.data;
//     const userData = {
//       _id: id,
//       clerkId: id, // i added this to save clerkId in db
//       email: email_addresses[0].email_address,
//       name: first_name + "" + last_name,
//       imageUrl: image_url,
//     };

//     // create user in database
//     await connectDB();
//     await User.create(userData);
//   }
// );

// 