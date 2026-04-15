import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Check, 
  Circle, 
  Plus, 
  Trash2, 
  ListTodo,
  BookOpen
} from "lucide-react";
import {
  useListTodos,
  getListTodosQueryKey,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useGetTodoSummary,
  getGetTodoSummaryQueryKey
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FilterStatus = "all" | "active" | "completed";

export default function Home() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: todos = [], isLoading } = useListTodos(
    filter !== "all" ? { status: filter } : undefined,
    {
      query: { 
        enabled: true, 
        queryKey: getListTodosQueryKey(filter !== "all" ? { status: filter } : undefined) 
      }
    }
  );

  const { data: summary } = useGetTodoSummary({
    query: {
      enabled: true,
      queryKey: getGetTodoSummaryQueryKey()
    }
  });

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTodo.mutate(
      { data: { title: newTaskTitle.trim() } },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodoSummaryQueryKey() });
        }
      }
    );
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateTodo.mutate(
      { id, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodoSummaryQueryKey() });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteTodo.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodoSummaryQueryKey() });
        }
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex justify-center p-4 md:p-12 font-sans text-foreground selection:bg-primary/20">
      <div className="w-full max-w-2xl mt-8">
        
        <header className="mb-12 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-primary mb-2">
            <BookOpen size={28} strokeWidth={1.5} />
            <h1 className="text-3xl md:text-4xl font-semibold m-0">Notebook</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            A quiet space to focus on what matters today. Take a breath, write it down.
          </p>
        </header>

        {/* Summary Stats */}
        <div className="flex items-center gap-6 mb-8 text-sm border-b border-border/60 pb-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground font-medium uppercase tracking-wider text-xs mb-1">Total</span>
            <span className="text-2xl font-serif text-foreground">{summary?.total || 0}</span>
          </div>
          <div className="h-10 w-px bg-border/60" />
          <div className="flex flex-col">
            <span className="text-muted-foreground font-medium uppercase tracking-wider text-xs mb-1">Active</span>
            <span className="text-2xl font-serif text-foreground">{summary?.active || 0}</span>
          </div>
          <div className="h-10 w-px bg-border/60" />
          <div className="flex flex-col">
            <span className="text-muted-foreground font-medium uppercase tracking-wider text-xs mb-1">Completed</span>
            <span className="text-2xl font-serif text-primary">{summary?.completed || 0}</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCreate} className="relative mb-8 group">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-16 pl-6 pr-16 text-lg bg-white/50 backdrop-blur-sm border-border/80 rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 placeholder:text-muted-foreground/60"
            disabled={createTodo.isPending}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!newTaskTitle.trim() || createTodo.isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:bg-primary/10 hover:text-primary rounded-full w-10 h-10 transition-colors"
          >
            <Plus size={22} strokeWidth={2} />
          </Button>
        </form>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === f 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full bg-muted/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : todos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-2xl bg-white/20"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground/50">
                <ListTodo size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif text-foreground mb-2">Nothing here yet</h3>
              <p className="text-muted-foreground max-w-sm">
                {filter === "all" 
                  ? "Your notebook is empty. Take a moment to add a task above."
                  : `You have no ${filter} tasks at the moment.`}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  key={todo.id}
                  className={`group flex items-center justify-between p-4 rounded-xl border bg-card transition-all duration-300 shadow-sm hover:shadow-md ${
                    todo.completed ? "border-transparent bg-muted/30" : "border-border/60"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggle(todo.id, todo.completed)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        todo.completed 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-muted-foreground/30 hover:border-primary text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={3} className={todo.completed ? "opacity-100" : "opacity-0"} />
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-lg transition-all duration-300 truncate ${
                        todo.completed ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground"
                      }`}>
                        {todo.title}
                      </span>
                      <span className="text-xs text-muted-foreground/60 mt-0.5">
                        {format(new Date(todo.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="flex-shrink-0 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
