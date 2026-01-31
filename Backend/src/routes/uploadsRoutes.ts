import express from "express";
import type { Request } from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { ApiError } from "../utils/apiError.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const uploadToCloudinary = (file: Request["file"]) =>
  new Promise<string>((resolve, reject) => {
    if (!file) {
      reject(new ApiError(400, "Image file is required"));
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shiv-furniture/contacts",
        resource_type: "image",
      },
      (err, result) => {
        if (err || !result) {
          reject(err ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url || result.url);
      },
    );

    stream.end(file.buffer);
  });

router.post(
  "/uploads/contact-image",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  upload.single("image"),
  async (req, res, next) => {
    try {
      const url = await uploadToCloudinary(req.file);
      res.status(201).json({ data: { url } });
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
        return;
      }
      next(new ApiError(500, "Image upload failed", error));
    }
  },
);

export const uploadsRoutes = router;
