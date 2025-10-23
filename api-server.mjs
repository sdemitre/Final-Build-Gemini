// Robust Public Health Research Platform Server for Windows
// This version handles Windows PowerShell terminal better

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

// Enhanced Mock Research Papers for Public Health Platform
const mockPapers = [
  {
    id: 1,
    title: "COVID-19 Transmission Patterns in Urban Areas: A Comprehensive Analysis",
    abstract: "This study examines the transmission patterns of COVID-19 in dense urban environments, analyzing data from 50 major cities worldwide. Our findings reveal significant correlations between population density, public transportation usage, and infection rates.",
    author: "Dr. Sarah Johnson",
    co_authors: ["Dr. Michael Chang", "Dr. Elena Rodriguez"],
    institution: "Harvard School of Public Health",
    research_type: "observational",
    data_type: "quantitative",
    status: "published",
    submission_date: "2024-03-15",
    publication_date: "2024-06-20",
    journal: "International Journal of Epidemiology",
    doi: "10.1093/ije/dyab123",
    keywords: ["COVID-19", "urban transmission", "epidemiology", "population density"],
    categories: ["Infectious Disease", "Urban Health"],
    citations: 45,
    access_level: "open",
    peer_review_status: "completed",
    funding_source: "NIH Grant R01-AI12345"
  },
  {
    id: 2,
    title: "Malaria Prevention Strategies in Sub-Saharan Africa: A Meta-Analysis of Intervention Effectiveness",
    abstract: "An analysis of various malaria prevention strategies and their effectiveness across 30 Sub-Saharan African countries over the past decade. We evaluated bed nets, indoor spraying, and community education programs.",
    author: "Dr. Michael Chen",
    co_authors: ["Dr. Amara Okafor", "Dr. Jean-Baptiste Nzeyimana"],
    institution: "London School of Hygiene & Tropical Medicine",
    research_type: "meta-analysis",
    data_type: "mixed-methods",
    status: "under-review",
    submission_date: "2024-04-02",
    publication_date: null,
    journal: "The Lancet Global Health",
    doi: null,
    keywords: ["malaria", "prevention", "Africa", "intervention", "meta-analysis"],
    categories: ["Vector-borne Disease", "Global Health"],
    citations: 0,
    access_level: "restricted",
    peer_review_status: "in-progress",
    funding_source: "Gates Foundation Grant INV-12345"
  },
  {
    id: 3,
    title: "Vaccine Hesitancy in Rural Communities: Socioeconomic and Cultural Determinants",
    abstract: "Exploring factors contributing to vaccine hesitancy in rural populations across multiple countries. This qualitative study interviewed 2,500 individuals to understand barriers to vaccination uptake.",
    author: "Dr. Emily Rodriguez",
    co_authors: ["Dr. James Wilson", "Dr. Priya Patel"],
    institution: "CDC National Center for Immunization",
    research_type: "survey",
    data_type: "qualitative",
    status: "published",
    submission_date: "2024-05-10",
    publication_date: "2024-08-15",
    journal: "Vaccine",
    doi: "10.1016/j.vaccine.2024.05.123",
    keywords: ["vaccine hesitancy", "rural health", "immunization", "public health"],
    categories: ["Immunization", "Rural Health"],
    citations: 23,
    access_level: "open",
    peer_review_status: "completed",
    funding_source: "CDC Cooperative Agreement NU50CK000123"
  },
  {
    id: 4,
    title: "Antimicrobial Resistance Patterns in Hospital-Acquired Infections: Global Surveillance Data",
    abstract: "Analysis of antimicrobial resistance patterns from 200 hospitals across 50 countries, revealing alarming trends in carbapenem-resistant Enterobacteriaceae and methicillin-resistant Staphylococcus aureus.",
    author: "Dr. Robert Kim",
    co_authors: ["Dr. Lisa Thompson", "Dr. Ahmed Hassan"],
    institution: "WHO Collaborating Centre for Surveillance",
    research_type: "surveillance",
    data_type: "quantitative",
    status: "published",
    submission_date: "2024-01-20",
    publication_date: "2024-04-30",
    journal: "Clinical Infectious Diseases",
    doi: "10.1093/cid/ciae089",
    keywords: ["antimicrobial resistance", "healthcare", "surveillance", "infection control"],
    categories: ["Antimicrobial Resistance", "Healthcare-associated Infections"],
    citations: 67,
    access_level: "open",
    peer_review_status: "completed",
    funding_source: "WHO Research Grant WHO/2023/AMR/001"
  },
  {
    id: 5,
    title: "Climate Change and Vector-Borne Disease Expansion: Predictive Modeling for the Next Decade",
    abstract: "Using machine learning algorithms to predict the expansion of vector-borne diseases due to climate change. Our models forecast significant range expansion for dengue, chikungunya, and Zika viruses.",
    author: "Dr. Maria Santos",
    co_authors: ["Dr. Thomas Anderson", "Dr. Raj Patel"],
    institution: "Johns Hopkins Bloomberg School of Public Health",
    research_type: "modeling",
    data_type: "quantitative",
    status: "in-preparation",
    submission_date: "2024-09-15",
    publication_date: null,
    journal: "Nature Climate Change",
    doi: null,
    keywords: ["climate change", "vector-borne disease", "predictive modeling", "dengue"],
    categories: ["Climate Health", "Vector-borne Disease"],
    citations: 0,
    access_level: "restricted",
    peer_review_status: "draft",
    funding_source: "NOAA Climate and Health Grant NA20OAR4310123"
  },
  {
    id: 6,
    title: "Mental Health Impact of COVID-19 Lockdowns: A Longitudinal Study",
    abstract: "A 24-month longitudinal study examining the mental health consequences of COVID-19 lockdown measures across different demographic groups. Includes data from 10,000 participants in 15 countries.",
    author: "Dr. Jennifer Walsh",
    co_authors: ["Dr. Kevin O'Brien", "Dr. Yuki Tanaka"],
    institution: "Oxford Centre for Global Health Research",
    research_type: "longitudinal",
    data_type: "mixed-methods",
    status: "published",
    submission_date: "2024-02-28",
    publication_date: "2024-07-10",
    journal: "The Lancet Psychiatry",
    doi: "10.1016/S2215-0366(24)00123-X",
    keywords: ["COVID-19", "mental health", "lockdown", "longitudinal study"],
    categories: ["Mental Health", "Pandemic Response"],
    citations: 89,
    access_level: "open",
    peer_review_status: "completed",
    funding_source: "Wellcome Trust Grant 215123/Z/19/Z"
  },
  {
    id: 7,
    title: "Digital Health Interventions for Tuberculosis Management in Low-Resource Settings",
    abstract: "Evaluation of mobile health applications and digital monitoring systems for tuberculosis treatment adherence in resource-limited settings. Study conducted across 25 clinics in India, Kenya, and Peru.",
    author: "Dr. Pradeep Sharma",
    co_authors: ["Dr. Grace Mwangi", "Dr. Carlos Mendoza"],
    institution: "International Union Against Tuberculosis",
    research_type: "intervention",
    data_type: "quantitative",
    status: "under-review",
    submission_date: "2024-06-12",
    publication_date: null,
    journal: "Journal of Medical Internet Research",
    doi: null,
    keywords: ["tuberculosis", "digital health", "mHealth", "treatment adherence"],
    categories: ["Digital Health", "Tuberculosis"],
    citations: 0,
    access_level: "open",
    peer_review_status: "revision-requested",
    funding_source: "USAID Global Health Grant AID-OAA-A-17-00123"
  },
  {
    id: 8,
    title: "Foodborne Illness Outbreak Investigation: Novel Genomic Surveillance Techniques",
    abstract: "Application of whole-genome sequencing and phylogenetic analysis in rapid identification of foodborne pathogen sources. Case study of multi-state Salmonella outbreak in the United States.",
    author: "Dr. Lisa Park",
    co_authors: ["Dr. David Chen", "Dr. Anna Kowalski"],
    institution: "FDA Center for Food Safety",
    research_type: "case-study",
    data_type: "genomic",
    status: "published",
    submission_date: "2024-03-08",
    publication_date: "2024-06-05",
    journal: "Emerging Infectious Diseases",
    doi: "10.3201/eid3006.240123",
    keywords: ["foodborne illness", "genomic surveillance", "Salmonella", "outbreak investigation"],
    categories: ["Food Safety", "Genomic Epidemiology"],
    citations: 34,
    access_level: "open",
    peer_review_status: "completed",
    funding_source: "FDA Intramural Research Program"
  }
];

