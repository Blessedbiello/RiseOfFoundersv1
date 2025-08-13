import { body, param, query } from 'express-validator';
import { isValidWalletAddress, isValidGitHubUrl } from '@rise-of-founders/shared';

// Common validation chains
export const validateWalletAddress = (field: string = 'walletAddress') =>
  body(field)
    .custom((value) => {
      if (!isValidWalletAddress(value)) {
        throw new Error('Invalid wallet address format');
      }
      return true;
    });

export const validateGitHubUrl = (field: string = 'url') =>
  body(field)
    .custom((value) => {
      if (!isValidGitHubUrl(value)) {
        throw new Error('Invalid GitHub URL');
      }
      return true;
    });

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const validateId = (paramName: string = 'id') =>
  param(paramName).isString().isLength({ min: 1 });

export const validateTeamName = 
  body('name')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores');

export const validateDisplayName = 
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 30 })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores');

export const validateEmail = 
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format');

export const validateUrl = (field: string) =>
  body(field)
    .optional()
    .isURL()
    .withMessage(`${field} must be a valid URL`);

export const validateDateRange = [
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('endDate').custom((endDate, { req }) => {
    if (new Date(endDate) <= new Date(req.body.startDate)) {
      throw new Error('End date must be after start date');
    }
    return true;
  }),
];