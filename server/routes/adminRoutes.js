import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Booking from "../models/Booking.js";
import generateTicketPDF from "../services/pdfService.js";

import {
  loginAdmin,
  getDashboardStats,
  getAllBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
} from "../controllers/adminController.js";const router = express.Router();

// =======================
// AUTH
// =======================

router.post("/login", loginAdmin);

// =======================
// DASHBOARD
// =======================

router.get(
  "/dashboard",
  authMiddleware,
  getDashboardStats
);

// =======================
// BOOKINGS
// =======================

router.get(
  "/bookings",
  authMiddleware,
  getAllBookings
);
router.get(
  "/bookings/:id",
  authMiddleware,
  getBookingById
);
router.patch(
  "/bookings/:id/approve",
  authMiddleware,
  approveBooking
);

router.patch(
  "/bookings/:id/reject",
  authMiddleware,
  rejectBooking
);
// =======================
// TEST ROUTE
// =======================

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});
// =======================
// TEST PDF
// =======================

router.get("/test-pdf", async (req, res) => {
  try {
    const booking = await Booking.findOne();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No booking found",
      });
    }

    const pdfBuffer = await generateTicketPDF(booking);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${booking.bookingId}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF TEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
export default router;