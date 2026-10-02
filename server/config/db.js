import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("❌ Database Connection Failed");
    console.error("DATABASE CONNECTION ERROR:", error.name, error.code || "unknown");
    process.exit(1);
  }
};

export default connectDB;