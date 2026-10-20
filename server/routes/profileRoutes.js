import express from "express";
import multer from "multer";

import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
  uploadMyProfilePhoto,
} from "../controllers/profileController.js";
import { deleteMyAccount } from "../controllers/accountController.js";
import { requireAuthenticatedUser } from "../middleware/authMiddleware.js";

const router = express.Router();
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new Error("Choose a PNG, JPEG, or WebP image."));
    }

    return callback(null, true);
  },
});

const parseProfilePhoto = (req, res, next) => {
  uploadImage.single("profileImage")(req, res, (error) => {
    if (error) {
      const isTooLarge = error.code === "LIMIT_FILE_SIZE";
      return res.status(isTooLarge ? 413 : 400).json({
        message: isTooLarge ? "Profile photos must be 2 MB or smaller." : error.message,
      });
    }

    return next();
  });
};

router.use(requireAuthenticatedUser);
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.post("/me/photo", parseProfilePhoto, uploadMyProfilePhoto);
router.put("/me/password", changeMyPassword);
router.delete("/me", deleteMyAccount);

export default router;