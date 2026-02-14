import multer from "multer";
import path from "path";

// Storage for notes (existing)
const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/notes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for homework submissions
const homeworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/homework/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for notes (PDF only)
const notesFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for notes!"), false);
  }
};

// File filter for homework (PDF, images, documents)
const homeworkFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, images (JPG, PNG, GIF), and Word documents are allowed!"), false);
  }
};

// Upload configurations
const uploadNotes = multer({
  storage: notesStorage,
  fileFilter: notesFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for notes
  }
});

const uploadHomework = multer({
  storage: homeworkStorage,
  fileFilter: homeworkFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for homework submissions
  }
});

// Export both upload configurations
export { uploadNotes, uploadHomework };
export default uploadNotes; // Keep backward compatibility
