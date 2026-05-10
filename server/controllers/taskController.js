import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role !== 'admin') {
    // Member: Get all tasks for projects they are a member of
    const userProjects = await Project.find({ members: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    query.project = { $in: projectIds };
  }

  // Handle optional projectId filter (from query string)
  if (req.query.projectId) {
    // If member, ensure they are only filtering by a project they belong to
    if (req.user.role !== 'admin') {
      const allowedProjects = query.project.$in.map(id => id.toString());
      if (!allowedProjects.includes(req.query.projectId)) {
        res.status(403);
        throw new Error('Not authorized to view tasks for this project');
      }
    }
    query.project = req.query.projectId;
  }

  // Handle status filter
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Handle assignedTo filter
  if (req.query.assignedTo) {
    query.assignedTo = req.query.assignedTo;
  }

  // Handle createdBy filter
  if (req.query.createdBy) {
    query.createdBy = req.query.createdBy;
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'title')
    .populate('comments.user', 'name avatar')
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, assignedTo, project, dueDate, tags } = req.body;

  const task = new Task({
    title,
    description,
    priority: priority || 'Medium',
    assignedTo,
    project,
    dueDate,
    tags: tags || [],
    createdBy: req.user._id
  });

  const createdTask = await task.save();

  // Ensure assignee is a member of the project
  if (assignedTo) {
    const projectDoc = await Project.findById(project);
    if (projectDoc && !projectDoc.members.includes(assignedTo)) {
      projectDoc.members.push(assignedTo);
      await projectDoc.save();
    }
  }

  // Log activity
  await Activity.create({
    user: req.user._id,
    action: 'created task',
    targetType: 'Task',
    targetId: createdTask._id,
    targetName: createdTask.title,
    details: `Created in project ${project}`
  });

  res.status(201).json(createdTask);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    const oldAssignedTo = task.assignedTo?.toString();
    
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.assignedTo = req.body.assignedTo || task.assignedTo;
    task.project = req.body.project || task.project;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.tags = req.body.tags || task.tags;
    task.status = req.body.status || task.status;

    const updatedTask = await task.save();

    // Ensure new assignee is a member of the project
    if (req.body.assignedTo && req.body.assignedTo !== oldAssignedTo) {
      const projectDoc = await Project.findById(updatedTask.project);
      if (projectDoc && !projectDoc.members.includes(req.body.assignedTo)) {
        projectDoc.members.push(req.body.assignedTo);
        await projectDoc.save();
      }
    }

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: 'updated task details',
      targetType: 'Task',
      targetId: updatedTask._id,
      targetName: updatedTask.title
    });

    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Update task status
// @route   PATCH /api/tasks/status/:id
// @access  Private
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    // Check if user is authorized to update status
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    const oldStatus = task.status;
    task.status = req.body.status || task.status;
    const updatedTask = await task.save();

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: `moved task from ${oldStatus} to ${updatedTask.status}`,
      targetType: 'Task',
      targetId: updatedTask._id,
      targetName: updatedTask.title
    });

    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    const taskTitle = task.title;
    const taskId = task._id;
    
    await task.deleteOne();

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: 'deleted task',
      targetType: 'Task',
      targetId: taskId,
      targetName: taskTitle
    });

    res.json({ message: 'Task removed' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});
// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const task = await Task.findById(req.params.id);

  if (task) {
    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate('comments.user', 'name avatar');
    res.status(201).json(updatedTask.comments);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});
