import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const imageOnly = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(Object.assign(new Error("Please upload an image file"), { status: 400 }));
};

export const upload = multer({ storage, fileFilter: imageOnly, limits: { fileSize: 5 * 1024 * 1024 } });
