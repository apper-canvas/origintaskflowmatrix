import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as taskService from "@/services/api/taskService";
import Error from "@/components/ui/Error";

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await taskService.getTasks()
      setTasks(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
const createTask = async (taskData) => {
try {
      const newTask = await taskService.createTask(taskData)
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      console.error("Error in createTask hook:", err.message)
      throw new Error(err.message || "Failed to create task")
    }
  }
  
const updateTask = async (taskId, updates) => {
    try {
      // Handle toggle completion
      if (typeof updates === "boolean") {
        const task = tasks.find(t => t.Id === taskId)
        if (task) {
          const updatedTask = await taskService.updateTask(taskId, {
            completed: updates,
            completedAt: updates ? new Date().toISOString() : null
          })
          setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t))
        }
      } else {
        const updatedTask = await taskService.updateTask(taskId, updates)
        setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t))
        toast.success("Task updated successfully!")
      }
    } catch (err) {
      throw new Error("Failed to update task")
    }
  }
  
const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.Id !== taskId))
      toast.success("Task deleted successfully!")
    } catch (err) {
      throw new Error("Failed to delete task")
    }
  }
  
  useEffect(() => {
    loadTasks()
  }, [])
  
  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: loadTasks
  }
}