import { TodoController } from './todo.controller';
import { TodoService } from '../services/todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import request from 'supertest';
import express, { Express } from 'express';
import { createTodoValidation } from '../middleware/validation';

describe('TodoController', () => {
    let app: Express;
    let controller: TodoController;
    let service: TodoService;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        
        const repository = new TodoRepository();
        service = new TodoService(repository);
        controller = new TodoController(service);
    
        // バリデーションミドルウェアを追加
        app.post('/todos', createTodoValidation, controller.createTodo.bind(controller));
    });
    describe('POST /todos', () => {
        test('creates a new todo with valid input', async () => {
            const response = await request(app)
                .post('/todos')
                .send({
                    title: 'Test Todo',
                    description: 'Test Description'
                });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                title: 'Test Todo',
                description: 'Test Description',
                completed: false
            });
            expect(response.body.id).toBeDefined();
        });
        test('returns 400 when title is missing', async () => {
            const response = await request(app)
                .post('/todos')
                .send({
                    description: 'Test Description'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                errors: ['Title is required']
            });
        });
        test('returns 400 when title is empty', async () => {
            const response = await request(app)
                .post('/todos')
                .send({
                    title: '',
                    description: 'Test Description'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                errors: ['Title must not be empty']
            });
        });
        test('handles service errors gracefully', async () => {
            const response = await request(app)
                .post('/todos')
                .send({
                    title: 'a'.repeat(101),  // 最大長を超過
                    description: 'Test Description'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                errors: ['Title cannot exceed 100 characters']
            });
        });
    });
});
