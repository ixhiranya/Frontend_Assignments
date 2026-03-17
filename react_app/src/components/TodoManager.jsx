import React, { useState, useRef, useMemo, useEffect } from "react";

function TodoManager() {

  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");

  const inputRef = useRef(null);

  // Autofocus input
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const addTask = () => {
    if (taskText.trim() === "") return;

    setTasks([
      ...tasks,
      { id: Date.now(), text: taskText, completed: false }
    ]);

    setTaskText("");
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Count completed tasks using useMemo
  const completedCount = useMemo(() => {
    return tasks.filter(task => task.completed).length;
  }, [tasks]);

  return (
    <div style={{padding:"20px"}}>

      <h2>Todo Manager</h2>

      <input
        ref={inputRef}
        type="text"
        value={taskText}
        placeholder="Enter task..."
        onChange={(e) => setTaskText(e.target.value)}
      />

      <button onClick={addTask}>Add</button>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>

            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                cursor: "pointer"
              }}
              onClick={() => toggleComplete(task.id)}
            >
              {task.text}
            </span>

            <button onClick={() => deleteTask(task.id)}>Delete</button>

          </li>
        ))}
      </ul>

      <h3>Completed Tasks: {completedCount}</h3>

    </div>
  );
}

export default TodoManager;