// src/errors/todo.errors.ts
export class TodoValidationError extends Error {
  constructor(message: string) {
      super(message);
      this.name = 'TodoValidationError';
  }
}
