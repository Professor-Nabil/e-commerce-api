import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (_req, file, cb) => {
    // Creating a unique name: timestamp-originalName
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new AppError(
        "Only images (jpeg, jpg, png, webp) are allowed",
        400,
      ) as any,
      false,
    );
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
