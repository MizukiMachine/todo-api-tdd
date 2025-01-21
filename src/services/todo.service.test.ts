import { TodoService } from './todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import { CreateTodoDTO } from '../types';

describe('TodoService', () => {
  let service: TodoService;
  let repository: TodoRepository;

  beforeEach(() => {
    repository = new TodoRepository();
    service = new TodoService(repository);
  });

  describe('createTodo', () => {
    test('creates a todo with valid input', async () => {
      const dto: CreateTodoDTO = {
          title: 'Test Todo',
          description: 'Test Description'
    };

      const todo = await service.createTodo(dto);
      
      expect(todo.title).toBe(dto.title);
      expect(todo.description).toBe(dto.description);
      expect(todo.completed).toBe(false);
    });

    test('throws error for title exceeding maximum length', async () => {
      const dto: CreateTodoDTO = {
        title: 'a'.repeat(101),  // 101文字
        description: 'Test Description'
      };

      await expect(service.createTodo(dto)).rejects.toThrow('Title cannot exceed 100 characters');
    });

    test('throws error for description exceeding maximum length', async () => {
      const dto: CreateTodoDTO = {
        title: 'Test Todo',
        description: 'a'.repeat(501)  // 501文字
      };

      await expect(service.createTodo(dto)).rejects.toThrow('Description cannot exceed 500 characters');
    });

    test('sanitizes HTML in title and description', async () => {
      const dto: CreateTodoDTO = {
        title: '<script>alert("xss")</script>Test Todo',
        description: '<b>Description</b>'
      };

      const todo = await service.createTodo(dto);

      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Description');
    });
  });
});
