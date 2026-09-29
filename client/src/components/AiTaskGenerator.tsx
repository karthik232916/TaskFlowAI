import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { GENERATE_AI_TASK } from "../graphql/aiTask";
import { CREATE_TASK } from "../graphql/taskMutations";
import type { AiGeneratedTask } from "../types/task";

type AiTaskGeneratorProps = {
  onTaskCreated: () => void;
};

export default function AiTaskGenerator({
  onTaskCreated,
}: AiTaskGeneratorProps) {
  const [prompt, setPrompt] = useState("");

  const [generateTask, { loading, error, data, reset }] =
    useMutation<{ generateTask: AiGeneratedTask }>(
      GENERATE_AI_TASK
    );

  const [createTask, { loading: createLoading, error: createError }] =
    useMutation(CREATE_TASK);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    await generateTask({
      variables: {
        prompt: prompt.trim(),
      },
    });
  };

  const handleConfirm = async () => {
    if (!data?.generateTask) {
      return;
    }

    try {
      await createTask({
        variables: {
          title: data.generateTask.title,
          description: data.generateTask.description,
          status: data.generateTask.status,
          priority: data.generateTask.priority,
        },
      });

      setPrompt("");
      reset();
      onTaskCreated();
    } catch (error) {
      console.error(
        "Failed to create AI-generated task:",
        error
      );
    }
  }; // <-- Added missing closing brace here

  const handleCancel = () => {
    setPrompt("");
    reset(); // Clear generated preview on cancel
  };

  return (
    <div>
      <h2>Create Task with AI</h2>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the task you want to create..."
        rows={4}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Generating..." : "Generate Task"}
      </button>

      {error && (
        <p>
          Failed to generate task: {error.message}
        </p>
      )}

      {data && (
        <div>
          <h3>AI Generated Task</h3>

          <p>
            <strong>Title:</strong>{" "}
            {data.generateTask.title}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {data.generateTask.description}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {data.generateTask.status}
          </p>

          <p>
            <strong>Priority:</strong>{" "}
            {data.generateTask.priority}
          </p>

          <button
            onClick={handleConfirm}
            disabled={createLoading}
          >
            {createLoading
              ? "Creating..."
              : "Confirm & Create"}
          </button>

          <button
            onClick={handleCancel}
            disabled={createLoading}
          >
            Cancel
          </button>

          {createError && (
            <p>
              Failed to create task:{" "}
              {createError.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}