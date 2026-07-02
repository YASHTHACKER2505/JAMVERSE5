import Booking from "../models/Booking.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import generateBookingId from "../utils/generateBookingId.js";

export const createBooking = async (req, res) => {
  console.log("\n========== NEW BOOKING REQUEST ==========");

  try {
    console.log("✅ Controller Reached");

    console.log("📦 Body:");
    console.log(req.body);

    console.log("📷 File:");
    console.log(req.file);

    const {
      fullName,
      email,
      mobile,
      city,
      age,
      gender,
      tickets,
      transactionId,
    } = req.body;
    // Check if transaction ID already exists
const existingTransaction = await Booking.findOne({
  transactionId: transactionId.trim(),
});

if (existingTransaction) {
  return res.status(400).json({
    success: false,
    message: "This Transaction ID has already been used.",
  });
}

    if (!req.file) {
      console.log("❌ No payment screenshot received.");

      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required.",
      });
    }

    console.log("☁️ Uploading to Cloudinary...");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "jamverse",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Error:");
            console.error(error);
            return reject(error);
          }

          console.log("✅ Cloudinary Upload Successful");

          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    console.log("📄 Generating Booking ID...");

    const totalBookings = await Booking.countDocuments();

    const bookingId = generateBookingId(totalBookings);

    console.log("Booking ID:", bookingId);

    console.log("💾 Saving to MongoDB...");

    const booking = await Booking.create({
      bookingId,
      fullName,
      email,
      mobile,
      city,
      age,
      gender,
      tickets,
      transactionId,
      paymentScreenshot: result.secure_url,
      totalAmount: 499 * Number(tickets),
    });

    console.log("✅ Booking Saved Successfully");

    res.status(201).json({
      success: true,
      message: "Booking Submitted Successfully",
      booking,
    });

  } catch (error) {
    console.error("\n❌ BOOKING ERROR ❌");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};