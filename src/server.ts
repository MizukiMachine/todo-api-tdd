// src/server.ts
import express from 'express';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { TodoRepository } from './repositories/todo.repository';
import { createTodoValidation, getTodosValidation, updateTodoValidation } 
  from './middleware/validation';

const app = express();
app.use(express.json());

// 依存関係の設定
const repository = new TodoRepository();
const service = new TodoService(repository);
const controller = new TodoController(service);

// ルーティングの設定
app.post('/todos', createTodoValidation, controller.createTodo.bind(controller));
app.get('/todos', getTodosValidation, controller.getTodos.bind(controller));
app.patch('/todos/:id', updateTodoValidation, controller.updateTodo.bind(controller));

// ポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
