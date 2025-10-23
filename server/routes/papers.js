const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/papers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/zip'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, RTF, XLS, XLSX, CSV, and ZIP files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  }
});

// Get all papers with enhanced filtering and search
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      research_type, 
      data_type, 
      status, 
      region, 
      funding_source,
      disease_category,
      seeking_collaboration,
      author_institution,
      date_range,
      has_data_sharing,
      page = 1, 
      limit = 12,
      sort = 'newest'
    } = req.query;

    let query = `
      SELECT 
        p.*,
        u.first_name, u.last_name, u.institution, u.title as author_title,
        u.is_verified as author_verified,
        COUNT(r.id) as review_count,
        AVG(r.rating) as average_rating,
        COUNT(c.id) as collaboration_count
      FROM papers p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN reviews r ON p.id = r.paper_id
      LEFT JOIN collaborations c ON p.id = c.paper_id
      WHERE p.status != 'draft'
    `;
    const params = [];
    let paramCount = 0;

    // Add search filters
    if (search) {
      paramCount++;
      query += ` AND (
        p.title ILIKE $${paramCount} OR 
        p.abstract ILIKE $${paramCount} OR 
        array_to_string(p.keywords, ' ') ILIKE $${paramCount} OR
        p.methodology ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    if (research_type) {
      paramCount++;
      query += ` AND p.research_type = $${paramCount}`;
      params.push(research_type);
    }

    if (data_type) {
      paramCount++;
      query += ` AND p.data_type = $${paramCount}`;
      params.push(data_type);
    }

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (region) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(p.geographic_scope)`;
      params.push(region);
    }

    if (funding_source) {
      paramCount++;
      query += ` AND p.funding_source ILIKE $${paramCount}`;
      params.push(`%${funding_source}%`);
    }

    if (disease_category) {
      paramCount++;
      query += ` AND p.disease_category = $${paramCount}`;
      params.push(disease_category);
    }

    if (seeking_collaboration === 'true') {
      query += ` AND p.is_seeking_collaboration = true`;
    }

    if (author_institution) {
      paramCount++;
      query += ` AND u.institution ILIKE $${paramCount}`;
      params.push(`%${author_institution}%`);
    }

    if (has_data_sharing === 'true') {
      query += ` AND p.data_available_for_sharing = true`;
    }

    if (date_range) {
      const [startDate, endDate] = date_range.split(',');
      if (startDate) {
        paramCount++;
        query += ` AND p.submission_date >= $${paramCount}`;
        params.push(startDate);
      }
      if (endDate) {
        paramCount++;
        query += ` AND p.submission_date <= $${paramCount}`;
        params.push(endDate);
      }
    }

    // Group by for aggregations
    query += ` GROUP BY p.id, u.id`;

    // Add sorting
    switch (sort) {
      case 'oldest':
        query += ` ORDER BY p.submission_date ASC`;
        break;
      case 'title':
        query += ` ORDER BY p.title ASC`;
        break;
      case 'author':
        query += ` ORDER BY u.last_name ASC, u.first_name ASC`;
        break;
      case 'rating':
        query += ` ORDER BY average_rating DESC NULLS LAST`;
        break;
      case 'collaboration':
        query += ` ORDER BY collaboration_count DESC`;
        break;
      default: // newest
        query += ` ORDER BY p.submission_date DESC`;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const papers = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM papers p
      JOIN users u ON p.author_id = u.id
      WHERE p.status != 'draft'
    `;
    const countParams = [];
    let countParamCount = 0;

    // Repeat filters for count query
    if (search) {
      countParamCount++;
      countQuery += ` AND (
        p.title ILIKE $${countParamCount} OR 
        p.abstract ILIKE $${countParamCount} OR 
        array_to_string(p.keywords, ' ') ILIKE $${countParamCount} OR
        p.methodology ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }
    // Add other count filters...

    const totalCount = await db.query(countQuery, countParams);

    res.json({
      papers: papers.rows.map(paper => ({
        ...paper,
        average_rating: paper.average_rating ? parseFloat(paper.average_rating) : null,
        review_count: parseInt(paper.review_count),
        collaboration_count: parseInt(paper.collaboration_count)
      })),
      pagination: {
        totalCount: parseInt(totalCount.rows[0].count),
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.rows[0].count / limit),
        hasNextPage: parseInt(page) < Math.ceil(totalCount.rows[0].count / limit),
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ message: 'Server error while fetching papers' });
  }
});

