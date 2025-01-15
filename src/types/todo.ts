// Todoの基本型
export interface Todo {
  id: string;          // ユニークID
  title: string;       // タスクのタイトル
  completed: boolean;  // 完了状態
  createdAt: Date;    // 作成日時
  updatedAt: Date;    // 更新日時
}

// Todo作成時のDTO
export interface CreateTodoDTO {
  title: string;
}

// Todo更新時のDTO
export interface UpdateTodoDTO {
  title?: string;      // タイトルの更新（オプション）
  completed?: boolean; // 完了状態の更新（オプション）
}

// Todo未検出時のエラー
export class TodoNotFoundError extends Error {
  constructor(id: string) {
      super(`Todo with id ${id} not found`);
      this.name = 'TodoNotFoundError';
  }
}

// バリデーションエラー
export class InvalidTodoError extends Error {
  constructor(message: string) {
      super(message);
      this.name = 'InvalidTodoError';
  }
}

