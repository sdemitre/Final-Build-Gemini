const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, email, first_name, last_name, title, institution, department, specialization, bio, linkedin_url, cv_url, is_verified, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      title,
      institution,
      department,
      specialization,
      bio,
      linkedinUrl,
      cvUrl
    } = req.body;

    const updatedUser = await db.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, title = $3, institution = $4, 
          department = $5, specialization = $6, bio = $7, linkedin_url = $8, 
          cv_url = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING id, email, first_name, last_name, title, institution, department, specialization, bio, linkedin_url, cv_url
    `, [firstName, lastName, title, institution, department, specialization, bio, linkedinUrl, cvUrl, req.user.userId]);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's papers
router.get('/papers', auth, async (req, res) => {
  try {
    const papers = await db.query(`
      SELECT p.*, 
             (SELECT AVG(rating) FROM reviews WHERE paper_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE paper_id = p.id) as review_count
      FROM papers p
      WHERE p.author_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.userId]);

    res.json({ papers: papers.rows });
  } catch (error) {
    console.error('Error fetching user papers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search researchers
router.get('/search', async (req, res) => {
  try {
    const { q, specialization, institution, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT id, first_name, last_name, title, institution, department, specialization, bio, linkedin_url
      FROM users 
      WHERE is_active = true AND is_verified = true
    `;
    const params = [];
    let paramCount = 0;

    if (q) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR institution ILIKE $${paramCount})`;
      params.push(`%${q}%`);
    }

    if (specialization) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(specialization)`;
      params.push(specialization);
    }

    if (institution) {
      paramCount++;
      query += ` AND institution ILIKE $${paramCount}`;
      params.push(`%${institution}%`);
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY last_name, first_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const researchers = await db.query(query, params);

    res.json({ researchers: researchers.rows });
  } catch (error) {
    console.error('Error searching researchers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;