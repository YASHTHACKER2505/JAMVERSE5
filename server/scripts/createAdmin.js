// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import mongoose from "mongoose";
// import Admin from "../models/Admin.js";

// dotenv.config();

// const createAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);

//     const existingAdmin = await Admin.findOne({
//       email: "yashthacker5340.com",
//     });
//     if (existingAdmin) {
//       console.log("⚠️ Admin already exists.");
//       process.exit();
//     }

//     const hashedPassword = await bcrypt.hash("Y", 10);

//     await Admin.create({
//       name: "Administrator",
//       email: "yashthacker5340@gmail.com",
//       password: hashedPassword,
//     });

//     console.log("✅ Admin Created Successfully");
//     console.log("Email: admin@jamverse.com");
//     console.log("Password: Admin@123");

//     process.exit();

//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// createAdmin();
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Guard from "../models/Guard.js";

dotenv.config();

const createGuard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingGuard = await Guard.findOne({
      email: "yashthacker5340@gmail.com",
    });

    if (existingGuard) {
      console.log("⚠️ Guard already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Y", 10);

    await Guard.create({
      name: "Security Guard",
      email: "yashthacker5340@gmail.com",
      password: hashedPassword,
      active: true,
    });

    console.log("✅ Security Guard Created Successfully");
    console.log("Email: guard@jamverse.com");
    console.log("Password: Guard@123");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createGuard();