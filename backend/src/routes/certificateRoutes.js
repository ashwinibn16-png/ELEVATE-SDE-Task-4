import express from 'express';
import { param } from 'express-validator';
import { verifyCertificate } from '../controllers/certificateController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * Validation rules for certificate verification
 */
const verifyCertificateValidation = [
  param('certificateId')
    .trim()
    .notEmpty()
    .withMessage('Certificate ID is required in URL parameter.'),
];

// Routes
router.get('/verify/:certificateId', verifyCertificateValidation, validateRequest, verifyCertificate);

export default router;
