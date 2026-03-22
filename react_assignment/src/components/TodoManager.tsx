import React, { useState, useRef, useEffect, useMemo } from "react";

// Task type
type Task = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoManager: React.FC = () => {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState<string>("");

  // Ref for input
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add task
  const addTask = () => {
    if (!taskText.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      text: taskText,
      completed: false
    };

    setTasks(prev => [...prev, newTask]);
    setTaskText("");
  };

  // Delete task
  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Toggle complete
  const toggleComplete = (id: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // useMemo for completed count
  const completedCount = useMemo(() => {
    return tasks.filter(task => task.completed).length;
  }, [tasks]);

  return (
    <div style={{ padding: "20px" }}>

      <h2>Todo Manager</h2>

      <input
        ref={inputRef}
        type="text"
        value={taskText}
        placeholder="Enter task..."
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTaskText(e.target.value)
        }
      />

      <button onClick={addTask}>Add</button>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>

            <span
              onClick={() => toggleComplete(task.id)}
              style={{
                cursor: "pointer",
                textDecoration: task.completed ? "line-through" : "none"
              }}
            >
              {task.text}
            </span>

            <button onClick={() => deleteTask(task.id)}>
              Delete
            </button>

          </li>
        ))}
      </ul>

      <h3>Completed Tasks: {completedCount}</h3>

    </div>
  );
};

export default TodoManager;