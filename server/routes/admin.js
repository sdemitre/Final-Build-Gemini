const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get papers pending vetting
router.get('/vetting', auth, async (req, res) => {
  try {
    // Simple admin check (in production, check user role)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const papers = await db.query(`
      SELECT id, title, abstract, institutional_affiliation as institution, submission_date
      FROM papers
      WHERE status IN ('submitted', 'pending_vetting')
      ORDER BY submission_date DESC
      LIMIT 100
    `);

    res.json({ papers: papers.rows });
  } catch (error) {
    console.error('Error fetching vetting list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify a paper
router.post('/vetting/:id/verify', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const paperId = req.params.id;
    await db.query(`UPDATE papers SET status = 'verified', vetted_by = $1, vetted_at = NOW() WHERE id = $2`, [req.user.userId, paperId]);

    res.json({ message: 'Paper verified' });
  } catch (error) {
    console.error('Error verifying paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