const mockOutbreaks = [
  {
    id: 1,
    disease_name: "COVID-19",
    region: "Asia",
    country: "China",
    coordinates: { lat: 30.5928, lng: 114.3055 },
    cases_reported: 100000,
    deaths_reported: 3000,
    status: "contained",
    description: "Initial COVID-19 outbreak in Wuhan",
    outbreak_start: "2019-12-01",
    source_url: "https://who.int"
  },
  {
    id: 2,
    disease_name: "Ebola",
    region: "Africa",
    country: "Democratic Republic of Congo",
    coordinates: { lat: -4.0383, lng: 21.7587 },
    cases_reported: 5000,
    deaths_reported: 500,
    status: "contained",
    description: "Ebola outbreak in eastern DRC",
    outbreak_start: "2020-06-01",
    source_url: "https://who.int"
  },
  {
    id: 3,
    disease_name: "Dengue Fever",
    region: "South America",
    country: "Brazil",
    coordinates: { lat: -14.2350, lng: -51.9253 },
    cases_reported: 25000,
    deaths_reported: 150,
    status: "active",
    description: "Dengue outbreak during rainy season",
    outbreak_start: "2024-01-15",
    source_url: "https://paho.org"
  },
  {
    id: 4,
    disease_name: "Mpox",
    region: "Africa",
    country: "Nigeria",
    coordinates: { lat: 9.0820, lng: 8.6753 },
    cases_reported: 1200,
    deaths_reported: 45,
    status: "active",
    description: "Ongoing mpox cases in multiple states",
    outbreak_start: "2023-08-20",
    source_url: "https://who.int"
  },
  {
    id: 5,
    disease_name: "Cholera",
    region: "Asia",
    country: "Bangladesh",
    coordinates: { lat: 23.6850, lng: 90.3563 },
    cases_reported: 3500,
    deaths_reported: 89,
    status: "active",
    description: "Cholera outbreak in refugee camps",
    outbreak_start: "2024-03-10",
    source_url: "https://who.int"
  },
  {
    id: 6,
    disease_name: "Malaria",
    region: "Africa",
    country: "Mali",
    coordinates: { lat: 17.5707, lng: -3.9962 },
    cases_reported: 45000,
    deaths_reported: 1200,
    status: "active",
    description: "Seasonal malaria outbreak in northern regions",
    outbreak_start: "2024-05-15",
    source_url: "https://who.int"
  },
  {
    id: 7,
    disease_name: "Yellow Fever",
    region: "South America",
    country: "Peru",
    coordinates: { lat: -9.1900, lng: -75.0152 },
    cases_reported: 850,
    deaths_reported: 95,
    status: "contained",
    description: "Yellow fever outbreak in Amazon basin",
    outbreak_start: "2024-02-28",
    source_url: "https://paho.org"
  },
  {
    id: 8,
    disease_name: "Zika Virus",
    region: "North America",
    country: "Mexico",
    coordinates: { lat: 23.6345, lng: -102.5528 },
    cases_reported: 2300,
    deaths_reported: 12,
    status: "active",
    description: "Zika virus outbreak in southern states",
    outbreak_start: "2024-06-10",
    source_url: "https://paho.org"
  },
  {
    id: 9,
    disease_name: "Hepatitis A",
    region: "Europe",
    country: "Ukraine",
    coordinates: { lat: 48.3794, lng: 31.1656 },
    cases_reported: 1800,
    deaths_reported: 35,
    status: "active",
    description: "Hepatitis A outbreak in conflict-affected areas",
    outbreak_start: "2024-04-05",
    source_url: "https://who.int"
  },
  {
    id: 10,
    disease_name: "Typhoid",
    region: "Asia",
    country: "Pakistan",
    coordinates: { lat: 30.3753, lng: 69.3451 },
    cases_reported: 8500,
    deaths_reported: 125,
    status: "active",
    description: "Typhoid outbreak following flooding",
    outbreak_start: "2024-07-20",
    source_url: "https://who.int"
  },
  {
    id: 11,
    disease_name: "Meningitis",
    region: "Africa",
    country: "Niger",
    coordinates: { lat: 17.6078, lng: 8.0817 },
    cases_reported: 1200,
    deaths_reported: 180,
    status: "contained",
    description: "Meningitis outbreak during dry season",
    outbreak_start: "2024-01-10",
    source_url: "https://who.int"
  },
  {
    id: 12,
    disease_name: "Measles",
    region: "Africa",
    country: "Madagascar",
    coordinates: { lat: -18.7669, lng: 46.8691 },
    cases_reported: 15000,
    deaths_reported: 890,
    status: "contained",
    description: "Large measles outbreak in multiple regions",
    outbreak_start: "2023-11-15",
    source_url: "https://who.int"
  },
  {
    id: 13,
    disease_name: "Chikungunya",
    region: "Asia",
    country: "India",
    coordinates: { lat: 20.5937, lng: 78.9629 },
    cases_reported: 12000,
    deaths_reported: 45,
    status: "active",
    description: "Chikungunya outbreak during monsoon season",
    outbreak_start: "2024-08-01",
    source_url: "https://who.int"
  },
  {
    id: 14,
    disease_name: "Lassa Fever",
    region: "Africa",
    country: "Sierra Leone",
    coordinates: { lat: 8.4606, lng: -11.7799 },
    cases_reported: 650,
    deaths_reported: 95,
    status: "active",
    description: "Lassa fever outbreak in eastern provinces",
    outbreak_start: "2024-03-25",
    source_url: "https://who.int"
  },
  {
    id: 15,
    disease_name: "Polio",
    region: "Asia",
    country: "Afghanistan",
    coordinates: { lat: 33.9391, lng: 67.7100 },
    cases_reported: 45,
    deaths_reported: 3,
    status: "active",
    description: "Wild poliovirus outbreak in southern regions",
    outbreak_start: "2024-09-12",
    source_url: "https://who.int"
  },
  {
    id: 16,
    disease_name: "Rift Valley Fever",
    region: "Africa",
    country: "Kenya",
    coordinates: { lat: -0.0236, lng: 37.9062 },
    cases_reported: 2100,
    deaths_reported: 85,
    status: "contained",
    description: "Rift Valley fever following heavy rains",
    outbreak_start: "2024-05-30",
    source_url: "https://who.int"
  },
  {
    id: 17,
    disease_name: "Hantavirus",
    region: "North America",
    country: "United States",
    coordinates: { lat: 36.7783, lng: -119.4179 },
    cases_reported: 75,
    deaths_reported: 25,
    status: "contained",
    description: "Hantavirus outbreak in southwestern states",
    outbreak_start: "2024-07-05",
    source_url: "https://cdc.gov"
  },
  {
    id: 18,
    disease_name: "Crimean-Congo Hemorrhagic Fever",
    region: "Europe",
    country: "Turkey",
    coordinates: { lat: 38.9637, lng: 35.2433 },
    cases_reported: 320,
    deaths_reported: 45,
    status: "active",
    description: "CCHF outbreak in central Anatolia",
    outbreak_start: "2024-06-18",
    source_url: "https://who.int"
  },
  {
    id: 19,
    disease_name: "Nipah Virus",
    region: "Asia",
    country: "Malaysia",
    coordinates: { lat: 4.2105, lng: 101.9758 },
    cases_reported: 85,
    deaths_reported: 35,
    status: "contained",
    description: "Nipah virus outbreak in palm oil plantations",
    outbreak_start: "2024-04-12",
    source_url: "https://who.int"
  },
  {
    id: 20,
    disease_name: "Marburg Virus",
    region: "Africa",
    country: "Uganda",
    coordinates: { lat: 1.3733, lng: 32.2903 },
    cases_reported: 175,
    deaths_reported: 85,
    status: "resolved",
    description: "Marburg hemorrhagic fever outbreak",
    outbreak_start: "2023-10-08",
    source_url: "https://who.int"
  },
  {
    id: 21,
    disease_name: "Anthrax",
    region: "Europe",
    country: "Russia",
    coordinates: { lat: 61.5240, lng: 105.3188 },
    cases_reported: 125,
    deaths_reported: 8,
    status: "contained",
    description: "Anthrax outbreak in livestock farms",
    outbreak_start: "2024-08-20",
    source_url: "https://who.int"
  },
  {
    id: 22,
    disease_name: "Plague",
    region: "Asia",
    country: "Mongolia",
    coordinates: { lat: 46.8625, lng: 103.8467 },
    cases_reported: 35,
    deaths_reported: 12,
    status: "active",
    description: "Bubonic plague outbreak in rural areas",
    outbreak_start: "2024-09-05",
    source_url: "https://who.int"
  },
  {
    id: 23,
    disease_name: "MERS-CoV",
    region: "Asia",
    country: "Saudi Arabia",
    coordinates: { lat: 23.8859, lng: 45.0792 },
    cases_reported: 195,
    deaths_reported: 65,
    status: "contained",
    description: "MERS coronavirus outbreak in healthcare facilities",
    outbreak_start: "2024-01-28",
    source_url: "https://who.int"
  },
  {
    id: 24,
    disease_name: "West Nile Virus",
    region: "Europe",
    country: "Greece",
    coordinates: { lat: 39.0742, lng: 21.8243 },
    cases_reported: 450,
    deaths_reported: 28,
    status: "active",
    description: "West Nile virus outbreak during summer",
    outbreak_start: "2024-07-15",
    source_url: "https://ecdc.europa.eu"
  },
  {
    id: 25,
    disease_name: "Tularemia",
    region: "North America",
    country: "Canada",
    coordinates: { lat: 56.1304, lng: -106.3468 },
    cases_reported: 85,
    deaths_reported: 5,
    status: "contained",
    description: "Tularemia outbreak in northern provinces",
    outbreak_start: "2024-05-22",
    source_url: "https://phac-aspc.gc.ca"
  },
  {
    id: 26,
    disease_name: "Japanese Encephalitis",
    region: "Asia",
    country: "Vietnam",
    coordinates: { lat: 14.0583, lng: 108.2772 },
    cases_reported: 650,
    deaths_reported: 85,
    status: "active",
    description: "Japanese encephalitis outbreak in Mekong Delta",
    outbreak_start: "2024-08-15",
    source_url: "https://who.int"
  },
  {
    id: 27,
    disease_name: "Leishmaniasis",
    region: "Asia",
    country: "Iran",
    coordinates: { lat: 32.4279, lng: 53.6880 },
    cases_reported: 2800,
    deaths_reported: 45,
    status: "active",
    description: "Cutaneous leishmaniasis outbreak in rural areas",
    outbreak_start: "2024-04-20",
    source_url: "https://who.int"
  },
  {
    id: 28,
    disease_name: "Schistosomiasis",
    region: "Africa",
    country: "Egypt",
    coordinates: { lat: 26.0975, lng: 31.2357 },
    cases_reported: 5200,
    deaths_reported: 95,
    status: "active",
    description: "Schistosomiasis outbreak along Nile River",
    outbreak_start: "2024-06-05",
    source_url: "https://who.int"
  },
  {
    id: 29,
    disease_name: "Rabies",
    region: "Asia",
    country: "Philippines",
    coordinates: { lat: 12.8797, lng: 121.7740 },
    cases_reported: 185,
    deaths_reported: 175,
    status: "active",
    description: "Rabies outbreak in multiple provinces",
    outbreak_start: "2024-09-10",
    source_url: "https://who.int"
  },
  {
    id: 30,
    disease_name: "Monkeypox",
    region: "Europe",
    country: "Spain",
    coordinates: { lat: 40.4637, lng: -3.7492 },
    cases_reported: 450,
    deaths_reported: 8,
    status: "contained",
    description: "Monkeypox outbreak in urban areas",
    outbreak_start: "2024-05-12",
    source_url: "https://ecdc.europa.eu"
  },
  {
    id: 31,
    disease_name: "Trypanosomiasis",
    region: "Africa",
    country: "Chad",
    coordinates: { lat: 15.4542, lng: 18.7322 },
    cases_reported: 850,
    deaths_reported: 125,
    status: "active",
    description: "African sleeping sickness outbreak",
    outbreak_start: "2024-03-18",
    source_url: "https://who.int"
  },
  {
    id: 32,
    disease_name: "Onchocerciasis",
    region: "Africa",
    country: "Ghana",
    coordinates: { lat: 7.9465, lng: -1.0232 },
    cases_reported: 3200,
    deaths_reported: 25,
    status: "active",
    description: "River blindness outbreak in northern regions",
    outbreak_start: "2024-07-08",
    source_url: "https://who.int"
  },
  {
    id: 33,
    disease_name: "Lymphatic Filariasis",
    region: "Asia",
    country: "Indonesia",
    coordinates: { lat: -0.7893, lng: 113.9213 },
    cases_reported: 1850,
    deaths_reported: 35,
    status: "contained",
    description: "Lymphatic filariasis outbreak in eastern islands",
    outbreak_start: "2024-02-14",
    source_url: "https://who.int"
  },
  {
    id: 34,
    disease_name: "Hand, Foot and Mouth Disease",
    region: "Asia",
    country: "South Korea",
    coordinates: { lat: 35.9078, lng: 127.7669 },
    cases_reported: 8500,
    deaths_reported: 15,
    status: "contained",
    description: "HFMD outbreak in kindergartens and schools",
    outbreak_start: "2024-06-22",
    source_url: "https://kcdc.go.kr"
  },
  {
    id: 35,
    disease_name: "Q Fever",
    region: "Europe",
    country: "Netherlands",
    coordinates: { lat: 52.1326, lng: 5.2913 },
    cases_reported: 385,
    deaths_reported: 12,
    status: "contained",
    description: "Q fever outbreak linked to goat farms",
    outbreak_start: "2024-04-30",
    source_url: "https://rivm.nl"
  },
  {
    id: 36,
    disease_name: "Glanders",
    region: "Asia",
    country: "Myanmar",
    coordinates: { lat: 21.9162, lng: 95.9560 },
    cases_reported: 25,
    deaths_reported: 8,
    status: "active",
    description: "Glanders outbreak in rural farming areas",
    outbreak_start: "2024-08-03",
    source_url: "https://who.int"
  },
  {
    id: 37,
    disease_name: "Brucellosis",
    region: "Europe",
    country: "Albania",
    coordinates: { lat: 41.1533, lng: 20.1683 },
    cases_reported: 650,
    deaths_reported: 15,
    status: "active",
    description: "Brucellosis outbreak in livestock farmers",
    outbreak_start: "2024-07-25",
    source_url: "https://who.int"
  },
  {
    id: 38,
    disease_name: "Leptospirosis",
    region: "South America",
    country: "Argentina",
    coordinates: { lat: -38.4161, lng: -63.6167 },
    cases_reported: 1200,
    deaths_reported: 85,
    status: "active",
    description: "Leptospirosis outbreak after flooding",
    outbreak_start: "2024-09-18",
    source_url: "https://paho.org"
  },
  {
    id: 39,
    disease_name: "Histoplasmosis",
    region: "North America",
    country: "United States",
    coordinates: { lat: 39.8283, lng: -98.5795 },
    cases_reported: 450,
    deaths_reported: 25,
    status: "contained",
    description: "Histoplasmosis outbreak in central states",
    outbreak_start: "2024-05-08",
    source_url: "https://cdc.gov"
  },
  {
    id: 40,
    disease_name: "Coccidioidomycosis",
    region: "North America",
    country: "Mexico",
    coordinates: { lat: 26.0129, lng: -111.2061 },
    cases_reported: 785,
    deaths_reported: 45,
    status: "active",
    description: "Valley fever outbreak in northwestern states",
    outbreak_start: "2024-03-22",
    source_url: "https://paho.org"
  }
];

