import { TodoService } from './todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import { CreateTodoDTO, UpdateTodoDTO } from '../types';

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
  });
});
