export type Task = {
  id: number;
  title: string;
  description: string;
  status: 'Todo' | 'InProgress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
};