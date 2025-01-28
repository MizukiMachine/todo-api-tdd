import { TodoController } from './todo.controller';
import { TodoService } from '../services/todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import request from 'supertest';
import express, { Express } from 'express';
import { createTodoValidation, getTodosValidation } from '../middleware/validation';

describe('TodoController', () => {
    let app: Express;
    let controller: TodoController;
    let service: TodoService;

    beforeEach(async () => {
        app = express();
        app.use(express.json());
        
        const repository = new TodoRepository();
        service = new TodoService(repository);
        controller = new TodoController(service);

        // ルートの設定
        app.get('/todos', getTodosValidation, controller.getTodos.bind(controller));
        app.post('/todos', createTodoValidation, controller.createTodo.bind(controller));
        app.patch('/todos/:id', controller.updateTodo.bind(controller));

        // テストデータを準備
        const todo1 = await request(app)
        .post('/todos')
        .send({ title: 'Shopping', description: 'Buy groceries' });

        const todo2 = await request(app)
        .post('/todos')
        .send({ title: 'Coding', description: 'Implement search' });

        const todo3 = await request(app)
        .post('/todos')
        .send({ title: 'Reading', description: 'Read book' });

        // 完了状態の更新を待つ
        await request(app)
        .patch(`/todos/${todo3.body.id}`)
        .send({ completed: true });
    });

    describe('POST /todos', () => {
        it('creates a new todo with valid input', async () => {
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

        it('returns 400 when title is missing', async () => {
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
    
        it('returns 400 when title is empty', async () => {
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
    });

    describe('GET /todos', () => {
        it('returns all todos when no query parameters', async () => {
            const response = await request(app).get('/todos');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
        });

        it('filters todos by search term', async () => {
            const response = await request(app)
                .get('/todos')
                .query({ search: 'ing' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
            expect(response.body.map((todo: any) => todo.title))
                .toEqual(expect.arrayContaining(['Shopping', 'Coding', 'Reading']));
        });

        it('filters todos by completion status', async () => {
            const response = await request(app)
                .get('/todos')
                .query({ completed: 'true' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Reading');
        });

        it('handles invalid completed parameter', async () => {
            const response = await request(app)
                .get('/todos')
                .query({ completed: 'invalid' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                errors: ['Completed status must be true or false']
            });
        });
    });
});
