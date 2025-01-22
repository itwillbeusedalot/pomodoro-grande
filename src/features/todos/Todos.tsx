import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import browser from "webextension-polyfill";
import { Todo } from "@/types";

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load todos from storage on mount
    browser.storage.local.get("todos").then((result) => {
      if (result.todos) setTodos(result.todos as Todo[]);
    });
  }, []);

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const newTodo = {
      id: Math.floor(Math.random() * 10_000).toString(),
      title: inputValue,
      done: false,
    };
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    setInputValue("");
    setError("");
    browser.storage.local.set({ todos: updatedTodos });
  };

  const removeTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    browser.storage.local.set({ todos: updatedTodos });
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    setTodos(updatedTodos);
    browser.storage.local.set({ todos: updatedTodos });
  };

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold mb-2">Todos</h1>
      <form onSubmit={addTodo} className="flex items-center gap-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What do you want to do?"
          className="h-8 text-sm placeholder:text-xs"
        />

        <Button
          type="submit"
          className="bg-primary-custom hover:bg-primary-custom/90"
          size="sm"
        >
          Add
        </Button>
      </form>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <ul className="custom-scrollbar max-h-[20rem] overflow-y-auto">
        {todos.length === 0 && (
          <p className="text-sm font-light text-center mt-4">No todos yet</p>
        )}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center p-2 mb-2 rounded shadow"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.done}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={`max-w-[200px] break-all ${
                  todo.done ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.title}
              </label>
            </div>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-primary-custom hover:text-primary-custom/90 focus:outline-none"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todos;
