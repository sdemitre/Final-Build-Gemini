-- Database initialization script for Docker
-- This script will be run when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created after the schema is loaded

-- Sample data for development (optional)
-- Uncomment the following to add sample data

/*
-- Insert sample users (passwords are 'password123' hashed)
INSERT INTO users (email, password_hash, first_name, last_name, institution, is_verified) VALUES
('john.doe@university.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7bm7dF9Qx6', 'John', 'Doe', 'University Research Center', true),
('jane.smith@institute.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7bm7dF9Qx6', 'Jane', 'Smith', 'Public Health Institute', true);

-- Insert sample disease outbreaks
INSERT INTO disease_outbreaks (disease_name, region, country, coordinates, outbreak_start, cases_reported, deaths_reported, description) VALUES
('COVID-19', 'Asia', 'China', '{"lat": 30.5928, "lng": 114.3055}', '2019-12-01', 100000, 3000, 'Initial COVID-19 outbreak in Wuhan'),
('Ebola', 'Africa', 'Democratic Republic of Congo', '{"lat": -4.0383, "lng": 21.7587}', '2020-06-01', 5000, 500, 'Ebola outbreak in eastern DRC'),
('Dengue Fever', 'South America', 'Brazil', '{"lat": -14.2350, "lng": -51.9253}', '2024-01-15', 25000, 150, 'Dengue outbreak during rainy season');

-- Insert sample job postings
INSERT INTO jobs (title, employer, description, location, application_url, employment_type) VALUES
('Senior Epidemiologist', 'WHO', 'Lead infectious disease surveillance programs', 'Geneva, Switzerland', 'https://careers.who.int/job123', 'Full-time'),
('Research Scientist - Virology', 'CDC', 'Conduct research on viral pathogens', 'Atlanta, GA, USA', 'https://jobs.cdc.gov/job456', 'Full-time'),
('Public Health Data Analyst', 'Johns Hopkins', 'Analyze global health data trends', 'Baltimore, MD, USA', 'https://jobs.jhu.edu/job789', 'Contract');
*/