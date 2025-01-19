export interface Todo {
  id: string;          // Todoの一意識別子
  title: string;       // Todoのタイトル
  description?: string;// 詳細説明（オプショナル）
  completed: boolean;  // 完了状態
  createdAt: Date;    // 作成日時
  updatedAt: Date;    // 更新日時
}

// 新規Todo作成時に使用するDTO（Data Transfer Object）
export interface CreateTodoDTO {
  title: string;   // 必須項目
  description?: string; // オプショナル
}

// Todo更新時に使用するDTO
export interface UpdateTodoDTO {
  title?: string;  // オプショナル
  description?: string; // オプショナル 更新したいフィールドのみ
  completed?: boolean; // オプショナル
}
