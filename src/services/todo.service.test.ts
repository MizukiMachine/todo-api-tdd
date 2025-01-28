// src/services/todo.service.test.ts
import { TodoService } from './todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import { CreateTodoDTO, UpdateTodoDTO } from '../types';
import { wait } from '../test-utils/helpers';


describe('TodoService', () => {
  let service: TodoService;
  let repository: TodoRepository;

  beforeEach(async () => {
    repository = new TodoRepository();
    service = new TodoService(repository);

    // テストデータを準備
    await service.createTodo({ title: 'Shopping', description: 'Buy groceries' });
    await service.createTodo({ title: 'Coding', description: 'Implement search' });
    await service.createTodo({ title: 'Exercise', description: 'Go to gym' });
    const completedTodo = await service.createTodo({ 
        title: 'Reading', 
        description: 'Read book' 
    });
    await service.updateTodo(completedTodo.id, { completed: true });
  });

  describe('createTodo', () => {
      it('creates a todo with valid input', async () => {
          const dto: CreateTodoDTO = {
              title: 'Test Todo',
              description: 'Test Description'
          };

          const todo = await service.createTodo(dto);
          
          expect(todo.title).toBe(dto.title);
          expect(todo.description).toBe(dto.description);
          expect(todo.completed).toBe(false);
      });

      it('sanitizes HTML content from input', async () => {
          const dto: CreateTodoDTO = {
              title: '<script>alert("xss")</script>Test Todo',
              description: '<img src="x" onerror="alert()">Description'
          };

          const todo = await service.createTodo(dto);
          
          expect(todo.title).toBe('Test Todo');
          expect(todo.description).toBe('Description');
      });
  });
  describe('updateTodo', () => {
    it('updates todo with valid input', async () => {
        // まず新しいTodoを作成
        const created = await service.createTodo({
            title: 'Original Title',
            description: 'Original Description'
        });

        await wait();

        const updateDto: UpdateTodoDTO = {
            title: 'Updated Title',
            description: 'Updated Description',
            completed: true
        };

        const updated = await service.updateTodo(created.id, updateDto);

        // 更新結果の検証
        expect(updated.title).toBe(updateDto.title);
        expect(updated.description).toBe(updateDto.description);
        expect(updated.completed).toBe(true);
        expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('sanitizes and validates updated fields', async () => {
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

    it('prevents updating completed todo', async () => {
        // 完了済みのTodoを作成
        const todo = await service.createTodo({ title: 'Test Todo' });
        await service.updateTodo(todo.id, { completed: true });

        // 完了済みTodoの更新を試みる
        await expect(
            service.updateTodo(todo.id, { title: 'New Title' })
        ).rejects.toThrow('Cannot update completed todo');
    });

    it('enforces maximum length constraints', async () => {
        const todo = await service.createTodo({ title: 'Test Todo' });

        await expect(
            service.updateTodo(todo.id, { 
                title: 'a'.repeat(101) 
            })
        ).rejects.toThrow('Title cannot exceed 100 characters');

        await expect(
            service.updateTodo(todo.id, { 
                description: 'a'.repeat(501) 
            })
        ).rejects.toThrow('Description cannot exceed 500 characters');
    });
  });
  describe('findTodos', () => {
    it('finds todos by title search', async () => {
        const todos = await service.findTodos({ title: 'ing' });
        
        expect(todos).toHaveLength(3);
        expect(todos.map(t => t.title)).toEqual(
            expect.arrayContaining(['Shopping', 'Coding', 'Reading'])
        );
    });

    it('finds todos by completion status', async () => {
        const completed = await service.findTodos({ completed: true });
        expect(completed).toHaveLength(1);
        expect(completed[0].title).toBe('Reading');

        const incomplete = await service.findTodos({ completed: false });
        expect(incomplete).toHaveLength(3);
    });

    it('combines search criteria', async () => {
        const todos = await service.findTodos({
            title: 'ing',
            completed: false
        });

        expect(todos).toHaveLength(2);
        expect(todos.map(t => t.title)).toEqual(
            expect.arrayContaining(['Shopping', 'Coding'])
        );
    });

    it('returns empty array when no matches found', async () => {
        const todos = await service.findTodos({ 
            title: 'nonexistent' 
        });
        expect(todos).toHaveLength(0);
    });

    it('performs case-insensitive search', async () => {
        const upperCase = await service.findTodos({ title: 'SHOPPING' });
        const lowerCase = await service.findTodos({ title: 'shopping' });
        
        expect(upperCase).toHaveLength(1);
        expect(lowerCase).toHaveLength(1);
        expect(upperCase[0]).toEqual(lowerCase[0]);
    });
  });
});
