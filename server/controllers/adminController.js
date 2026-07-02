import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import Booking from "../models/Booking.js";
import generateQRCode from "../services/qrService.js";
import generateTicketPDF from "../services/pdfService.js";
import uploadPdfToCloudinary from "../services/uploadPdfService.js";
import { sendApprovalMail } from "../services/mailService.js";

// ======================
// ADMIN LOGIN
// ======================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================
// DASHBOARD
// ======================

export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();

    const pending = await Booking.countDocuments({
      paymentStatus: "Pending",
    });

    const approved = await Booking.countDocuments({
      paymentStatus: "Approved",
    });

    const bookings = await Booking.find();

    const revenue = bookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0
    );

    res.json({
      success: true,
      totalBookings,
      pending,
      approved,
      revenue,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================
// GET ALL BOOKINGS
// ======================

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      bookings,
    });
    

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
  
}
// ======================
// GET SINGLE BOOKING
// ======================

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ======================
// APPROVE BOOKING
// ======================

export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.paymentStatus}`,
      });
    }

    console.log("✅ Approving Booking...");

    // 1. Approve
    booking.paymentStatus = "Approved";
    booking.approvedAt = new Date();

    // 2. Generate QR
    console.log("📱 Generating QR...");
    booking.qrCode = await generateQRCode(booking.bookingId);

    // 3. Generate PDF
    console.log("📄 Generating PDF...");
    const pdfBuffer = await generateTicketPDF(booking);

    // 4. Upload PDF
    console.log("☁️ Uploading PDF...");
    const uploadedPdf = await uploadPdfToCloudinary(
      pdfBuffer,
      booking.bookingId
    );

    // 5. Save URL
    booking.ticketPdf = uploadedPdf.secure_url;
    booking.pdfGenerated = true;

    // 6. Save booking
    await booking.save();
    await sendApprovalMail(
    booking,
    pdfBuffer
);

    console.log("✅ Booking Approved Successfully");

    res.json({
      success: true,
      message: "Booking Approved Successfully",
      booking,
    });

  } catch (error) {
    console.log("❌ APPROVE ERROR");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};// ======================
// REJECT BOOKING
// ======================

export const rejectBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.paymentStatus}`,
      });
    }

    booking.paymentStatus = "Rejected";

    await booking.save();

    res.json({
      success: true,
      message: "Booking Rejected Successfully",
      booking,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};