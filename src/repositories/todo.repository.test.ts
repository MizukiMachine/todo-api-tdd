// src/services/todo.repository.test.ts
import { TodoRepository } from './todo.repository';
import { CreateTodoDTO, UpdateTodoDTO } from '../types';
import { TodoValidationError } from '../errors/todo.errors';
import { wait } from '../test-utils/helpers';

describe('TodoRepository', () => {
  let repository: TodoRepository;

  beforeEach(() => {
      // 各テストケース実行前にリポジトリを初期化
      repository = new TodoRepository();
  });

  describe('create', () => {
    it('creates a new todo with required fields', async () => {
        const dto: CreateTodoDTO = {
            title: 'Test Todo'
        };

        const todo = await repository.create(dto);

        // 新しいTodoが正しく作成されていることを確認
        expect(todo.id).toBeDefined();
        expect(todo.title).toBe(dto.title);
        expect(todo.completed).toBe(false);
        expect(todo.createdAt).toBeInstanceOf(Date);
        expect(todo.updatedAt).toBeInstanceOf(Date);
    });
    it('throws TodoValidationError for empty title', async () => {
      const dto: CreateTodoDTO = {
          title: ''
      };

      await expect(repository.create(dto))
          .rejects
          .toThrow(TodoValidationError);
      
      await expect(repository.create(dto))
          .rejects
          .toHaveProperty('name', 'TodoValidationError');
    });

    it('throws error for title with only whitespace', async () => {
        const dto: CreateTodoDTO = {
            title: '   '
        };

        await expect(repository.create(dto))
            .rejects
            .toThrow('Title cannot be empty');
    });

    it('trims whitespace from title', async () => {
        const dto: CreateTodoDTO = {
            title: '  Test Todo  '
        };

        const todo = await repository.create(dto);
        expect(todo.title).toBe('Test Todo');
    });

    it('trims whitespace from description when provided', async () => {
        const dto: CreateTodoDTO = {
            title: 'Test Todo',
            description: '  Test Description  '
        };

        const todo = await repository.create(dto);
        expect(todo.description).toBe('Test Description');
    });
  });
  describe('findById', () => {
    it('returns todo when exists', async () => {
        // テストデータの作成
        const created = await repository.create({
            title: 'Find Me'
        });

        // IDによる検索
        const found = await repository.findById(created.id);
        
        // 検索結果の検証
        expect(found).toEqual(created);
    });

    it('returns null when todo does not exist', async () => {
        const found = await repository.findById('non-existent-id');
        expect(found).toBeNull();
    });

    it('returns exact todo when multiple todos exist', async () => {
        // 複数のTodoを作成
        const todo1 = await repository.create({ title: 'Todo 1' });
        const todo2 = await repository.create({ title: 'Todo 2' });
        
        // 特定のTodoを検索
        const found = await repository.findById(todo1.id);
        
        // 正しいTodoが取得できていることを確認
        expect(found).toEqual(todo1);
        expect(found).not.toEqual(todo2);
    });
  });
  describe('findAll', () => {
    it('returns empty array when no todos exist', async () => {
        const todos = await repository.findAll();
        expect(todos).toEqual([]);
    });

    it('returns all todos in array', async () => {
        // テスト用のTodoを2件作成
        const todo1 = await repository.create({ title: 'Todo 1' });
        const todo2 = await repository.create({ title: 'Todo 2' });

        const todos = await repository.findAll();
        
        // 検証
        expect(todos).toHaveLength(2);
        expect(todos).toEqual(expect.arrayContaining([todo1, todo2]));
    });

    it('maintains todo order', async () => {
      // 順序付きでTodoを作成
      const createPromises = ['A', 'B', 'C'].map(title => 
          repository.create({ title: `Todo ${title}` })
      );
      const createdTodos = await Promise.all(createPromises);

      const todos = await repository.findAll();
      
      // 作成順が維持されていることを確認
      todos.forEach((todo, index) => {
          expect(todo).toEqual(createdTodos[index]);
      });
    });
  });
  describe('update', () => {
    it('updates todo fields correctly', async () => {
        // テスト用のTodoを作成
        const todo = await repository.create({
            title: 'Original Title',
            description: 'Original Description'
        });

        // updatedAtの比較テストのため、
        // Date オブジェクトの解像度（ミリ秒）の制限により
        // 意図的に時間差を作る
        await wait();

        // 更新用のDTOを作成
        const updateDto: UpdateTodoDTO = {
            title: 'Updated Title',
            description: 'Updated Description',
            completed: true
        };

        // Todoを更新
        const updated = await repository.update(todo.id, updateDto);

        // 更新結果の検証
        expect(updated.title).toBe(updateDto.title);
        expect(updated.description).toBe(updateDto.description);
        expect(updated.completed).toBe(true);
        expect(updated.updatedAt.getTime()).toBeGreaterThan(todo.updatedAt.getTime());
        expect(updated.id).toBe(todo.id); // IDは変更されないことを確認
    });

    it('maintains unchanged fields', async () => {
        // 元のTodoを作成
        const todo = await repository.create({
            title: 'Original Title',
            description: 'Original Description'
        });

        await wait();

        // タイトルのみを更新
        const updated = await repository.update(todo.id, {
            title: 'Updated Title'
        });

        // 説明文が維持されていることを確認
        expect(updated.title).toBe('Updated Title');
        expect(updated.description).toBe('Original Description');
        expect(updated.updatedAt.getTime()).toBeGreaterThan(todo.updatedAt.getTime());

    });

    it('throws error when todo does not exist', async () => {
        await expect(
            repository.update('non-existent-id', { title: 'New Title' })
        ).rejects.toThrow('Todo not found');
    });

    it('applies validation rules to updated fields', async () => {
        const todo = await repository.create({
            title: 'Original Title'
        });

        // 空白のタイトルでの更新を試みる
        await expect(
            repository.update(todo.id, { title: '   ' })
        ).rejects.toThrow('Title cannot be empty');
    });
  });
  describe('delete', () => {
    it('deletes existing todo', async () => {
        // 削除対象のTodoを作成
        const todo = await repository.create({
            title: 'Delete Me'
        });

        // Todoを削除
        await repository.delete(todo.id);

        // 削除したTodoが取得できないことを確認
        const found = await repository.findById(todo.id);
        expect(found).toBeNull();
    });

    it('throws error when todo does not exist', async () => {
        // 存在しないIDでの削除を試みる
        await expect(
            repository.delete('non-existent-id')
        ).rejects.toThrow('Todo not found');
    });

    it('does not affect other todos', async () => {
        // 2つのTodoを作成
        const todo1 = await repository.create({ title: 'Todo 1' });
        const todo2 = await repository.create({ title: 'Todo 2' });

        // todo1を削除
        await repository.delete(todo1.id);

        // todo2は残っていることを確認
        const remainingTodos = await repository.findAll();
        expect(remainingTodos).toHaveLength(1);
        expect(remainingTodos[0]).toEqual(todo2);
    });

    it('allows creation after deletion with same title', async () => {
        // 最初のTodoを作成して削除
        const todo1 = await repository.create({ title: 'Recycled Title' });
        await repository.delete(todo1.id);

        // 同じタイトルで新しいTodoを作成
        const todo2 = await repository.create({ title: 'Recycled Title' });

        // 新しいTodoが正しく作成されていることを確認
        const found = await repository.findById(todo2.id);
        expect(found).toEqual(todo2);
        expect(found?.id).not.toBe(todo1.id);
    });
  });
});
