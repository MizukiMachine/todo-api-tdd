import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { CreateTodoDTO, TodoSearchParams } from '../types';
import { validationResult } from 'express-validator';

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

    async getTodos(req: Request, res: Response): Promise<void> {
        try {
            // バリデーション結果のチェック
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ 
                    errors: errors.array().map(err => err.msg)
                });
                return;
            }

            const { search, completed } = req.query;

            const searchParams: TodoSearchParams = {};
            if (typeof search === 'string') {
                searchParams.title = search;
            }
            if (completed !== undefined) {
                // 型を文字列に変換してから比較
                // completedがboolean型
                searchParams.completed = String(completed).toLowerCase() === 'true';
            }

            const todos = await this.service.findTodos(searchParams);
            res.json(todos);
        } catch (error) {
            res.status(500).json({ 
                errors: ['Internal server error']
            });
        }
    }
    
    async updateTodo(req: Request, res: Response): Promise<void> {
        try {
            // バリデーション結果のチェック
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ 
                    errors: errors.array().map(err => err.msg)
                });
                return;
            }

            try {
                const todo = await this.service.updateTodo(
                    req.params.id,
                    req.body
                );
                res.json(todo);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Todo not found') {
                        res.status(404).json({ errors: [error.message] });
                        return;
                    }
                    res.status(400).json({ errors: [error.message] });
                } else {
                    throw error; // 予期せぬエラーは外側のcatchで処理
                }
            }
        } catch (error) {
            res.status(500).json({ errors: ['Internal server error'] });
        }
    }
}
