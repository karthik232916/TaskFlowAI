import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'
import type { Task } from '../types/task'
import { CREATE_TASK } from '../graphql/taskMutations'
import { GET_TASKS } from '../graphql/taskQueries'

type TaskFormProps = {
  isOpen: boolean
  onClose: () => void
}

function TaskForm({ isOpen, onClose }: TaskFormProps) {
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [priority, setPriority] =
    useState<Task['priority']>('Medium')

  const [createTask, { loading, error }] = useMutation(
    CREATE_TASK,
    {
      refetchQueries: [{ query: GET_TASKS }],
    }
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      await createTask({
        variables: {
          title: taskName,
          description: taskDescription,
          status: 'Todo',
          priority,
        },
      })

      setTaskName('')
      setTaskDescription('')
      setPriority('Medium')

      onClose()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Name"
        value={taskName}
        onChange={e => setTaskName(e.target.value)}
      />

      <textarea
        placeholder="Task Description"
        value={taskDescription}
        onChange={e => setTaskDescription(e.target.value)}
      />

      <select
        value={priority}
        onChange={e =>
          setPriority(e.target.value as Task['priority'])
        }
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      {error && (
        <p>
          Failed to create task. Please try again.
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>

      <button
        type="button"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
    </form>
  )
}

export default TaskForm