// Mock users data
const mockUsers = [
  {
    id: 1,
    email: "sarah.johnson@university.edu",
    name: "Dr. Sarah Johnson",
    institution: "University Medical Center",
    specialization: "Epidemiology",
    role: "researcher",
    verified: true,
    papers_count: 15,
    collaborations_count: 8
  },
  {
    id: 2,
    email: "michael.chen@globalhealth.org",
    name: "Dr. Michael Chen",
    institution: "Global Health Institute",
    specialization: "Infectious Diseases",
    role: "researcher",
    verified: true,
    papers_count: 22,
    collaborations_count: 12
  }
];

// Mock jobs data
const mockJobs = [
  {
    id: 1,
    title: "Senior Epidemiologist",
    organization: "World Health Organization",
    location: "Geneva, Switzerland",
    type: "full-time",
    salary_range: "$80,000 - $120,000",
    description: "Leading epidemiological research on infectious disease outbreaks...",
    requirements: ["PhD in Epidemiology", "5+ years experience", "Statistical analysis skills"],
    posted_date: "2024-10-15",
    deadline: "2024-11-15"
  },
  {
    id: 2,
    title: "Public Health Data Analyst",
    organization: "Centers for Disease Control",
    location: "Atlanta, USA",
    type: "contract",
    salary_range: "$60,000 - $85,000",
    description: "Analyzing disease surveillance data and creating visualizations...",
    requirements: ["MS in Public Health", "Python/R experience", "Data visualization skills"],
    posted_date: "2024-10-10",
    deadline: "2024-11-30"
  }
];

