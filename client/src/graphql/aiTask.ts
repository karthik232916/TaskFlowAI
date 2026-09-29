import { gql } from "@apollo/client";

export const GENERATE_AI_TASK = gql`
  mutation GenerateTask($prompt: String!) {
    generateTask(prompt: $prompt) {
      title
      description
      status
      priority
    }
  }
`;