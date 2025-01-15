import { InMemoryTodoRepository } from '../inMemoryTodoRepository';
import { CreateTodoDTO, TodoNotFoundError } from '../../types/todo';

describe('InMemoryTodoRepository', () => {
    let repository: InMemoryTodoRepository;

    // 各テストの前にリポジトリを初期化
    beforeEach(() => {
        repository = new InMemoryTodoRepository();
    });

    // Todo作成のテスト
    describe('create', () => {
        test('creates a new todo with given title', async () => {
            // テストデータ準備
            const dto: CreateTodoDTO = { title: 'Test Todo' };
            
            // テスト実行
            const todo = await repository.create(dto);

            // 検証
            expect(todo.id).toBeDefined();
            expect(todo.title).toBe(dto.title);
            expect(todo.completed).toBe(false);
            expect(todo.createdAt).toBeInstanceOf(Date);
            expect(todo.updatedAt).toBeInstanceOf(Date);
        });
    });

    // Todo検索のテスト
    describe('findById', () => {
        test('returns null for non-existent todo', async () => {
            const result = await repository.findById('non-existent');
            expect(result).toBeNull();
        });

        test('finds existing todo by id', async () => {
            // Todoを作成
            const created = await repository.create({ title: 'Test Todo' });
            // 作成したTodoを検索
            const found = await repository.findById(created.id);

            expect(found).toEqual(created);
        });
    });
});
