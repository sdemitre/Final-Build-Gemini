const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId, email) => {
  const token = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { token, refreshToken };
};

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('institution').optional().trim(),
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
      email, 
      password, 
      firstName, 
      lastName, 
      title, 
      institution, 
      department, 
      specialization,
      bio 
    } = req.body;

    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, title, 
        institution, department, specialization, bio, is_verified, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, first_name, last_name, title, institution, department, 
                specialization, bio, is_verified, is_active, created_at
    `, [
      email, passwordHash, firstName, lastName, title || null,
      institution || null, department || null, 
      specialization || [], bio || null, false, true
    ]);

    const user = newUser.rows[0];
    const { token, refreshToken } = generateTokens(user.id, user.email);

    // Log registration
    await db.query(`
      INSERT INTO verification_logs (user_id, verification_type, verification_status, notes)
      VALUES ($1, $2, $3, $4)
    `, [user.id, 'registration', 'completed', 'User registered successfully']);

    res.status(201).json({
      message: 'Registration successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        title: user.title,
        institution: user.institution,
        department: user.department,
        specialization: user.specialization,
        bio: user.bio,
        isVerified: user.is_verified,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await db.query(`
      SELECT * FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userData = user.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(userData.id, userData.email);

    // Update last login
    await db.query(`
      UPDATE users SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [userData.id]);

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        title: userData.title,
        institution: userData.institution,
        department: userData.department,
        specialization: userData.specialization,
        bio: userData.bio,
        linkedinUrl: userData.linkedin_url,
        cvUrl: userData.cv_url,
        isVerified: userData.is_verified,
        isActive: userData.is_active,
        createdAt: userData.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Check if user still exists and is active
    const user = await db.query(`
      SELECT id, email FROM users 
      WHERE id = $1 AND is_active = true
    `, [decoded.userId]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new access token
    const { token } = generateTokens(decoded.userId, decoded.email);

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Verify token endpoint
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await db.query(`
      SELECT id, email, first_name, last_name, title, institution, department,
             specialization, bio, linkedin_url, cv_url, is_verified, is_active, created_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [req.user.userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.rows[0];
    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        title: userData.title,
        institution: userData.institution,
        department: userData.department,
        specialization: userData.specialization,
        bio: userData.bio,
        linkedinUrl: userData.linkedin_url,
        cvUrl: userData.cv_url,
        isVerified: userData.is_verified,
        isActive: userData.is_active,
        createdAt: userData.created_at
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Update profile endpoint
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('title').optional().trim(),
  body('institution').optional().trim(),
  body('department').optional().trim(),
  body('bio').optional().trim(),
  body('linkedinUrl').optional().isURL(),
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
      firstName,
      lastName,
      title,
      institution,
      department,
      specialization,
      bio,
      linkedinUrl
    } = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (institution !== undefined) {
      updateFields.push(`institution = $${paramCount++}`);
      values.push(institution);
    }
    if (department !== undefined) {
      updateFields.push(`department = $${paramCount++}`);
      values.push(department);
    }
    if (specialization !== undefined) {
      updateFields.push(`specialization = $${paramCount++}`);
      values.push(specialization);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (linkedinUrl !== undefined) {
      updateFields.push(`linkedin_url = $${paramCount++}`);
      values.push(linkedinUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, title, institution, department,
                specialization, bio, linkedin_url, cv_url, is_verified, is_active, created_at
    `;

    const updatedUser = await db.query(query, values);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = updatedUser.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        title: userData.title,
        institution: userData.institution,
        department: userData.department,
        specialization: userData.specialization,
        bio: userData.bio,
        linkedinUrl: userData.linkedin_url,
        cvUrl: userData.cv_url,
        isVerified: userData.is_verified,
        isActive: userData.is_active,
        createdAt: userData.created_at
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Logout endpoint
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router;