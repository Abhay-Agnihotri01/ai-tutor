import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { createResource, updateResource, deleteResource, reorderResources } from '../controllers/resourceController.js';
import { resourceStorage } from '../config/cloudinary.js';

const router = express.Router();

const upload = multer({
  storage: resourceStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document and archive formats
    const allowedTypes = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|txt|md)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and archives are allowed.'));
    }
  }
});

router.post('/', authenticate, upload.single('resource'), createResource);
router.put('/reorder', authenticate, reorderResources);
router.put('/:id', authenticate, upload.single('resource'), updateResource);
router.delete('/:id', authenticate, deleteResource);

export default router;