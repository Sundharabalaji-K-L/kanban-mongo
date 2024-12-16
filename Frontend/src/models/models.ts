// src/models/models.ts
export interface Task {
  _id: string;
  todo: string;
  description: string
  owner: string;
  status: 'todo' | 'doing' | 'complete';
}

export interface TaskCreate {
  todo: string;
  description: string
  owner: string;
  status: 'todo' | 'doing' | 'complete';
}

export interface User{
  _id: string
  name: string
}