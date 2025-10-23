const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get collaborations for a user
router.get('/', auth, async (req, res) => {
  try {
    const collaborations = await db.query(`
      SELECT c.*, 
             p.title as paper_title,
             u1.first_name as initiator_first_name, u1.last_name as initiator_last_name,
             u2.first_name as collaborator_first_name, u2.last_name as collaborator_last_name
      FROM collaborations c
      JOIN papers p ON c.paper_id = p.id
      JOIN users u1 ON c.initiator_id = u1.id
      JOIN users u2 ON c.collaborator_id = u2.id
      WHERE c.initiator_id = $1 OR c.collaborator_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.userId]);

    res.json({ collaborations: collaborations.rows });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request collaboration
router.post('/request', auth, [
  body('collaboratorId').isInt(),
  body('paperId').isInt(),
  body('agreementTerms').trim().isLength({ min: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { collaboratorId, paperId, agreementTerms, dataSharingTerms } = req.body;

    // Check if collaboration already exists
    const existingCollaboration = await db.query(
      'SELECT * FROM collaborations WHERE paper_id = $1 AND ((initiator_id = $2 AND collaborator_id = $3) OR (initiator_id = $3 AND collaborator_id = $2))',
      [paperId, req.user.userId, collaboratorId]
    );

    if (existingCollaboration.rows.length > 0) {
      return res.status(400).json({ message: 'Collaboration request already exists for this paper' });
    }

    // Verify paper exists and user has permission
    const paper = await db.query('SELECT * FROM papers WHERE id = $1 AND author_id = $2', [paperId, req.user.userId]);
    if (paper.rows.length === 0) {
      return res.status(403).json({ message: 'Paper not found or access denied' });
    }

    const newCollaboration = await db.query(`
      INSERT INTO collaborations (initiator_id, collaborator_id, paper_id, agreement_terms, data_sharing_terms)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.userId, collaboratorId, paperId, agreementTerms, dataSharingTerms]);

    res.status(201).json({
      message: 'Collaboration request sent successfully',
      collaboration: newCollaboration.rows[0]
    });
  } catch (error) {
    console.error('Error creating collaboration request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to collaboration request
router.patch('/:id/respond', auth, [
  body('status').isIn(['accepted', 'rejected']),
  body('response').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, response } = req.body;

    // Verify collaboration exists and user is the collaborator
    const collaboration = await db.query(
      'SELECT * FROM collaborations WHERE id = $1 AND collaborator_id = $2',
      [id, req.user.userId]
    );

    if (collaboration.rows.length === 0) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    if (collaboration.rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Collaboration request has already been responded to' });
    }

    const updatedCollaboration = await db.query(`
      UPDATE collaborations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    res.json({
      message: `Collaboration request ${status} successfully`,
      collaboration: updatedCollaboration.rows[0]
    });
  } catch (error) {
    console.error('Error responding to collaboration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collaboration agreement template
router.get('/agreement-template', (req, res) => {
  const template = {
    sections: [
      {
        title: "Research Collaboration Agreement",
        content: "This agreement outlines the terms and conditions for research collaboration between the parties involved."
      },
      {
        title: "Project Scope",
        content: "Define the specific research objectives, methodology, and expected outcomes of the collaborative work."
      },
      {
        title: "Data Sharing and Ownership",
        content: "Specify how data will be shared, accessed, and owned by each party. Include provisions for data security and confidentiality."
      },
      {
        title: "Publication and Attribution",
        content: "Outline authorship order, publication timeline, and how each party will be credited in resulting publications."
      },
      {
        title: "Intellectual Property",
        content: "Define ownership and usage rights for any intellectual property created during the collaboration."
      },
      {
        title: "Funding and Resources",
        content: "Specify how costs will be shared and what resources each party will contribute."
      },
      {
        title: "Timeline and Milestones",
        content: "Establish key deadlines and milestones for the collaborative research project."
      },
      {
        title: "Dispute Resolution",
        content: "Outline the process for resolving any disagreements that may arise during the collaboration."
      }
    ]
  };

  res.json({ template });
});

module.exports = router;