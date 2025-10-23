const db = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        title VARCHAR(100),
        institution VARCHAR(255),
        department VARCHAR(100),
        specialization TEXT[],
        bio TEXT,
        linkedin_url VARCHAR(255),
        cv_url VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Papers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS papers (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        abstract TEXT NOT NULL,
        keywords TEXT[],
        research_type VARCHAR(50) NOT NULL,
        data_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        funding_source VARCHAR(255),
        geographic_scope TEXT[],
        demographic_data JSONB,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        publication_date TIMESTAMP,
        file_url VARCHAR(255),
        author_id INTEGER REFERENCES users(id),
        co_authors INTEGER[],
        is_seeking_collaboration BOOLEAN DEFAULT FALSE,
        collaboration_needs TEXT,
        collaboration_agreement_text TEXT,
        collaboration_agreement_accepted BOOLEAN DEFAULT FALSE,
        collaboration_agreement_accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure collaboration agreement columns exist (for upgrades)
    await db.query(`ALTER TABLE papers ADD COLUMN IF NOT EXISTS collaboration_agreement_text TEXT`);
    await db.query(`ALTER TABLE papers ADD COLUMN IF NOT EXISTS collaboration_agreement_accepted BOOLEAN DEFAULT FALSE`);
    await db.query(`ALTER TABLE papers ADD COLUMN IF NOT EXISTS collaboration_agreement_accepted_at TIMESTAMP`);

    // Reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER REFERENCES papers(id),
        reviewer_id INTEGER REFERENCES users(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comments TEXT,
        suggestions TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Disease outbreaks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS disease_outbreaks (
        id SERIAL PRIMARY KEY,
        disease_name VARCHAR(200) NOT NULL,
        region VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        coordinates JSONB,
        outbreak_start DATE,
        outbreak_end DATE,
        status VARCHAR(50) DEFAULT 'active',
        cases_reported INTEGER,
        deaths_reported INTEGER,
        description TEXT,
        source_url VARCHAR(255),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Jobs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        employer VARCHAR(200) NOT NULL,
        description TEXT,
        requirements TEXT,
        location VARCHAR(200),
        salary_range VARCHAR(100),
        employment_type VARCHAR(50),
        application_url VARCHAR(255) NOT NULL,
        posted_date DATE DEFAULT CURRENT_DATE,
        closing_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Collaborations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS collaborations (
        id SERIAL PRIMARY KEY,
        initiator_id INTEGER REFERENCES users(id),
        collaborator_id INTEGER REFERENCES users(id),
        paper_id INTEGER REFERENCES papers(id),
        status VARCHAR(50) DEFAULT 'pending',
        agreement_terms TEXT,
        data_sharing_terms TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Research data repository table
    await db.query(`
      CREATE TABLE IF NOT EXISTS research_data (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        data_type VARCHAR(100) NOT NULL,
        file_format VARCHAR(50),
        file_size BIGINT,
        file_url VARCHAR(255),
        metadata JSONB,
        owner_id INTEGER REFERENCES users(id),
        associated_paper_id INTEGER REFERENCES papers(id),
        access_level VARCHAR(50) DEFAULT 'private',
        download_count INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Collaboration agreement templates
    await db.query(`
      CREATE TABLE IF NOT EXISTS collaboration_agreements (
        id SERIAL PRIMARY KEY,
        collaboration_id INTEGER REFERENCES collaborations(id),
        paper_id INTEGER REFERENCES papers(id),
        template_type VARCHAR(100),
        agreement_content JSONB,
        agreement_text TEXT,
        legal_terms TEXT,
        data_sharing_clauses TEXT,
        intellectual_property_terms TEXT,
        signer_user_id INTEGER REFERENCES users(id),
        signer_name VARCHAR(255),
        signer_title VARCHAR(255),
        signer_institution VARCHAR(255),
        signed_by_initiator BOOLEAN DEFAULT FALSE,
        signed_by_collaborator BOOLEAN DEFAULT FALSE,
        signed_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure collaboration_agreements has paper-related columns for upgrades
    await db.query(`ALTER TABLE collaboration_agreements ADD COLUMN IF NOT EXISTS paper_id INTEGER REFERENCES papers(id)`);
    await db.query(`ALTER TABLE collaboration_agreements ADD COLUMN IF NOT EXISTS agreement_text TEXT`);
    await db.query(`ALTER TABLE collaboration_agreements ADD COLUMN IF NOT EXISTS signer_user_id INTEGER REFERENCES users(id)`);
    await db.query(`ALTER TABLE collaboration_agreements ADD COLUMN IF NOT EXISTS signer_name VARCHAR(255)`);
    await db.query(`ALTER TABLE collaboration_agreements ADD COLUMN IF NOT EXISTS signer_title VARCHAR(255)`);
    await db.query(`ALTER TABLE collaboration_agreements ADD COLUMN IF NOT EXISTS signer_institution VARCHAR(255)`);

    // Verification and audit logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        verification_type VARCHAR(100) NOT NULL,
        verification_status VARCHAR(50) NOT NULL,
        verified_by INTEGER REFERENCES users(id),
        verification_data JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications system
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_entity_type VARCHAR(100),
        related_entity_id INTEGER,
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics and metrics
    await db.query(`
      CREATE TABLE IF NOT EXISTS analytics_metrics (
        id SERIAL PRIMARY KEY,
        metric_type VARCHAR(100) NOT NULL,
        metric_name VARCHAR(255) NOT NULL,
        metric_value DECIMAL,
        dimensions JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id)
      )
    `);

    // Paper tags for better categorization
    await db.query(`
      CREATE TABLE IF NOT EXISTS paper_tags (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER REFERENCES papers(id),
        tag_name VARCHAR(100) NOT NULL,
        tag_category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(paper_id, tag_name)
      )
    `);

    // External API integrations tracking
    await db.query(`
      CREATE TABLE IF NOT EXISTS external_integrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        integration_type VARCHAR(100) NOT NULL,
        external_id VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        integration_data JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = { createTables };