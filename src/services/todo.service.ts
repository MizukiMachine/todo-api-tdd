import { TodoRepository } from '../repositories/todo.repository';
import { CreateTodoDTO, Todo } from '../types';
import sanitizeHtml from 'sanitize-html';

export class TodoService {
  private readonly MAX_TITLE_LENGTH = 100;
  private readonly MAX_DESCRIPTION_LENGTH = 500;

  constructor(private repository: TodoRepository) {}

  async createTodo(dto: CreateTodoDTO): Promise<Todo> {
    // 入力値の検証とサニタイズ
    const sanitizedTitle = this.sanitizeText(dto.title);
    const sanitizedDescription = dto.description 
        ? this.sanitizeText(dto.description)
        : undefined;

    // タイトルの長さチェック
    if (sanitizedTitle.length > this.MAX_TITLE_LENGTH) {
        throw new Error('Title cannot exceed 100 characters');
    }

    // 説明文の長さチェック
    if (sanitizedDescription && sanitizedDescription.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new Error('Description cannot exceed 500 characters');
    }

    return this.repository.create({
      title: sanitizedTitle,
      description: sanitizedDescription
    });
  }

  private sanitizeText(text: string): string {
    return sanitizeHtml(text, {
      allowedTags: [],        // HTMLタグを全て除去
      allowedAttributes: {},  // 属性を全て除去
    }).trim();
  }
}
