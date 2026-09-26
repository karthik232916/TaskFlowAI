import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'

import type { Task } from '../types/task'

import {
  CREATE_TASK,
  UPDATE_TASK,
} from '../graphql/taskMutations'

import { GET_TASKS } from '../graphql/taskQueries'

type TaskFormProps = {
  isOpen: boolean
  onClose: () => void
  task?: Task | null
}

type TaskFormContentProps = {
  onClose: () => void
  task?: Task | null
}

function TaskFormContent({ onClose, task }: TaskFormContentProps) {
  const [taskName, setTaskName] = useState(task?.title ?? '')
  const [taskDescription, setTaskDescription] = useState(
    task?.description ?? ''
  )
  const [status, setStatus] = useState<Task['status']>(
    task?.status ?? 'Todo'
  )
  const [priority, setPriority] = useState<Task['priority']>(
    task?.priority ?? 'Medium'
  )

  const [createTask, createResult] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  })

  const [updateTask, updateResult] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  })

  const loading = createResult.loading || updateResult.loading
  const error = createResult.error || updateResult.error
  const isEditing = Boolean(task)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (task) {
        await updateTask({
          variables: {
            id: task.id,
            title: taskName,
            description: taskDescription,
            status,
            priority,
          },
        })
      } else {
        await createTask({
          variables: {
            title: taskName,
            description: taskDescription,
            status,
            priority,
          },
        })
      }

      onClose()
    } catch (err) {
        console.error(
          task
            ? 'Failed to update task:'
            : 'Failed to create task:',
          err
        )
      }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Task' : 'Create Task'}</h2>

      <input
        type="text"
        placeholder="Task Name"
        value={taskName}
        onChange={e => setTaskName(e.target.value)}
        required
      />

      <textarea
        placeholder="Task Description"
        value={taskDescription}
        onChange={e => setTaskDescription(e.target.value)}
        required
      />

      <select
        value={status}
        onChange={e => setStatus(e.target.value as Task['status'])}
      >
        <option value="Todo">Todo</option>
        <option value="InProgress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <select
        value={priority}
        onChange={e => setPriority(e.target.value as Task['priority'])}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      {error && (
        <div>
          <p>
            Failed to {isEditing ? 'update' : 'create'} task.
          </p>

          <pre>{error.message}</pre>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading
          ? isEditing
            ? 'Updating...'
            : 'Creating...'
          : isEditing
            ? 'Update Task'
            : 'Create Task'}
      </button>

      <button type="button" onClick={onClose} disabled={loading}>
        Cancel
      </button>
    </form>
  )
}

function TaskForm({ isOpen, onClose, task }: TaskFormProps) {
  if (!isOpen) {
    return null
  }

  // Passing a dynamic `key` forces React to create a fresh instance of TaskFormContent
  // whenever `task` changes or when switching between Create and Edit modes.
  const formKey = task ? `edit-${task.id}` : 'create'

  return <TaskFormContent key={formKey} onClose={onClose} task={task} />
}

export default TaskForm