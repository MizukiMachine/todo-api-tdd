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
        // 検索エンドポイントを追加
        app.get('/todos', controller.getTodos.bind(controller));
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
    describe('GET /todos', () => {
        beforeEach(async () => {
            // テストデータを準備
            await request(app)
                .post('/todos')
                .send({ title: 'Shopping', description: 'Buy groceries' });
            await request(app)
                .post('/todos')
                .send({ title: 'Coding', description: 'Implement search' });
            const completedTodo = await request(app)
                .post('/todos')
                .send({ title: 'Reading', description: 'Read book' });
            await request(app)
                .patch(`/todos/${completedTodo.body.id}`)
                .send({ completed: true });
        });
    
        test('returns all todos when no query parameters', async () => {
            const response = await request(app).get('/todos');
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
        });
    
        test('filters todos by search term', async () => {
            const response = await request(app)
                .get('/todos')
                .query({ search: 'ing' });
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body.map((todo: any) => todo.title))
                .toEqual(expect.arrayContaining(['Shopping', 'Reading']));
        });
    
        test('filters todos by completion status', async () => {
            const response = await request(app)
                .get('/todos')
                .query({ completed: 'true' });
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Reading');
        });
    });
    describe('PATCH /todos/:id', () => {
        let todoId: string;
    
        beforeEach(async () => {
            const response = await request(app)
                .post('/todos')
                .send({ title: 'Original Title' });
            todoId = response.body.id;
        });
    
        test('updates todo with valid input', async () => {
            const response = await request(app)
                .patch(`/todos/${todoId}`)
                .send({
                    title: 'Updated Title',
                    completed: true
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                title: 'Updated Title',
                completed: true
            });
        });
    
        test('returns 404 when todo not found', async () => {
            const response = await request(app)
                .patch('/todos/non-existent-id')
                .send({ title: 'Updated Title' });
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                errors: ['Todo not found']
            });
        });
    });
});
