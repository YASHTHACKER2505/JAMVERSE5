import express from "express";
import guardAuth from "../middleware/guardAuth.js";

import {
  loginGuard,
  verifyTicket,
  checkInTicket,
} from "../controllers/guardController.js";
const router = express.Router();

// ======================
// LOGIN
// ======================

router.post("/login", loginGuard);

// ======================
// VERIFY TICKET
// ======================

router.post(
  "/verify",
  guardAuth,
  verifyTicket
);
router.post(
  "/checkin",
  guardAuth,
  checkInTicket
);

// ======================
// CURRENT GUARD
// ======================

router.get("/me", guardAuth, (req, res) => {
  res.json({
    success: true,
    guard: {
      id: req.guard._id,
      name: req.guard.name,
      email: req.guard.email,
    },
  });
});

export default router;