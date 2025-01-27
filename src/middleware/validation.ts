import { body, ValidationChain } from 'express-validator';

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
