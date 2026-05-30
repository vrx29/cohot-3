import { type FormEvent, useMemo, useState } from 'react'
import './App.css'

type Todo = {
  id: number
  text: string
  completed: boolean
}

const initialTodos: Todo[] = [
  { id: 1, text: 'Create reusable components', completed: false },
  { id: 2, text: 'Style the task list with cards', completed: true },
]

function App() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === 'active') return !todo.completed
        if (filter === 'completed') return todo.completed
        return true
      }),
    [todos, filter],
  )

  const activeCount = todos.filter((todo) => !todo.completed).length

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newTask.trim()
    if (!trimmed) return

    setTodos((current) => [
      ...current,
      { id: Date.now(), text: trimmed, completed: false },
    ])
    setNewTask('')
  }

  const toggleCompleted = (id: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const deleteTodo = (id: number) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  const clearCompleted = () => {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  return (
    <div className="app-shell">
      <header className="todo-header">
        <div>
          <p className="eyebrow">Todo App</p>
          <h1>Organize your day with ease</h1>
          <p className="subtitle">
            Add tasks, mark progress, and keep your focus where it matters.
          </p>
        </div>
        <div className="header-meta">
          <span>{activeCount} tasks left</span>
          <button
            type="button"
            className="text-button"
            onClick={clearCompleted}
            disabled={!todos.some((todo) => todo.completed)}
          >
            Clear completed
          </button>
        </div>
      </header>

      <section className="todo-panel">
        <form className="todo-form" onSubmit={handleSubmit}>
          <label htmlFor="new-task" className="sr-only">
            Add a new task
          </label>
          <input
            id="new-task"
            type="text"
            value={newTask}
            onChange={(event) => setNewTask(event.currentTarget.value)}
            placeholder="Add a new task"
          />
          <button type="submit">Add task</button>
        </form>

        <div className="filter-row" role="group" aria-label="Filter tasks">
          {(['all', 'active', 'completed'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={option === filter ? 'filter active' : 'filter'}
              onClick={() => setFilter(option)}
              aria-pressed={option === filter}
            >
              {option === 'all'
                ? 'All'
                : option === 'active'
                ? 'Active'
                : 'Completed'}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {visibleTodos.length === 0 ? (
            <li className="empty-state">
              {filter === 'completed'
                ? 'No completed tasks yet.'
                : 'No tasks to show.'}
            </li>
          ) : (
            visibleTodos.map((todo) => (
              <li
                key={todo.id}
                className={todo.completed ? 'todo-item completed' : 'todo-item'}
              >
                <label className="todo-checkbox">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleCompleted(todo.id)}
                  />
                  <span>{todo.text}</span>
                </label>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Remove ${todo.text}`}
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}

export default App
