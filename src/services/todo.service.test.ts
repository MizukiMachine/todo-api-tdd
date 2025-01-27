import { TodoService } from './todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import { CreateTodoDTO, UpdateTodoDTO,TodoSearchParams } from '../types';

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

      await expect(service.createTodo(dto))
          .rejects
          .toThrow('Title cannot exceed 100 characters');
    });

    test('throws error for description exceeding maximum length', async () => {
      const dto: CreateTodoDTO = {
          title: 'Test Todo',
          description: 'a'.repeat(501)  // 501文字
      };

      await expect(service.createTodo(dto))
          .rejects
          .toThrow('Description cannot exceed 500 characters');
    });

    test('sanitizes malicious content in title and description', async () => {
      const dto: CreateTodoDTO = {
          title: '<script>alert("xss")</script>Test Todo<p onclick="alert()">',
          description: '<b onclick="alert()">Description</b><img src="x" onerror="alert()">'
      };

      const todo = await service.createTodo(dto);
      
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Description');
    });

    test('trims whitespace from title and description', async () => {
      const dto: CreateTodoDTO = {
          title: '  Test Todo  ',
          description: '  Description  '
      };

      const todo = await service.createTodo(dto);
      
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Description');
    });
  });

  describe('updateTodo', () => {
    test('updates todo with valid input', async () => {
      // まず新しいTodoを作成
      const created = await service.createTodo({
        title: 'Original Title',
        description: 'Original Description'
      });

      const updateDto: UpdateTodoDTO = {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      };

      const updated = await service.updateTodo(created.id, updateDto);

      expect(updated.title).toBe(updateDto.title);
      expect(updated.description).toBe(updateDto.description);
      expect(updated.completed).toBe(true);
    });

    test('sanitezes and validates updated fields', async () => {
      const created = await service.createTodo({
        title: 'Original Title'
      });

      const updateDto: UpdateTodoDTO = {
        title: '<script>alert("xss")</script>Updated Title  ',
        description: '  <b>New</b> Description  '
      };

      const updated = await service.updateTodo(created.id, updateDto);

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('New Description');
    });

    test('prevents updateing completed todo', async () => {
      // 完了済のTodoを作成
      const todo = await service.createTodo({ title: 'Test Todo'});
      await service.updateTodo(todo.id, { completed: true});

      // 完了済Todoの更新を試みる
      await expect(
          service.updateTodo(todo.id, {title: 'New Title'})
      ).rejects.toThrow('Cannot update completed todo');
    });

    test('throws error when todo not found', async () => {
      await expect(
          service.updateTodo('non-existent-id', {title: 'New Title'})
      ).rejects.toThrow('Todo not found');
    });
  });

  describe('findTodos', () => {
    beforeEach(async () => {
      // テストデータを準備
      await service.createTodo({ title: 'Shopping', description: 'Buy groceries' });
      await service.createTodo({ title: 'Coding', description: 'Implement search' });
      await service.createTodo({ title: 'Exercise', description: 'Go to gym' });
      const completedTodo = await service.createTodo({ title: 'Reading', description: 'Read book' });
      await service.updateTodo(completedTodo.id, { completed: true });
    });

    test('finds todos by title search', async () => {
      const todos = await service.findTodos({ title: 'ing' });
      expect(todos).toHaveLength(3);
      expect(todos.map(t => t.title)).toEqual(
          expect.arrayContaining(['Shopping', 'Coding', 'Reading'])
      );
    });

    test('finds todos by completion status', async () => {
      const completed = await service.findTodos({ completed: true });
      expect(completed).toHaveLength(1);
      expect(completed[0].title).toBe('Reading');

      const incomplete = await service.findTodos({ completed: false });
      expect(incomplete).toHaveLength(3);
    });

    test('combines search criteria', async () => {
      const todos = await service.findTodos({
          title: 'ing',
          completed: false
      });
      expect(todos).toHaveLength(2);
      expect(todos.map(t => t.title)).toEqual(
        expect.arrayContaining(['Shopping', 'Coding'])
        );
    });

    test('returns empty array when no matches found', async () => {
      const todos = await service.findTodos({ title: 'nonexistent' });
      expect(todos).toHaveLength(0);
    });
  });
});
