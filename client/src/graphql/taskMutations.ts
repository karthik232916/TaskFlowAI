import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask(
    $title: String!
    $description: String!
    $status: String!
    $priority: String!
  ) {
    createTask(
      title: $title
      description: $description
      status: $status
      priority: $priority
    ) {
      id
      title
      description
      status
      priority
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: Int!
    $title: String!
    $description: String!
    $status: String!
    $priority: String!
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      priority: $priority
    ) {
      id
      title
      description
      status
      priority
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: Int!) {
    deleteTask(id: $id)
  }
`