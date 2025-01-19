import { TodoRepository } from './todo.repository';
import { CreateTodoDTO, UpdateTodoDTO } from '../types';

describe('TodoRepository', () => {
  let repository: TodoRepository;

  beforeEach(() => {
    repository = new TodoRepository();
  });
  describe('create', () => {
    test('creates a new todo with required fields', async () => {
      const dto: CreateTodoDTO = {
        title: 'test title',
      };

      const todo = await repository.create(dto);
      
      // 新しいTodoが正しく作成されていることを確認
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(dto.title);
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    test('returns todo when exists', async () => {
      // まずテスト用のTodoを作成
      const created = await repository.create({
        title: 'Find Me'
      });

      // 作成したTodoをIDで検索
      const found = await repository.findById(created.id);

      // 検索結果が作成したTodoと一致することを確認
      expect(found).toEqual(created);
    });

    test('returns null when todo does not exits', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    test('returns empty array when no todos exist', async () => {
      const todos = await repository.findAll();
      expect(todos).toEqual([]);
    });

    test('return all todos', async () => {
      const todos = await repository.findAll();
      expect(todos).toEqual([]);
    });

    test('returns all todos', async () => {
      // テスト用のTodoを2件作成
      const todo1 = await repository.create({title: 'Todo 1'});
      const todo2 = await repository.create({title: 'Todo 2'});

      const todos = await repository.findAll();

      // 件数の確認
      expect(todos).toHaveLength(2);
      // 作成したTodoが含まれていることの確認
      expect(todos).toEqual(expect.arrayContaining([todo1, todo2]));
    });
  });

  describe('update', () => {
    test('updates todo fields', async () => {
      // テスト用のTodoを作成
      const todo = await repository.create({
          title: 'Original Title',
          description: 'Original Description'
      });

      // 少し待機して時間差を作る
      await new Promise(resolve => setTimeout(resolve, 1));

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
      expect(updated.updatedAt).not.toEqual(todo.updatedAt);
    });

    test('throws error when todo does not exist', async () => {
      const updateDto: UpdateTodoDTO = {
          title: 'Updated Title'
      };

      await expect(
          repository.update('non-existent-id', updateDto)
      ).rejects.toThrow('Todo not found');
    });

    test('maintains unchanged fields', async () => {
      // 元のTodoを作成
      const todo = await repository.create({
          title: 'Original Title',
          description: 'Original Description'
      });

      // タイトルのみを更新
      const updated = await repository.update(todo.id, {
          title: 'Updated Title'
      });

      // 説明文が維持されていることを確認
      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('Original Description');
    });
  });

  describe('delete', () => {
    test('deletes existing todo', async () => {
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

    test('throws error when todo does not exist', async () => {
      // 存在しないIDでの削除を試みる
      await expect(
          repository.delete('non-existent-id')
      ).rejects.toThrow('Todo not found');
    });

    test('does not affect other todos', async () => {
      // 2つのTodoを作成
      const todo1 = await repository.create({ title: 'Todo 1' });
      const todo2 = await repository.create({ title: 'Todo 2' });

      // todo1を削除
      await repository.delete(todo1.id);

      // todo2は残っていることを確認
      const found = await repository.findById(todo2.id);
      expect(found).toEqual(todo2);
    });
  });
});