// Submit a comprehensive paper with file uploads
router.post('/submit', auth, upload.fields([
  { name: 'manuscriptFile', maxCount: 1 },
  { name: 'supplementaryFiles', maxCount: 5 },
  { name: 'ethicsDocuments', maxCount: 3 }
]), [
  body('title').trim().isLength({ min: 10, max: 500 }),
  body('abstract').trim().isLength({ min: 100, max: 2000 }),
  body('researchType').isIn(['observational', 'experimental', 'review', 'meta-analysis', 'case-study']),
  body('dataType').isIn(['quantitative', 'qualitative', 'mixed-methods']),
  body('methodology').trim().isLength({ min: 50 }),
  body('diseaseCategory').notEmpty(),
  body('institutionalAffiliation').trim().isLength({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const {
      title,
      abstract,
      keywords,
      researchType,
      dataType,
      methodology,
      sampleSize,
      studyStartDate,
      studyEndDate,
      geographicScope,
      populationDemographics,
      fundingSource,
      fundingAmount,
      ethicsApproval,
      ethicsCommittee,
      institutionalAffiliation,
      diseaseCategory,
      specificConditions,
      interventions,
      outcomes,
      isSeekingCollaboration,
      collaborationNeeds,
      dataAvailableForSharing,
      preferredPartnerCriteria,
      previousPublications,
      conflictsOfInterest,
      acknowledgments
    } = req.body;

    // Parse JSON strings
    const parsedKeywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords || [];
    const parsedGeographicScope = typeof geographicScope === 'string' ? JSON.parse(geographicScope) : geographicScope || [];
    const parsedPopulationDemographics = typeof populationDemographics === 'string' ? JSON.parse(populationDemographics) : populationDemographics || {};
    const parsedSpecificConditions = typeof specificConditions === 'string' ? JSON.parse(specificConditions) : specificConditions || [];
    const parsedInterventions = typeof interventions === 'string' ? JSON.parse(interventions) : interventions || [];
    const parsedOutcomes = typeof outcomes === 'string' ? JSON.parse(outcomes) : outcomes || [];
    const parsedCollaborationNeeds = typeof collaborationNeeds === 'string' ? JSON.parse(collaborationNeeds) : collaborationNeeds || [];

    // Handle file uploads
    const files = req.files;
    const manuscriptFile = files.manuscriptFile ? files.manuscriptFile[0] : null;
    const supplementaryFiles = files.supplementaryFiles || [];
    const ethicsDocuments = files.ethicsDocuments || [];

    if (!manuscriptFile) {
      return res.status(400).json({ message: 'Manuscript file is required' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Insert paper
      const newPaper = await db.query(`
        INSERT INTO papers (
          title, abstract, keywords, research_type, data_type, methodology,
          sample_size, study_start_date, study_end_date, geographic_scope,
          demographic_data, funding_source, funding_amount, ethics_approval,
          ethics_committee, institutional_affiliation, disease_category,
          specific_conditions, interventions, outcomes, author_id,
          is_seeking_collaboration, collaboration_needs, data_available_for_sharing,
          preferred_partner_criteria, previous_publications, conflicts_of_interest,
          acknowledgments, manuscript_file_url, status, submission_date
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
        )
        RETURNING *
      `, [
        title, abstract, parsedKeywords, researchType, dataType, methodology,
        sampleSize || null, studyStartDate || null, studyEndDate || null,
        parsedGeographicScope, parsedPopulationDemographics, fundingSource || null,
        fundingAmount || null, ethicsApproval === 'true', ethicsCommittee || null,
        institutionalAffiliation, diseaseCategory, parsedSpecificConditions,
        parsedInterventions, parsedOutcomes, req.user.userId,
        isSeekingCollaboration === 'true', parsedCollaborationNeeds,
        dataAvailableForSharing === 'true', preferredPartnerCriteria || null,
        previousPublications || null, conflictsOfInterest || null,
        acknowledgments || null, manuscriptFile.path, 'submitted', new Date()
      ]);

      const paperId = newPaper.rows[0].id;

      // Add paper tags for better categorization
      const tags = [
        diseaseCategory,
        researchType,
        dataType,
        ...parsedSpecificConditions,
        ...parsedKeywords.slice(0, 5) // Limit to first 5 keywords
      ];

      for (const tag of tags) {
        if (tag && tag.trim()) {
          await db.query(`
            INSERT INTO paper_tags (paper_id, tag_name, tag_category)
            VALUES ($1, $2, $3)
            ON CONFLICT (paper_id, tag_name) DO NOTHING
          `, [paperId, tag.trim().toLowerCase(), 'system']);
        }
      }

      // Store file metadata
      if (supplementaryFiles.length > 0) {
        for (const file of supplementaryFiles) {
          await db.query(`
            INSERT INTO research_data (
              title, description, data_type, file_format, file_size,
              file_url, owner_id, associated_paper_id, access_level
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            `Supplementary data for: ${title}`,
            'Supplementary file uploaded with paper submission',
            'supplementary',
            path.extname(file.originalname),
            file.size,
            file.path,
            req.user.userId,
            paperId,
            'private'
          ]);
        }
      }

      // Create notification for paper submission
      await db.query(`
        INSERT INTO notifications (
          user_id, type, title, message, related_entity_type, related_entity_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        req.user.userId,
        'paper_submitted',
        'Paper Submitted Successfully',
        `Your paper "${title}" has been submitted and is under review.`,
        'paper',
        paperId
      ]);

      // Commit transaction
      await db.query('COMMIT');

      res.status(201).json({
        message: 'Paper submitted successfully',
        paper: {
          id: newPaper.rows[0].id,
          title: newPaper.rows[0].title,
          status: newPaper.rows[0].status,
          submissionDate: newPaper.rows[0].submission_date
        }
      });

    } catch (innerError) {
      await db.query('ROLLBACK');
      throw innerError;
    }

  } catch (error) {
    console.error('Error submitting paper:', error);
    res.status(500).json({ 
      message: 'Server error during paper submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get paper by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const paper = await db.query(`
      SELECT p.*, u.first_name, u.last_name, u.institution, u.title as user_title
      FROM papers p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (paper.rows.length === 0) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Get reviews for this paper
    const reviews = await db.query(`
      SELECT r.*, u.first_name, u.last_name, u.institution
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.paper_id = $1 AND r.is_public = true
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      paper: paper.rows[0],
      reviews: reviews.rows
    });
  } catch (error) {
    console.error('Error fetching paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a review to a paper
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comments').trim().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comments, suggestions } = req.body;

    // Check if user has already reviewed this paper
    const existingReview = await db.query(
      'SELECT * FROM reviews WHERE paper_id = $1 AND reviewer_id = $2',
      [id, req.user.userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this paper' });
    }

    const newReview = await db.query(`
      INSERT INTO reviews (paper_id, reviewer_id, rating, comments, suggestions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, req.user.userId, rating, comments, suggestions]);

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview.rows[0]
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;