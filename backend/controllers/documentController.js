const prisma = require('../config/prisma');
const sendEmail = require('../utils/emailService');

const formatDocument = (doc) => ({ ...doc, _id: doc.id });

const uploadDocument = async (req, res) => {
  try {
    const { projectId, title, description } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { assignedMembers: true }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const document = await prisma.document.create({
      data: {
        projectId,
        uploadedById: req.user._id,
        title: title || req.file.originalname,
        description: description || '',
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      }
    });

    await prisma.activityLog.create({
      data: {
        action: `Uploaded document: ${req.file.originalname}`,
        userId: req.user._id,
        projectId
      }
    });

    // Create in-app notifications for all assigned members
    if (project.assignedMembers && project.assignedMembers.length > 0) {
      await prisma.notification.createMany({
        data: project.assignedMembers.map(member => ({
          userId: member.id,
          projectId,
          message: `New document "${title || req.file.originalname}" uploaded for project "${project.title}"`
        }))
      });

      // Optional: send email notifications
      for (const member of project.assignedMembers) {
        try {
          await sendEmail({
            email: member.email,
            subject: `New Document for Project: ${project.title}`,
            html: `<p>A new document (<strong>${title || req.file.originalname}</strong>) has been uploaded for <strong>${project.title}</strong>.</p><p>${description || ''}</p><p>Please check your dashboard.</p>`
          });
        } catch (e) {
          console.error('Email send failed for', member.email, e.message);
        }
      }
    }

    res.status(201).json(formatDocument(document));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { projectId: req.params.projectId },
      include: { uploadedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents.map(formatDocument));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, getProjectDocuments };
