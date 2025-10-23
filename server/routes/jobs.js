const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all active job postings
router.get('/', async (req, res) => {
  try {
    const { search, location, employment_type, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT * FROM jobs 
      WHERE is_active = true AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR employer ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    if (employment_type) {
      paramCount++;
      query += ` AND employment_type = $${paramCount}`;
      params.push(employment_type);
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY posted_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const jobs = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM jobs WHERE is_active = true AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)`;
    const totalCount = await db.query(countQuery);

    res.json({
      jobs: jobs.rows,
      totalCount: parseInt(totalCount.rows[0].count),
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await db.query('SELECT * FROM jobs WHERE id = $1 AND is_active = true', [id]);

    if (job.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job: job.rows[0] });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;