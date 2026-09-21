import './App.css'
import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useDispatch, useSelector } from 'react-redux'

import Header from './components/Header'
import TaskForm from './components/TaskForm'

import type { Task } from './types/task'
import type { RootState, AppDispatch } from './store/store'

import { GET_TASKS } from './graphql/taskQueries'
import { setSearch, setPriority } from './store/taskFilterSlice'

function App() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  const search = useSelector(
    (state: RootState) => state.taskFilter.search
  )

  const priority = useSelector(
    (state: RootState) => state.taskFilter.priority
  )

  const { data, loading, error } =
    useQuery<{ tasks: Task[] }>(GET_TASKS)

  const tasks: Task[] = data?.tasks ?? []

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesPriority =
      priority === 'All' || task.priority === priority

    return matchesSearch && matchesPriority
  })

  return (
    <div>
      <Header
        title="TaskFlow AI"
        description="Manage your projects, tasks, and workflow in one place."
      />

      <button onClick={() => setIsTaskFormOpen(true)}>
        Create Task
      </button>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
      />

      <section>
        <h2>Tasks</h2>

        {loading && <p>Loading tasks...</p>}

        {error && <p>Unable to load tasks.</p>}

        <div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => dispatch(setSearch(e.target.value))}
          />

          <select
            value={priority}
            onChange={e =>
              dispatch(
                setPriority(
                  e.target.value as
                    | 'All'
                    | 'Low'
                    | 'Medium'
                    | 'High'
                )
              )
            }
          >
            <option value="All">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {!loading && !error && filteredTasks.length === 0 && (
          <p>
            {search || priority !== 'All'
              ? 'No matching tasks found.'
              : 'No tasks yet.'}
          </p>
        )}

        {!loading &&
          !error &&
          filteredTasks.map(task => (
            <div key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <p>Priority: {task.priority}</p>
            </div>
          ))}
      </section>
    </div>
  )
}

export default App