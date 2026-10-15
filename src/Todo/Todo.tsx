import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Todo = string;

const fetchTodos = (): Promise<Todo[]> =>
  Promise.resolve(JSON.parse(localStorage.getItem('todos') || '[]') as Todo[]);

const addTodoApi = async (newTodo: Todo): Promise<Todo[]> => {
  const todos = await fetchTodos();
  const updatedTodos = [...todos, newTodo];
  localStorage.setItem('todos', JSON.stringify(updatedTodos));
  return updatedTodos;
};

const deleteTodoApi = async (index: number): Promise<Todo[]> => {
  const todos = await fetchTodos();
  const updatedTodos = todos.filter((_, i) => i !== index);
  localStorage.setItem('todos', JSON.stringify(updatedTodos));
  return updatedTodos;
};

function Todo() {
  const [newTodo, setNewTodo] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: todos = [] } = useQuery<Todo[], Error>({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const addTodoMutation = useMutation<Todo[], Error, Todo>({
    mutationFn: addTodoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodoMutation = useMutation<Todo[], Error, number>({
    mutationFn: deleteTodoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleAddTodo = (): void => {
    if (newTodo.trim()) {
      addTodoMutation.mutate(newTodo);
      setNewTodo('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleDelete = (index: number): void => {
    deleteTodoMutation.mutate(index);
  };

  return (
    <div className="todo-container">
      <h1>Todo List</h1>
      <div className="todo-input-container">
        <input
          type="text"
          value={newTodo}
          placeholder="What needs to be done?"
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          className="todo-input"
        />
        <button
          onClick={handleAddTodo}
          className="add-button"
          disabled={addTodoMutation.isPending}
        >
          {addTodoMutation.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index} className="todo-item">
            <span className="todo-text">{todo}</span>
            <button
              onClick={() => handleDelete(index)}
              className="delete-button"
              disabled={deleteTodoMutation.isPending}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todo;
