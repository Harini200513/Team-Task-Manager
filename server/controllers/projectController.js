import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
  let query = {};
  
  if (req.user.role !== 'admin') {
    query = { members: req.user._id };
  }

  const projects = await Project.find(query)
    .populate('members', 'name email avatar')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  // Add task counts to each project for progress calculation
  const projectsWithStats = await Promise.all(projects.map(async (project) => {
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'Completed' });
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Auto-derive status based on progress
    let derivedStatus = project.status;
    if (totalTasks > 0) {
      if (progress === 100) {
        derivedStatus = 'Completed';
      } else if (progress > 0) {
        derivedStatus = 'In Progress';
      } else {
        derivedStatus = 'Not Started';
      }
    }

    return {
      ...project._doc,
      totalTasks,
      completedTasks,
      progress,
      status: derivedStatus
    };
  }));

  res.json(projectsWithStats);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email avatar')
    .populate('tasks');

  if (project) {
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to view this project');
    }
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, members, deadline, status } = req.body;

  const project = new Project({
    title,
    description,
    members: members || [],
    deadline,
    status: status || 'Not Started',
    createdBy: req.user._id
  });

  const createdProject = await project.save();

  // Log activity
  await Activity.create({
    user: req.user._id,
    action: 'created project',
    targetType: 'Project',
    targetId: createdProject._id,
    targetName: createdProject.title
  });

  res.status(201).json(createdProject);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = asyncHandler(async (req, res) => {
  const { title, description, members, deadline, status } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.title = title || project.title;
    project.description = description || project.description;
    project.members = members || project.members;
    project.deadline = deadline || project.deadline;
    project.status = status || project.status;

    const updatedProject = await project.save();

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: 'updated project settings',
      targetType: 'Project',
      targetId: updatedProject._id,
      targetName: updatedProject.title
    });

    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    const projectTitle = project.title;
    const projectId = project._id;

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    // Log activity
    await Activity.create({
      user: req.user._id,
      action: 'deleted project',
      targetType: 'Project',
      targetId: projectId,
      targetName: projectTitle
    });

    res.json({ message: 'Project removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});
