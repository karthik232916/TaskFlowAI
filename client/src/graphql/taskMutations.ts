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