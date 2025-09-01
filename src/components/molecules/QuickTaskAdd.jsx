import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { cn } from "@/utils/cn"
import { generateTaskId } from "@/utils/taskUtils"
import { getTodayDateString, getTomorrowDateString } from "@/utils/dateUtils"

const QuickTaskAdd = ({ onAddTask, categories, selectedCategoryId }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
const [categoryId, setCategoryId] = useState(selectedCategoryId || null)
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const titleInputRef = useRef(null)
  
  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => {
      titleInputRef.current?.focus()
    }, 100)
  }
  
  const handleCollapse = () => {
    setIsExpanded(false)
    setTitle("")
    setDescription("")
setCategoryId(selectedCategoryId || null)
    setPriority("medium")
    setDueDate("")
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error("Task title is required")
      return
    }
    
    if (!categoryId) {
      toast.error("Please select a category")
      return
    }
    
    setIsSubmitting(true)
    
    const newTask = {
      Id: parseInt(generateTaskId()),
      title: title.trim(),
      description: description.trim(),
      categoryId: parseInt(categoryId),
      priority,
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: 0
    }
    
    try {
      await onAddTask(newTask)
      handleCollapse()
      toast.success("Task created successfully! 🎯")
    } catch (error) {
      toast.error("Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    } else if (e.key === "Escape") {
      handleCollapse()
    }
  }
  
  const quickActions = [
    { label: "Today", value: getTodayDateString(), icon: "Calendar" },
    { label: "Tomorrow", value: getTomorrowDateString(), icon: "CalendarDays" },
    { label: "High Priority", priority: "high", icon: "ArrowUp" },
    { label: "Urgent", priority: "urgent", icon: "AlertTriangle" }
  ]
  
  return (
    <div className="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
      {!isExpanded ? (
        <button
          onClick={handleExpand}
          className="w-full flex items-center gap-3 text-left text-surface-500 hover:text-surface-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
            <ApperIcon name="Plus" size={18} className="text-white" />
          </div>
          <span className="font-medium">Add a new task...</span>
          <div className="ml-auto text-xs text-surface-400">
            Press to expand
          </div>
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Title input */}
          <Input
            ref={titleInputRef}
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-lg font-medium border-none shadow-none px-0 focus:ring-0"
            required
          />
          
          {/* Description */}
          <Input
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyPress}
            className="border-none shadow-none px-0 focus:ring-0 text-surface-600"
          />
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.value) setDueDate(action.value)
                  if (action.priority) setPriority(action.priority)
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                  "border border-surface-200 hover:border-surface-300 transition-colors",
                  "text-surface-600 hover:text-surface-700 hover:bg-surface-50",
                  (action.value === dueDate || action.priority === priority) && 
                  "bg-primary-50 border-primary-200 text-primary-700"
                )}
              >
                <ApperIcon name={action.icon} size={14} />
                {action.label}
              </button>
            ))}
          </div>
          
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.Id} value={category.Id}>
                  {category.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </Select>
            
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Due date"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-surface-500">
              <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-surface-100 rounded ml-1">Enter</kbd>
              <span className="ml-1">to save • </span>
              <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">Esc</kbd>
              <span className="ml-1">to cancel</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCollapse}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
disabled={!title.trim() || !categoryId || isSubmitting}
              >
                Add Task
              </Button>
            </div>
          </div>
        </motion.form>
      )}
    </div>
  )
}

export default QuickTaskAdd