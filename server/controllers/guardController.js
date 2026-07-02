import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Guard from "../models/Guard.js";
import Booking from "../models/Booking.js";

// ======================
// GUARD LOGIN
// ======================

export const loginGuard = async (req, res) => {
  try {
    const { email, password } = req.body;

    const guard = await Guard.findOne({ email });

    if (!guard) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (!guard.active) {
      return res.status(403).json({
        success: false,
        message: "Guard account is disabled",
      });
    }

    const match = await bcrypt.compare(
      password,
      guard.password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    guard.lastLogin = new Date();
    await guard.save();

    const token = jwt.sign(
      {
        id: guard._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.json({
      success: true,
      token,
      guard: {
        id: guard._id,
        name: guard.name,
        email: guard.email,
      },
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
// VERIFY QR
// ======================

export const verifyTicket = async (req, res) => {
  try {

    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      bookingId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid Ticket",
      });
    }

    if (booking.paymentStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Ticket Not Approved",
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
// CHECK IN TICKET
// ======================

export const checkInTicket = async (req, res) => {
  try {

    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      bookingId,
    });

    // Ticket doesn't exist
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid Ticket",
      });
    }

    // Payment not approved
    if (booking.paymentStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Ticket Not Approved",
      });
    }

    // Already entered
    if (booking.checkedIn) {
      return res.status(400).json({
        success: false,
        message: "Ticket Already Used",
        booking,
      });
    }

    // Allow entry
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.guard._id;

    await booking.save();

    res.json({
      success: true,
      message: "Entry Allowed",
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