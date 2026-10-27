import express from 'express';
import { body, param, query } from 'express-validator';
import {
  loginAdmin,
  listApplications,
  approveApplication,
  rejectApplication,
  listCertificates,
  revokeCertificate,
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * Validation rules for admin login
 */
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.'),
];

/**
 * Validation rules for application ID parameter
 */
const applicationIdParamValidation = [
  param('applicationId')
    .trim()
    .notEmpty()
    .withMessage('Application ID is required in URL parameter.'),
];

/**
 * Validation rules for certificate ID parameter
 */
const certificateIdParamValidation = [
  param('certificateId')
    .trim()
    .notEmpty()
    .withMessage('Certificate ID is required in URL parameter.'),
];

/**
 * Validation rules for rejecting an application
 */
const rejectValidation = [
  ...applicationIdParamValidation,
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters.'),
];

// 1. Admin Authentication
router.post('/login', loginValidation, validateRequest, loginAdmin);

// 2. Applications Management
router.get('/applications', authenticateAdmin, listApplications);
router.patch('/applications/:applicationId/approve', authenticateAdmin, applicationIdParamValidation, validateRequest, approveApplication);
router.patch('/applications/:applicationId/reject', authenticateAdmin, rejectValidation, validateRequest, rejectApplication);

// 3. Certificates Management
router.get('/certificates', authenticateAdmin, listCertificates);
router.patch('/certificates/:certificateId/revoke', authenticateAdmin, certificateIdParamValidation, validateRequest, revokeCertificate);

export default router;
