const prisma = require('../config/prisma');

const formatSubmission = (sub) => ({
  ...sub,
  _id: sub.id
});

const createSubmission = async (req, res) => {
  try {
    const { projectId, progress, notes, attachedFiles } = req.body;
    
    // Check if submission exists
    const existingSubmission = await prisma.submission.findFirst({
      where: { projectId, memberId: req.user._id }
    });
    
    if (existingSubmission) {
      let files = Array.isArray(existingSubmission.attachedFiles) ? existingSubmission.attachedFiles : [];
      if (attachedFiles) {
        files = [...files, ...attachedFiles];
      }
      
      const updatedSubmission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          progress: progress !== undefined ? progress : existingSubmission.progress,
          notes: notes || existingSubmission.notes,
          attachedFiles: files,
          status: progress == 100 ? 'Submitted' : 'Pending'
        }
      });
      
      await prisma.activityLog.create({
        data: { action: `Updated submission for project`, userId: req.user._id, projectId }
      });
      return res.json(formatSubmission(updatedSubmission));
    }

    const submission = await prisma.submission.create({
      data: {
        projectId,
        memberId: req.user._id,
        progress: progress || 0,
        notes,
        attachedFiles: attachedFiles || [],
        status: progress == 100 ? 'Submitted' : 'Pending'
      }
    });

    await prisma.activityLog.create({
      data: { action: `Created submission for project`, userId: req.user._id, projectId }
    });

    res.status(201).json(formatSubmission(submission));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { projectId: req.params.projectId },
      include: { member: { select: { id: true, name: true, email: true } } }
    });
    res.json(submissions.map(s => {
      const formatted = formatSubmission(s);
      formatted.memberId = s.member; // to match previous .populate('memberId')
      return formatted;
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSubmission, getProjectSubmissions };
