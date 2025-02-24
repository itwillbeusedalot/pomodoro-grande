import { Todo } from "@/types";
import { useEffect, useState } from "react";

const TodoProgress = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const completedTodos = todos.filter((todo) => todo.isCompleted);

  useEffect(() => {
    const syncState = async () => {
      const result = await chrome.storage.local.get("todos");
      setTodos((result?.todos as Todo[]) ?? []);
    };

    syncState();

    const handleStorageChange = (changes: any) => {
      if (changes.todos) setTodos(changes.todos.newValue);
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  if (todos.length === 0) return null;

  if (completedTodos.length === todos.length) {
    return (
      <p className="mt-2 font-medium text-primary-custom">
        Great work! {completedTodos.length}/{todos.length} Todos completed! 🎉
      </p>
    );
  }

  return (
    <p className="mt-2">
      <span className="font-semibold text-primary-custom">
        {completedTodos?.length}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-primary-custom">{todos.length}</span>{" "}
      Todos Completed
    </p>
  );
};

export default TodoProgress;
