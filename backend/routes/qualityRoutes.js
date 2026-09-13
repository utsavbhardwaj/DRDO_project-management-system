const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getQualityObjectives, createQualityObjective, updateQualityObjective, deleteQualityObjective,
  getOpportunityRegisters, createOpportunityRegister, updateOpportunityRegister, deleteOpportunityRegister,
  getFracasReports, createFracasReport, updateFracasReport, deleteFracasReport,
  getRiskAssessments, createRiskAssessment, updateRiskAssessment, deleteRiskAssessment,
} = require('../controllers/qualityController');

// ─── Quality Objectives ────────────────────────────────────────────────────────
// GET & POST — both admin and member (member must be assigned to project)
router.get('/objectives/project/:projectId', protect, getQualityObjectives);
router.post('/objectives/project/:projectId', protect, createQualityObjective);
// PUT — admin always; member only for own entries (controller enforces)
router.put('/objectives/:id', protect, updateQualityObjective);
// DELETE — admin only
router.delete('/objectives/:id', protect, admin, deleteQualityObjective);

// ─── Opportunity Register ──────────────────────────────────────────────────────
router.get('/opportunities/project/:projectId', protect, getOpportunityRegisters);
router.post('/opportunities/project/:projectId', protect, createOpportunityRegister);
router.put('/opportunities/:id', protect, updateOpportunityRegister);
router.delete('/opportunities/:id', protect, admin, deleteOpportunityRegister);

// ─── FRACAS ───────────────────────────────────────────────────────────────────
router.get('/fracas/project/:projectId', protect, getFracasReports);
router.post('/fracas/project/:projectId', protect, createFracasReport);
router.put('/fracas/:id', protect, updateFracasReport);
router.delete('/fracas/:id', protect, admin, deleteFracasReport);

// ─── Risk Assessment ──────────────────────────────────────────────────────────
router.get('/risks/project/:projectId', protect, getRiskAssessments);
router.post('/risks/project/:projectId', protect, createRiskAssessment);
router.put('/risks/:id', protect, updateRiskAssessment);
router.delete('/risks/:id', protect, admin, deleteRiskAssessment);

module.exports = router;
