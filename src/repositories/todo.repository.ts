import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../types';
import { v4 as uuidv4 } from 'uuid'; // uuidパッケージが必要です

export class TodoRepository {
  // TodoをIDで管理するためのMap
  private todos: Map<string, Todo> = new Map();

  async create(dto: CreateTodoDTO): Promise<Todo> {
    const todo: Todo = {
      id: uuidv4(), // ユニークなIDを生成
      title: dto.title,  // DTOからタイトルを取得
      description: dto.description,
      completed: false,  // 新規作成時は未完了
      createdAt: new Date(),  // 現在の日時
      updatedAt: new Date(),  // 現在の日時
    };

    this.todos.set(todo.id, todo);
    return todo;
  }

  async findById(id: string): Promise<Todo | null> {
    // MapからしていされたIDのTodoを取得
    // 存在しない場合はnullを返す
    return this.todos.get(id) || null;
  }

  async findAll(): Promise<Todo[]> {
    // Mapの値（Todo）を配列として返す
    return Array.from(this.todos.values());
  }

  async update(id: string, dto: UpdateTodoDTO): Promise<Todo> {
    // 更新対象のTodoを検索
    const todo = await this.findById(id);
    if (!todo) {
        throw new Error('Todo not found');
    }

    // 更新するフィールドを設定
    const updatedTodo: Todo = {
        ...todo,                               // 元のフィールドを展開（コピー）
        title: dto.title?.trim() ?? todo.title, // 新しいタイトルを適用（なければ元の値
        description: dto.description?.trim() ?? todo.description, // 説明も同様
        completed: dto.completed ?? todo.completed, // 完了状態も同様
        updatedAt: new Date()                // 更新日時は必ず新しく
    };

    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async delete(id: string): Promise<void> {
    // 削除対象のTodoが存在するか確認
    const todo = await this.findById(id);
    if (!todo) {
        throw new Error('Todo not found');
    }

    // Todoを削除
    this.todos.delete(id);
  }
}
