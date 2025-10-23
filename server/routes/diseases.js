const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get disease outbreaks for map
router.get('/outbreaks', async (req, res) => {
  try {
    const { region, country, disease, status = 'active' } = req.query;

    let query = 'SELECT * FROM disease_outbreaks WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (region) {
      paramCount++;
      query += ` AND region ILIKE $${paramCount}`;
      params.push(`%${region}%`);
    }

    if (country) {
      paramCount++;
      query += ` AND country ILIKE $${paramCount}`;
      params.push(`%${country}%`);
    }

    if (disease) {
      paramCount++;
      query += ` AND disease_name ILIKE $${paramCount}`;
      params.push(`%${disease}%`);
    }

    query += ' ORDER BY outbreak_start DESC';

    const outbreaks = await db.query(query, params);

    res.json({ outbreaks: outbreaks.rows });
  } catch (error) {
    console.error('Error fetching disease outbreaks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get outbreak statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_outbreaks,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_outbreaks,
        SUM(cases_reported) as total_cases,
        SUM(deaths_reported) as total_deaths,
        COUNT(DISTINCT country) as affected_countries
      FROM disease_outbreaks
    `);

    const recentOutbreaks = await db.query(`
      SELECT disease_name, country, cases_reported, outbreak_start
      FROM disease_outbreaks
      WHERE outbreak_start >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY outbreak_start DESC
      LIMIT 10
    `);

    const topDiseases = await db.query(`
      SELECT disease_name, COUNT(*) as outbreak_count, SUM(cases_reported) as total_cases
      FROM disease_outbreaks
      WHERE status = 'active'
      GROUP BY disease_name
      ORDER BY outbreak_count DESC, total_cases DESC
      LIMIT 10
    `);

    res.json({
      statistics: stats.rows[0],
      recentOutbreaks: recentOutbreaks.rows,
      topDiseases: topDiseases.rows
    });
  } catch (error) {
    console.error('Error fetching disease statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get outbreaks by region for map visualization
router.get('/outbreaks/by-region', async (req, res) => {
  try {
    const outbreaksByRegion = await db.query(`
      SELECT 
        region,
        country,
        coordinates,
        COUNT(*) as outbreak_count,
        SUM(cases_reported) as total_cases,
        SUM(deaths_reported) as total_deaths,
        array_agg(DISTINCT disease_name) as diseases
      FROM disease_outbreaks
      WHERE status = 'active' AND coordinates IS NOT NULL
      GROUP BY region, country, coordinates
      ORDER BY total_cases DESC
    `);

    res.json({ outbreaksByRegion: outbreaksByRegion.rows });
  } catch (error) {
    console.error('Error fetching outbreaks by region:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;