// Mock collaborations data
const mockCollaborations = [
  {
    id: 1,
    title: "Global Malaria Surveillance Network",
    description: "Multi-country collaboration tracking malaria trends across Africa",
    lead_researcher: "Dr. Sarah Johnson",
    participants: 15,
    institutions: ["University Medical Center", "WHO", "African Health Institute"],
    status: "active",
    start_date: "2024-01-15",
    end_date: "2025-01-15"
  },
  {
    id: 2,
    title: "COVID-19 Long-term Effects Study",
    description: "Longitudinal study on long COVID symptoms across multiple populations",
    lead_researcher: "Dr. Michael Chen",
    participants: 8,
    institutions: ["Global Health Institute", "European CDC", "Asian Health Network"],
    status: "recruiting",
    start_date: "2024-06-01",
    end_date: "2026-06-01"
  }
];

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Health Research Platform</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%);
            color: white;
            padding: 1rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        
        .nav { display: flex; justify-content: space-between; align-items: center; }
        
        .logo { font-size: 1.5rem; font-weight: 700; }
        
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        
        .nav-links a { color: white; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
        
        .nav-links a:hover { opacity: 0.8; }
        
        .hero { text-align: center; padding: 4rem 0; }
        
        .hero h1 { font-size: 3rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
        
        .hero p { font-size: 1.25rem; color: #64748b; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        
        .btn {
            display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%);
            color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600;
            transition: transform 0.3s, box-shadow 0.3s; margin: 0.5rem;
        }
        
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3); }
        
        .status-badge {
            display: inline-block; padding: 0.25rem 0.75rem; background: #10b981; color: white;
            border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-left: 1rem;
        }
        
        .api-section { padding: 4rem 0; background: white; }
        
        .api-demo {
            background: #f8fafc; border-radius: 1rem; padding: 2rem; margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .api-response {
            background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem;
            font-family: 'Monaco', 'Menlo', monospace; font-size: 0.875rem; overflow-x: auto; margin-top: 1rem;
        }
        
        .footer {
            background: #1e293b; color: white; text-align: center; padding: 2rem 0; margin-top: 4rem;
        }
        
        /* World Map Styles */
        .map-section {
            padding: 4rem 0; background: #f1f5f9;
        }
        
        .map-container {
            background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
        }
        
        #world-map {
            height: 500px; width: 100%; border-radius: 0.5rem; border: 2px solid #e2e8f0;
        }
        
        .map-legend {
            display: flex; gap: 2rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;
        }
        
        .legend-item {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
            background: white; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .legend-color {
            width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .outbreak-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem; margin-top: 2rem;
        }
        
        .stat-card {
            background: white; padding: 1.5rem; border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); text-align: center;
        }
        
        .stat-number {
            font-size: 2rem; font-weight: 700; color: #1e40af; margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #64748b; font-size: 0.875rem; text-transform: uppercase;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
            .nav-links { flex-direction: column; gap: 1rem; }
            .container { padding: 0 1rem; }
            #world-map { height: 400px; }
            .map-legend { gap: 1rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">🔬 PH Research Hub</div>
                <ul class="nav-links">
                    <li><a href="#papers">Papers</a></li>
                    <li><a href="#map">Disease Map</a></li>
                    <li><a href="#api">API Demo</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1>Public Health Research Platform</h1>
                <p>Connecting researchers worldwide for collaborative infectious disease research and knowledge sharing</p>
                <a href="#api" class="btn">🚀 Explore API</a>
                <a href="/api/papers" class="btn" target="_blank">📊 View Papers</a>
                <div class="status-badge">✅ Server Running</div>
            </div>
        </section>

        <section id="map" class="map-section">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 2rem; font-size: 2.5rem; color: #1e293b;">Global Disease Outbreak Map</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Real-time visualization of infectious disease outbreaks worldwide. Click on markers to view detailed outbreak information.
                </p>
                
                <div class="map-container">
                    <div id="world-map"></div>
                    <div class="map-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #dc2626;"></div>
                            <span>Active Outbreak</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #f59e0b;"></div>
                            <span>Monitoring</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #10b981;"></div>
                            <span>Contained</span>
                        </div>
                    </div>
                </div>

                <div class="outbreak-stats">
                    <div class="stat-card">
                        <div class="stat-number" id="total-outbreaks">0</div>
                        <div class="stat-label">Active Outbreaks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="total-cases">0</div>
                        <div class="stat-label">Total Cases</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="countries-affected">0</div>
                        <div class="stat-label">Countries Affected</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="last-updated">--</div>
                        <div class="stat-label">Last Updated</div>
                    </div>
                </div>
            </div>
        </section>

        <section id="api" class="api-section">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 2rem; font-size: 2.5rem; color: #1e293b;">Live API Endpoints</h2>
                
                <div class="api-demo">
                    <h3>📊 API Health Check</h3>
                    <p>Server status and available endpoints:</p>
                    <div class="api-response" id="health-response">Loading health status...</div>
                    <a href="/api/health" class="btn" target="_blank">View Health API</a>
                </div>

                <div class="api-demo">
                    <h3>📄 Research Papers API</h3>
                    <p>Access the latest research papers and submissions:</p>
                    <div class="api-response" id="papers-response">Loading papers...</div>
                    <a href="/api/papers" class="btn" target="_blank">View Papers API</a>
                </div>

                <div class="api-demo">
                    <h3>🦠 Disease Outbreaks API</h3>
                    <p>Real-time infectious disease outbreak data:</p>
                    <div class="api-response" id="outbreaks-response">Loading outbreaks...</div>
                    <a href="/api/diseases/outbreaks" class="btn" target="_blank">View Outbreaks API</a>
                </div>

                <div class="api-demo">
                    <h3>👥 Researchers API</h3>
                    <p>Browse the global network of public health researchers:</p>
                    <div class="api-response" id="users-response">Loading researchers...</div>
                    <a href="/api/users" class="btn" target="_blank">View Users API</a>
                </div>

                <div class="api-demo">
                    <h3>💼 Jobs API</h3>
                    <p>Discover career opportunities in public health:</p>
                    <div class="api-response" id="jobs-response">Loading jobs...</div>
                    <a href="/api/jobs" class="btn" target="_blank">View Jobs API</a>
                </div>

                <div class="api-demo">
                    <h3>🤝 Collaborations API</h3>
                    <p>Active research collaborations worldwide:</p>
                    <div class="api-response" id="collaborations-response">Loading collaborations...</div>
                    <a href="/api/collaborations" class="btn" target="_blank">View Collaborations API</a>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Public Health Research Platform. Advancing global health through research.</p>
            <p style="margin-top: 0.5rem; opacity: 0.8;">🌍 Supporting evidence-based public health research worldwide</p>
        </div>
    </footer>

    <script>
        async function loadAPIData() {
            try {
                // Health check
                const healthResponse = await fetch('/api/health');
                const healthData = await healthResponse.json();
                document.getElementById('health-response').textContent = JSON.stringify(healthData, null, 2);

                // Papers
                const papersResponse = await fetch('/api/papers');
                const papersData = await papersResponse.json();
                document.getElementById('papers-response').textContent = JSON.stringify(papersData, null, 2);

                // Outbreaks  
                const outbreaksResponse = await fetch('/api/diseases/outbreaks');
                const outbreaksData = await outbreaksResponse.json();
                document.getElementById('outbreaks-response').textContent = JSON.stringify(outbreaksData, null, 2);

                // Users/Researchers
                const usersResponse = await fetch('/api/users');
                const usersData = await usersResponse.json();
                document.getElementById('users-response').textContent = JSON.stringify(usersData, null, 2);

                // Jobs
                const jobsResponse = await fetch('/api/jobs');
                const jobsData = await jobsResponse.json();
                document.getElementById('jobs-response').textContent = JSON.stringify(jobsData, null, 2);

                // Collaborations
                const collaborationsResponse = await fetch('/api/collaborations');
                const collaborationsData = await collaborationsResponse.json();
                document.getElementById('collaborations-response').textContent = JSON.stringify(collaborationsData, null, 2);

            } catch (error) {
                console.error('Error loading API data:', error);
                const errorMsg = 'Error: ' + error.message;
                document.getElementById('health-response').textContent = errorMsg;
                document.getElementById('papers-response').textContent = errorMsg;
                document.getElementById('outbreaks-response').textContent = errorMsg;
                document.getElementById('users-response').textContent = errorMsg;
                document.getElementById('jobs-response').textContent = errorMsg;
                document.getElementById('collaborations-response').textContent = errorMsg;
            }
        }

        // World Map Implementation
        let map;
        let outbreakData = [];

        function initializeMap() {
            // Create the map
            map = L.map('world-map').setView([20, 0], 2);

            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            // Load outbreak data and add markers
            loadOutbreakData();
        }

        async function loadOutbreakData() {
            try {
                const response = await fetch('/api/diseases/outbreaks');
                const data = await response.json();
                outbreakData = data.data;

                // Clear existing markers
                map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // Add markers for each outbreak
                outbreakData.forEach(outbreak => {
                    const color = getOutbreakColor(outbreak.status);
                    const icon = L.divIcon({
                        className: 'custom-outbreak-marker',
                        html: \`<div style="background-color: \${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    const marker = L.marker([outbreak.coordinates.lat, outbreak.coordinates.lng], { icon })
                        .addTo(map);

                    // Create popup content
                    const popupContent = \`
                        <div style="font-family: sans-serif; min-width: 250px;">
                            <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 1.1em;">\${outbreak.disease_name}</h3>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Location:</strong> \${outbreak.country}, \${outbreak.region}</p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Cases:</strong> \${outbreak.cases_reported.toLocaleString()}</p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Deaths:</strong> \${outbreak.deaths_reported}</p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Status:</strong> <span style="color: \${color}; font-weight: bold; text-transform: capitalize;">\${outbreak.status}</span></p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Last Updated:</strong> \${outbreak.last_updated}</p>
                            <p style="margin: 10px 0 0 0; color: #374151; font-style: italic;">\${outbreak.description}</p>
                        </div>
                    \`;

                    marker.bindPopup(popupContent);
                });

                // Update statistics
                updateOutbreakStats();

            } catch (error) {
                console.error('Error loading outbreak data:', error);
            }
        }

        function getOutbreakColor(status) {
            switch (status.toLowerCase()) {
                case 'active': return '#dc2626';
                case 'monitoring': return '#f59e0b';
                case 'contained': return '#10b981';
                default: return '#6b7280';
            }
        }

        function updateOutbreakStats() {
            const totalOutbreaks = outbreakData.length;
            const totalCases = outbreakData.reduce((sum, outbreak) => sum + outbreak.cases_reported, 0);
            const countriesAffected = new Set(outbreakData.map(outbreak => outbreak.country)).size;
            const lastUpdated = outbreakData.reduce((latest, outbreak) => {
                const outbreakDate = new Date(outbreak.last_updated);
                return outbreakDate > latest ? outbreakDate : latest;
            }, new Date(0));

            document.getElementById('total-outbreaks').textContent = totalOutbreaks;
            document.getElementById('total-cases').textContent = totalCases.toLocaleString();
            document.getElementById('countries-affected').textContent = countriesAffected;
            document.getElementById('last-updated').textContent = lastUpdated.toLocaleDateString();
        }

        // Load data when page loads
        window.addEventListener('load', () => {
            loadAPIData();
            // Initialize map after a short delay to ensure the container is ready
            setTimeout(initializeMap, 500);
        });
    </script>
</body>
</html>`;

// Enhanced server with better error handling
const server = createServer(async (req, res) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // API Routes
    if (url.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      
      if (url.startsWith('/api/papers') && method === 'GET') {
        console.log('Serving papers API');
        
        // Parse query parameters
        const urlObj = new URL(url, `http://localhost:${PORT}`);
        const params = urlObj.searchParams;
        
        // Extract filter parameters
        const status = params.get('status');
        const category = params.get('category');
        const author = params.get('author');
        const institution = params.get('institution');
        const research_type = params.get('research_type');
        const search = params.get('search');
        const limit = parseInt(params.get('limit')) || mockPapers.length;
        const offset = parseInt(params.get('offset')) || 0;
        const sort_by = params.get('sort_by') || 'submission_date';
        const sort_order = params.get('sort_order') || 'desc';
        
        // Filter papers based on parameters
        let filteredPapers = [...mockPapers];
        
        if (status) {
          filteredPapers = filteredPapers.filter(paper => 
            paper.status.toLowerCase() === status.toLowerCase()
          );
        }
        
        if (category) {
          filteredPapers = filteredPapers.filter(paper => 
            paper.categories.some(cat => 
              cat.toLowerCase().includes(category.toLowerCase())
            )
          );
        }
        
        if (author) {
          filteredPapers = filteredPapers.filter(paper => 
            paper.author.toLowerCase().includes(author.toLowerCase()) ||
            paper.co_authors.some(coAuthor => 
              coAuthor.toLowerCase().includes(author.toLowerCase())
            )
          );
        }
        
        if (institution) {
          filteredPapers = filteredPapers.filter(paper => 
            paper.institution.toLowerCase().includes(institution.toLowerCase())
          );
        }
        
        if (research_type) {
          filteredPapers = filteredPapers.filter(paper => 
            paper.research_type.toLowerCase() === research_type.toLowerCase()
          );
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredPapers = filteredPapers.filter(paper => 
            paper.title.toLowerCase().includes(searchLower) ||
            paper.abstract.toLowerCase().includes(searchLower) ||
            paper.keywords.some(keyword => 
              keyword.toLowerCase().includes(searchLower)
            )
          );
        }
        
        // Sort papers
        filteredPapers.sort((a, b) => {
          let aValue, bValue;
          
          switch (sort_by) {
            case 'title':
              aValue = a.title;
              bValue = b.title;
              break;
            case 'author':
              aValue = a.author;
              bValue = b.author;
              break;
            case 'citations':
              aValue = a.citations;
              bValue = b.citations;
              break;
            case 'publication_date':
              aValue = a.publication_date || '1900-01-01';
              bValue = b.publication_date || '1900-01-01';
              break;
            default: // submission_date
              aValue = a.submission_date;
              bValue = b.submission_date;
          }
          
          if (typeof aValue === 'string') {
            return sort_order === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
          } else {
            return sort_order === 'desc' ? bValue - aValue : aValue - bValue;
          }
        });
        
        // Apply pagination
        const totalCount = filteredPapers.length;
        const paginatedPapers = filteredPapers.slice(offset, offset + limit);
        
        // Generate summary statistics
        const statusCounts = {
          published: filteredPapers.filter(p => p.status === 'published').length,
          'under-review': filteredPapers.filter(p => p.status === 'under-review').length,
          'in-preparation': filteredPapers.filter(p => p.status === 'in-preparation').length
        };
        
        const categoryCounts = {};
        filteredPapers.forEach(paper => {
          paper.categories.forEach(cat => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          });
        });
        
        const response = {
          success: true,
          data: paginatedPapers,
          pagination: {
            total_count: totalCount,
            returned_count: paginatedPapers.length,
            offset: offset,
            limit: limit,
            has_more: offset + limit < totalCount
          },
          filters_applied: {
            status: status || null,
            category: category || null,
            author: author || null,
            institution: institution || null,
            research_type: research_type || null,
            search: search || null
          },
          sorting: {
            sort_by: sort_by,
            sort_order: sort_order
          },
          summary: {
            status_distribution: statusCounts,
            category_distribution: categoryCounts,
            total_citations: filteredPapers.reduce((sum, paper) => sum + paper.citations, 0)
          },
          available_filters: {
            statuses: ['published', 'under-review', 'in-preparation', 'draft'],
            research_types: ['observational', 'meta-analysis', 'survey', 'surveillance', 'modeling', 'longitudinal', 'intervention', 'case-study'],
            categories: ['Infectious Disease', 'Urban Health', 'Vector-borne Disease', 'Global Health', 'Immunization', 'Rural Health', 'Antimicrobial Resistance', 'Healthcare-associated Infections', 'Climate Health', 'Mental Health', 'Pandemic Response', 'Digital Health', 'Tuberculosis', 'Food Safety', 'Genomic Epidemiology']
          },
          message: "Research papers retrieved successfully",
          timestamp: timestamp
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }
      
      if (url === '/api/diseases/outbreaks' && method === 'GET') {
        console.log('Serving outbreaks API');
        const response = {
          success: true,
          data: mockOutbreaks,
          count: mockOutbreaks.length,
          message: "Disease outbreak data retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      if (url === '/api/health' && method === 'GET') {
        console.log('Serving health check API');
        const response = {
          status: 'OK',
          message: 'Public Health Research Platform API is running',
          timestamp: timestamp,
          uptime: process.uptime(),
          endpoints: {
            papers: '/api/papers',
            outbreaks: '/api/diseases/outbreaks',
            users: '/api/users',
            jobs: '/api/jobs',
            collaborations: '/api/collaborations',
            auth: '/api/auth',
            health: '/api/health'
          },
          server: {
            node_version: process.version,
            platform: process.platform,
            memory_usage: process.memoryUsage()
          }
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Authentication endpoints
      if (url === '/api/auth/login' && method === 'POST') {
        console.log('Serving login API');
        const response = {
          success: true,
          message: "Login successful",
          token: "mock_jwt_token_12345",
          user: {
            id: 1,
            email: "researcher@example.com",
            name: "Dr. John Researcher",
            role: "researcher"
          },
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      if (url === '/api/auth/register' && method === 'POST') {
        console.log('Serving register API');
        const response = {
          success: true,
          message: "Registration successful",
          user: {
            id: Date.now(),
            email: "new.researcher@example.com",
            name: "New Researcher",
            role: "researcher"
          },
          timestamp: timestamp
        };
        res.writeHead(201);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Users endpoint
      if (url === '/api/users' && method === 'GET') {
        console.log('Serving users API');
        const response = {
          success: true,
          data: mockUsers,
          count: mockUsers.length,
          message: "Users retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Jobs endpoint
      if (url === '/api/jobs' && method === 'GET') {
        console.log('Serving jobs API');
        const response = {
          success: true,
          data: mockJobs,
          count: mockJobs.length,
          message: "Jobs retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Collaborations endpoint
      if (url === '/api/collaborations' && method === 'GET') {
        console.log('Serving collaborations API');
        const response = {
          success: true,
          data: mockCollaborations,
          count: mockCollaborations.length,
          message: "Collaborations retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Paper submission endpoint
      if (url === '/api/papers' && method === 'POST') {
        console.log('Serving paper submission API');
        const response = {
          success: true,
          message: "Paper submitted successfully",
          paper_id: Date.now(),
          status: "under-review",
          timestamp: timestamp
        };
        res.writeHead(201);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // User profile endpoint
      if (url.startsWith('/api/users/') && method === 'GET') {
        console.log('Serving user profile API');
        const userId = url.split('/')[3];
        const response = {
          success: true,
          data: {
            id: userId,
            email: "researcher@example.com",
            name: "Dr. Research Example",
            institution: "Example University",
            specialization: "Epidemiology",
            papers_count: 5,
            collaborations_count: 3
          },
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // API endpoint not found
      console.log(`API endpoint not found: ${url}`);
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'API endpoint not found',
        requested: url,
        method: method,
        available_endpoints: ['/api/papers', '/api/diseases/outbreaks', '/api/health'],
        timestamp: timestamp
      }, null, 2));
      return;
    }

    // Serve main page
    if (url === '/' || url === '/index.html') {
      console.log('Serving main page');
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(indexHTML);
      return;
    }

    // 404 for other routes
    console.log(`Route not found: ${url}`);
    res.writeHead(404);
    res.end('<h1>404 - Page not found</h1>');

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      timestamp: timestamp
    }, null, 2));
  }
});

// Start server with enhanced error handling
server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log('========================================');
  console.log('  PUBLIC HEALTH RESEARCH PLATFORM');
  console.log('========================================');
  console.log('');
  console.log('✅ Server running successfully!');
  console.log('');
  console.log(`🌐 Platform URL: http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📄 Papers API: http://localhost:${PORT}/api/papers`);
  console.log(`🦠 Outbreaks API: http://localhost:${PORT}/api/diseases/outbreaks`);
  console.log('');
  console.log('🔧 Enhanced Features:');
  console.log('  • Request logging for debugging');
  console.log('  • Improved error handling');
  console.log('  • CORS support for API access');
  console.log('  • Real-time health monitoring');
  console.log('  • Extended mock data for testing');
  console.log('');
  console.log('💡 Test APIs using:');
  console.log('  PowerShell: Invoke-WebRequest -Uri "http://localhost:3000/api/health"');
  console.log('  Browser: Visit http://localhost:3000');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('========================================');
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use`);
    console.log('Try stopping other servers or use a different port');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

export default server;