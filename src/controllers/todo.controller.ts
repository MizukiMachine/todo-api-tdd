import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TodoService } from '../services/todo.service';
import { CreateTodoDTO } from '../types';

export class TodoController {
    constructor(private service: TodoService) {}

    async createTodo(req: Request, res: Response): Promise<void> {
        try {
            // バリデーション結果のチェック
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ 
                    errors: errors.array().map(err => err.msg)
                });
                return;
            }

            const todo = await this.service.createTodo(req.body as CreateTodoDTO);
            res.status(201).json(todo);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ 
                    errors: [error.message]
                });
            } else {
                res.status(500).json({ 
                    errors: ['Internal server error']
                });
            }
        }
    }
}
