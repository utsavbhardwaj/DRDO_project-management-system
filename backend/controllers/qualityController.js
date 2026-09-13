const prisma = require('../config/prisma');
const { sendQualitySubmissionEmail } = require('../services/mailService');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Verify that a member is assigned to the given project */
const isMemberAssigned = async (userId, projectId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, assignedMembers: { some: { id: userId } } },
  });
  return !!project;
};

const include = { submittedBy: { select: { id: true, name: true, email: true } } };

// ─── QUALITY OBJECTIVES ──────────────────────────────────────────────────────

const getQualityObjectives = async (req, res) => {
  try {
    const { projectId } = req.params;
    const items = await prisma.qualityObjective.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include,
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createQualityObjective = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { detailsActivity, target, status, remarks, signatureDate, responsibility } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Members must be assigned
    if (req.user.role === 'Member') {
      const assigned = await isMemberAssigned(req.user._id, projectId);
      if (!assigned) return res.status(403).json({ message: 'Not assigned to this project' });
    }

    const item = await prisma.qualityObjective.create({
      data: {
        projectId, detailsActivity, target,
        status: status || 'Pending',
        remarks: remarks || '',
        signatureDate: signatureDate || '',
        responsibility: responsibility || '',
        submittedById: req.user._id,
      },
      include,
    });

    // Email admins
    if (req.user.role === 'Member') {
      const admins = await prisma.user.findMany({ where: { role: 'Admin' } });
      for (const admin of admins) {
        await sendQualitySubmissionEmail(admin, req.user, project, 'Quality Objective', item.id, 'objectives').catch(console.error);
      }
    }

    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateQualityObjective = async (req, res) => {
  try {
    const { id } = req.params;
    // Members can only update their own entries
    if (req.user.role === 'Member') {
      const existing = await prisma.qualityObjective.findUnique({ where: { id } });
      if (!existing || existing.submittedById !== req.user._id)
        return res.status(403).json({ message: 'Cannot edit this entry' });
      // Members cannot set adminRemarks
      delete req.body.adminRemarks;
    }
    const item = await prisma.qualityObjective.update({ where: { id }, data: req.body, include });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteQualityObjective = async (req, res) => {
  try {
    await prisma.qualityObjective.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── OPPORTUNITY REGISTER ────────────────────────────────────────────────────

const getOpportunityRegisters = async (req, res) => {
  try {
    const items = await prisma.opportunityRegister.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'asc' },
      include,
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createOpportunityRegister = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { opNo, process, opportunity, potentialBenefit, implementationPlan, remarks } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'Member') {
      const assigned = await isMemberAssigned(req.user._id, projectId);
      if (!assigned) return res.status(403).json({ message: 'Not assigned to this project' });
    }

    const item = await prisma.opportunityRegister.create({
      data: {
        projectId, opNo, process, opportunity,
        potentialBenefit: potentialBenefit || '',
        implementationPlan: implementationPlan || '',
        remarks: remarks || '',
        submittedById: req.user._id,
      },
      include,
    });

    if (req.user.role === 'Member') {
      const admins = await prisma.user.findMany({ where: { role: 'Admin' } });
      for (const admin of admins) {
        await sendQualitySubmissionEmail(admin, req.user, project, 'Opportunity Register', item.id, 'opportunities').catch(console.error);
      }
    }

    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateOpportunityRegister = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'Member') {
      const existing = await prisma.opportunityRegister.findUnique({ where: { id } });
      if (!existing || existing.submittedById !== req.user._id)
        return res.status(403).json({ message: 'Cannot edit this entry' });
      delete req.body.adminRemarks;
    }
    const item = await prisma.opportunityRegister.update({ where: { id }, data: req.body, include });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteOpportunityRegister = async (req, res) => {
  try {
    await prisma.opportunityRegister.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── FRACAS ──────────────────────────────────────────────────────────────────

const getFracasReports = async (req, res) => {
  try {
    const items = await prisma.fracasReport.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'asc' },
      include,
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createFracasReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      noLabYear, dateTimeFailure, projectName, typeOfProject,
      nomenclature, serialNo, componentManufacturer,
      failureDescription, failureReported, defectObserved,
      statusAnalysis, typeOfFailure,
    } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'Member') {
      const assigned = await isMemberAssigned(req.user._id, projectId);
      if (!assigned) return res.status(403).json({ message: 'Not assigned to this project' });
    }

    const item = await prisma.fracasReport.create({
      data: {
        projectId,
        noLabYear: noLabYear || '', dateTimeFailure: dateTimeFailure || '',
        projectName: projectName || '', typeOfProject: typeOfProject || '',
        nomenclature: nomenclature || '', serialNo: serialNo || '',
        componentManufacturer: componentManufacturer || '',
        failureDescription: failureDescription || '',
        failureReported: failureReported || '',
        defectObserved: defectObserved || '',
        statusAnalysis: statusAnalysis || '',
        typeOfFailure: typeOfFailure || 'Minor',
        submittedById: req.user._id,
      },
      include,
    });

    if (req.user.role === 'Member') {
      const admins = await prisma.user.findMany({ where: { role: 'Admin' } });
      for (const admin of admins) {
        await sendQualitySubmissionEmail(admin, req.user, project, 'FRACAS Report', item.id, 'fracas').catch(console.error);
      }
    }

    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateFracasReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'Member') {
      const existing = await prisma.fracasReport.findUnique({ where: { id } });
      if (!existing || existing.submittedById !== req.user._id)
        return res.status(403).json({ message: 'Cannot edit this entry' });
      delete req.body.adminRemarks;
    }
    const item = await prisma.fracasReport.update({ where: { id }, data: req.body, include });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteFracasReport = async (req, res) => {
  try {
    await prisma.fracasReport.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── RISK ASSESSMENT ─────────────────────────────────────────────────────────

const getRiskAssessments = async (req, res) => {
  try {
    const items = await prisma.riskAssessment.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'asc' },
      include,
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createRiskAssessment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      riskNo, processTitle, processOwner, riskDescription, consequences,
      likelihoodRating, impactRating, riskSignificance, dealingOfficer, deptFunction, date,
    } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'Member') {
      const assigned = await isMemberAssigned(req.user._id, projectId);
      if (!assigned) return res.status(403).json({ message: 'Not assigned to this project' });
    }

    const lR = Number(likelihoodRating) || 1;
    const iR = Number(impactRating) || 1;
    const rR = lR * iR;
    const sig = riskSignificance || (rR <= 4 ? 'Low' : rR <= 14 ? 'Medium' : 'High');

    const item = await prisma.riskAssessment.create({
      data: {
        projectId, riskNo,
        processTitle: processTitle || '', processOwner: processOwner || '',
        riskDescription: riskDescription || '', consequences: consequences || '',
        likelihoodRating: lR, impactRating: iR, riskRating: rR,
        riskSignificance: sig,
        dealingOfficer: dealingOfficer || '', deptFunction: deptFunction || '',
        date: date || '',
        submittedById: req.user._id,
      },
      include,
    });

    if (req.user.role === 'Member') {
      const admins = await prisma.user.findMany({ where: { role: 'Admin' } });
      for (const admin of admins) {
        await sendQualitySubmissionEmail(admin, req.user, project, 'Risk Assessment', item.id, 'risks').catch(console.error);
      }
    }

    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateRiskAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.user.role === 'Member') {
      const existing = await prisma.riskAssessment.findUnique({ where: { id } });
      if (!existing || existing.submittedById !== req.user._id)
        return res.status(403).json({ message: 'Cannot edit this entry' });
      delete data.adminRemarks;
    }
    if (data.likelihoodRating !== undefined) data.likelihoodRating = Number(data.likelihoodRating);
    if (data.impactRating !== undefined) data.impactRating = Number(data.impactRating);
    if (data.riskRating !== undefined) data.riskRating = Number(data.riskRating);
    const item = await prisma.riskAssessment.update({ where: { id }, data, include });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteRiskAssessment = async (req, res) => {
  try {
    await prisma.riskAssessment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = {
  getQualityObjectives, createQualityObjective, updateQualityObjective, deleteQualityObjective,
  getOpportunityRegisters, createOpportunityRegister, updateOpportunityRegister, deleteOpportunityRegister,
  getFracasReports, createFracasReport, updateFracasReport, deleteFracasReport,
  getRiskAssessments, createRiskAssessment, updateRiskAssessment, deleteRiskAssessment,
};
