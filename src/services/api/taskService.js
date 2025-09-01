import { toast } from 'react-toastify'

export const getTasks = async () => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "priority_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "completed_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "completed_at_c"}},
        {"field": {"Name": "order_c"}},
        {"field": {"Name": "category_id_c"}}
      ],
      orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    }

    const response = await apperClient.fetchRecords('task_c', params)

    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }

    if (!response?.data?.length) {
      return []
    }

    // Transform database fields to UI format
    return response.data.map(task => ({
      Id: task.Id,
      title: task.title_c || '',
      description: task.description_c || '',
      priority: task.priority_c || 'medium',
      dueDate: task.due_date_c || null,
      completed: task.completed_c || false,
      createdAt: task.created_at_c || new Date().toISOString(),
      completedAt: task.completed_at_c || null,
      order: task.order_c || 0,
      categoryId: task.category_id_c?.Id || task.category_id_c || 1
    }))
  } catch (error) {
    console.error("Error fetching tasks:", error?.response?.data?.message || error)
    toast.error("Failed to load tasks")
    return []
  }
}

export const getTaskById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "priority_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "completed_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "completed_at_c"}},
        {"field": {"Name": "order_c"}},
        {"field": {"Name": "category_id_c"}}
      ]
    }

    const response = await apperClient.getRecordById('task_c', parseInt(id), params)

    if (!response?.data) {
      throw new Error("Task not found")
    }

    // Transform database fields to UI format
    const task = response.data
    return {
      Id: task.Id,
      title: task.title_c || '',
      description: task.description_c || '',
      priority: task.priority_c || 'medium',
      dueDate: task.due_date_c || null,
      completed: task.completed_c || false,
      createdAt: task.created_at_c || new Date().toISOString(),
      completedAt: task.completed_at_c || null,
      order: task.order_c || 0,
      categoryId: task.category_id_c?.Id || task.category_id_c || 1
    }
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error)
    throw new Error("Task not found")
  }
}

export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    // Transform UI fields to database fields - only Updateable fields
    const params = {
      records: [{
        Name: taskData.title || '',
        title_c: taskData.title || '',
        description_c: taskData.description || '',
        priority_c: taskData.priority || 'medium',
        due_date_c: taskData.dueDate || null,
        completed_c: taskData.completed || false,
        created_at_c: new Date().toISOString(),
        completed_at_c: null,
        order_c: taskData.order || 0,
category_id_c: parseInt(taskData.categoryId)
      }]
    }

    const response = await apperClient.createRecord('task_c', params)

    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error(response.message)
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success)
      const failed = response.results.filter(r => !r.success)
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} tasks:`, failed)
        failed.forEach(record => {
          if (record.message) toast.error(record.message)
        })
        throw new Error("Failed to create task")
      }

      if (successful.length > 0) {
        // Transform database response to UI format
        const task = successful[0].data
        return {
          Id: task.Id,
          title: task.title_c || '',
          description: task.description_c || '',
          priority: task.priority_c || 'medium',
          dueDate: task.due_date_c || null,
          completed: task.completed_c || false,
          createdAt: task.created_at_c || new Date().toISOString(),
          completedAt: task.completed_at_c || null,
          order: task.order_c || 0,
          categoryId: task.category_id_c?.Id || task.category_id_c || 1
        }
      }
    }
    
    throw new Error("Failed to create task")
  } catch (error) {
    console.error("Error creating task:", error?.response?.data?.message || error)
    throw error
  }
}

export const updateTask = async (id, updates) => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    // Transform UI fields to database fields - only Updateable fields
    const updateData = {
      Id: parseInt(id)
    }

    if (updates.title !== undefined) {
      updateData.Name = updates.title
      updateData.title_c = updates.title
    }
    if (updates.description !== undefined) updateData.description_c = updates.description
    if (updates.priority !== undefined) updateData.priority_c = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date_c = updates.dueDate
    if (updates.completed !== undefined) updateData.completed_c = updates.completed
    if (updates.completedAt !== undefined) updateData.completed_at_c = updates.completedAt
    if (updates.order !== undefined) updateData.order_c = updates.order
    if (updates.categoryId !== undefined) updateData.category_id_c = parseInt(updates.categoryId)

    const params = {
      records: [updateData]
    }

    const response = await apperClient.updateRecord('task_c', params)

    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error(response.message)
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success)
      const failed = response.results.filter(r => !r.success)
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} tasks:`, failed)
        failed.forEach(record => {
          if (record.message) toast.error(record.message)
        })
        throw new Error("Failed to update task")
      }

      if (successful.length > 0) {
        // Transform database response to UI format
        const task = successful[0].data
        return {
          Id: task.Id,
          title: task.title_c || '',
          description: task.description_c || '',
          priority: task.priority_c || 'medium',
          dueDate: task.due_date_c || null,
          completed: task.completed_c || false,
          createdAt: task.created_at_c || new Date().toISOString(),
          completedAt: task.completed_at_c || null,
          order: task.order_c || 0,
          categoryId: task.category_id_c?.Id || task.category_id_c || 1
        }
      }
    }
    
    throw new Error("Failed to update task")
  } catch (error) {
    console.error("Error updating task:", error?.response?.data?.message || error)
    throw error
  }
}

export const deleteTask = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    const params = { 
      RecordIds: [parseInt(id)]
    }

    const response = await apperClient.deleteRecord('task_c', params)

    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return false
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success)
      const failed = response.results.filter(r => !r.success)
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} tasks:`, failed)
        failed.forEach(record => {
          if (record.message) toast.error(record.message)
        })
        return false
      }

      return successful.length > 0
    }

    return false
  } catch (error) {
    console.error("Error deleting task:", error?.response?.data?.message || error)
    return false
  }
}