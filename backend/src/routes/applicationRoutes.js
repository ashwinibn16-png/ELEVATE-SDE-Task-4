import express from 'express';
import { body, param } from 'express-validator';
import { requestCertificate, trackApplication } from '../controllers/applicationController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * Validation rules for requesting a new certificate
 */
const requestCertificateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Citizen name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Phone number must be a valid number of 7 to 20 digits.'),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required.')
    .isLength({ min: 2, max: 20 })
    .withMessage('Gender must be between 2 and 20 characters.'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters.'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters.'),
];

/**
 * Validation rules for tracking an application
 */
const trackApplicationValidation = [
  param('applicationId')
    .trim()
    .notEmpty()
    .withMessage('Application ID is required in URL parameter.'),
];

// Routes
router.post('/', requestCertificateValidation, validateRequest, requestCertificate);
router.get('/track/:applicationId', trackApplicationValidation, validateRequest, trackApplication);

export default router;
