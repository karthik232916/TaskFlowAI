import './App.css'
import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useDispatch, useSelector } from 'react-redux'

import Header from './components/Header'
import TaskForm from './components/TaskForm'
import Login from './components/Login'

import type { Task } from './types/task'
import type { RootState, AppDispatch } from './store/store'

import { GET_TASKS } from './graphql/taskQueries'
import { DELETE_TASK } from './graphql/taskMutations'

import {
  setSearch,
  setPriority,
} from './store/taskFilterSlice'

import { logout } from './store/authSlice'

function App() {
  const [isTaskFormOpen, setIsTaskFormOpen] =
    useState(false)

  const [editingTask, setEditingTask] =
    useState<Task | null>(null)

  const dispatch = useDispatch<AppDispatch>()

  const search = useSelector(
    (state: RootState) => state.taskFilter.search
  )

  const priority = useSelector(
    (state: RootState) => state.taskFilter.priority
  )

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  )

  const { data, loading, error } =
    useQuery<{ tasks: Task[] }>(GET_TASKS, {
      skip: !isAuthenticated,
    })

  const [deleteTask, deleteResult] = useMutation(
    DELETE_TASK,
    {
      refetchQueries: [{ query: GET_TASKS }],
    }
  )

  if (!isAuthenticated) {
    return <Login />
  }

  const tasks: Task[] = data?.tasks ?? []

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesPriority =
      priority === 'All' ||
      task.priority === priority

    return matchesSearch && matchesPriority
  })

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsTaskFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteTask({
        variables: {
          id,
        },
      })
    } catch (error) {
      console.error(
        'Failed to delete task:',
        error
      )
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div>
      <Header
        title="TaskFlow AI"
        description="Manage your projects, tasks, and workflow in one place."
      />

      <button onClick={handleCreateTask}>
        Create Task
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        task={editingTask}
      />

      <section>
        <h2>Tasks</h2>

        {loading && <p>Loading tasks...</p>}

        {error && (
          <p>
            Unable to load tasks.
          </p>
        )}

        {deleteResult.error && (
          <p>
            Failed to delete task. Please try again.
          </p>
        )}

        <div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e =>
              dispatch(setSearch(e.target.value))
            }
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
            <option value="All">
              All priorities
            </option>
            <option value="Low">Low</option>
            <option value="Medium">
              Medium
            </option>
            <option value="High">
              High
            </option>
          </select>
        </div>

        {!loading &&
          !error &&
          filteredTasks.length === 0 && (
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

              <p>
                Status: {task.status}
              </p>

              <p>
                Priority: {task.priority}
              </p>

              <button
                onClick={() =>
                  handleEditTask(task)
                }
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDeleteTask(task.id)
                }
                disabled={deleteResult.loading}
              >
                {deleteResult.loading
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
          ))}
      </section>
    </div>
  )
}

export default App