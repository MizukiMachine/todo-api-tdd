import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../types';
import { v4 as uuidv4 } from 'uuid';  // IDの生成に使用
import { TodoValidationError } from '../errors/todo.errors';


export class TodoRepository {
  private todos: Map<string, Todo> = new Map();

  async create(dto: CreateTodoDTO): Promise<Todo> {
    const title = dto.title.trim();
    if (!title) {
        throw new TodoValidationError('Title cannot be empty');
    }

      const todo: Todo = {
          id: uuidv4(),
          title: title,  // トリム済みのタイトルを使用
          description: dto.description?.trim(),  // 説明文もトリム
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
      };

      this.todos.set(todo.id, todo);
      return todo;
  }
  async findById(id: string): Promise<Todo | null> {
    // Mapから指定されたIDのTodoを取得
    // 存在しない場合はnullを返す
    return this.todos.get(id) || null;
  }
  async findAll(): Promise<Todo[]> {
    // Mapの値（Todo）を配列として返す
    return Array.from(this.todos.values());
  }
  async update(id: string, dto: UpdateTodoDTO): Promise<Todo> {
    // 更新対象のTodoを検索
    const existingTodo = await this.findById(id);
    if (!existingTodo) {
        throw new TodoValidationError('Todo not found');
    }

    // タイトルのバリデーション
    const title = dto.title?.trim() ?? existingTodo.title;
    if (!title) {
        throw new TodoValidationError('Title cannot be empty');
    }

    // 更新するフィールドを設定
    const updatedTodo: Todo = {
        ...existingTodo,                    // 既存のフィールドを展開
        title,                              // バリデーション済みのタイトル
        description: dto.description?.trim() ?? existingTodo.description,
        completed: dto.completed ?? existingTodo.completed,
        updatedAt: new Date()              // 更新日時は必ず新しく
    };

    // 更新されたTodoを保存
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }
  async delete(id: string): Promise<void> {
    // 削除対象のTodoが存在するか確認
    const todo = await this.findById(id);
    if (!todo) {
        throw new TodoValidationError('Todo not found');
    }

    // Todoを削除
    this.todos.delete(id);
  }
}
