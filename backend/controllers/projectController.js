const prisma = require('../config/prisma');

const formatProject = (p) => ({
  ...p,
  _id: p.id,
  assignedMembers: p.assignedMembers.map(m => ({ ...m, _id: m.id }))
});

const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await prisma.project.findMany({
        include: { assignedMembers: { select: { id: true, name: true, email: true } } }
      });
    } else {
      projects = await prisma.project.findMany({
        where: { assignedMembers: { some: { id: req.user._id } } },
        include: { assignedMembers: { select: { id: true, name: true, email: true } } }
      });
    }
    res.json(projects.map(formatProject));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { assignedMembers: { select: { id: true, name: true, email: true } } }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (req.user.role === 'Member' && !project.assignedMembers.some(m => m.id === req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json(formatProject(project));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, purpose, assignedMembers, deadline } = req.body;
    
    const project = await prisma.project.create({
      data: {
        title,
        description,
        purpose: purpose || '',
        deadline: deadline ? new Date(deadline) : null,
        assignedMembers: {
          connect: assignedMembers && assignedMembers.length ? assignedMembers.map(id => ({ id })) : []
        }
      },
      include: { assignedMembers: { select: { id: true, name: true, email: true } } }
    });

    await prisma.activityLog.create({
      data: {
        action: 'Created project: ' + title,
        userId: req.user._id,
        projectId: project.id
      }
    });
    
    res.status(201).json(formatProject(project));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, status, assignedMembers, deadline } = req.body;
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (status) data.status = status;
    if (deadline) data.deadline = new Date(deadline);
    if (assignedMembers) {
      data.assignedMembers = {
        set: assignedMembers.map(id => ({ id }))
      };
    }

    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: { assignedMembers: { select: { id: true, name: true, email: true } } }
    });

    res.json(formatProject(updatedProject));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'memberIds array is required' });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { assignedMembers: { select: { id: true } } }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Validate all users exist
    const users = await prisma.user.findMany({ where: { id: { in: memberIds } } });
    if (users.length !== memberIds.length) {
      return res.status(400).json({ message: 'One or more users not found' });
    }

    // Merge with existing members (no duplicates)
    const existingIds = project.assignedMembers.map(m => m.id);
    const allIds = [...new Set([...existingIds, ...memberIds])];

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { assignedMembers: { set: allIds.map(id => ({ id })) } },
      include: { assignedMembers: { select: { id: true, name: true, email: true } } }
    });

    res.json(formatProject(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId is required' });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { assignedMembers: { select: { id: true } } }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const existingIds = project.assignedMembers.map(m => m.id);
    if (!existingIds.includes(memberId)) {
      return res.status(400).json({ message: 'Member is not assigned to this project' });
    }

    const updatedIds = existingIds.filter(id => id !== memberId);

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { assignedMembers: { set: updatedIds.map(id => ({ id })) } },
      include: { assignedMembers: { select: { id: true, name: true, email: true } } }
    });

    res.json(formatProject(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Cascade delete related records
    await prisma.notification.deleteMany({ where: { projectId: req.params.id } });
    await prisma.submission.deleteMany({ where: { projectId: req.params.id } });
    await prisma.document.deleteMany({ where: { projectId: req.params.id } });
    await prisma.activityLog.deleteMany({ where: { projectId: req.params.id } });

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { sendProjectPingEmail } = require('../services/mailService');

const pingManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const manager = await prisma.user.findUnique({ where: { id: managerId } });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    await sendProjectPingEmail(project, manager);

    res.json({ message: 'Ping sent successfully to manager' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, addMembers, removeMember, deleteProject, pingManager };

