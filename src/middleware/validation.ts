// src/middleware/validation.ts
import { body, query, ValidationChain } from 'express-validator';

export const createTodoValidation: ValidationChain[] = [
    body('title')
        .exists()
        .withMessage('Title is required')
        .bail()
        .notEmpty()
        .withMessage('Title must not be empty')
        .trim(),
    
    body('description')
        .optional()
        .trim(),
];

export const getTodosValidation: ValidationChain[] = [
    query('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed status must be true or false')
        .toBoolean(),
    
    query('search')
        .optional()
        .isString()
        .trim()
];

export const updateTodoValidation: ValidationChain[] = [
    body('title')
        .optional()
        .notEmpty()
        .withMessage('Title must not be empty')
        .trim(),
    
    body('description')
        .optional()
        .trim(),

    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean value')
];
