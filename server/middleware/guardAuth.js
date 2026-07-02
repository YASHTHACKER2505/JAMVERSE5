import jwt from "jsonwebtoken";
import Guard from "../models/Guard.js";

const guardAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const guard = await Guard.findById(decoded.id);

    if (!guard) {
      return res.status(401).json({
        success: false,
        message: "Guard not found",
      });
    }

    if (!guard.active) {
      return res.status(403).json({
        success: false,
        message: "Guard account is disabled",
      });
    }

    req.guard = guard;

    next();

  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default guardAuth;