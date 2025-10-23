import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface PaperSubmissionData {
  // Basic Information
  title: string;
  abstract: string;
  keywords: string[];
  
  // Research Details
  researchType: 'observational' | 'experimental' | 'review' | 'meta-analysis' | 'case-study';
  dataType: 'qualitative' | 'quantitative' | 'mixed-methods';
  methodology: string;
  sampleSize: number | '';
  studyStartDate: string;
  studyEndDate: string;
  
  // Geographic and Demographic
  geographicScope: string[];
  populationDemographics: {
    ageGroups: string[];
    genderDistribution: string;
    socioeconomicFactors: string;
    ethnicityFactors: string;
  };
  
  // Funding and Ethics
  fundingSource: string;
  fundingAmount: string;
  ethicsApproval: boolean;
  ethicsCommittee: string;
  institutionalAffiliation: string;
  
  // Disease/Health Focus
  diseaseCategory: string;
  specificConditions: string[];
  interventions: string[];
  outcomes: string[];
  
  // Collaboration
  isSeekingCollaboration: boolean;
  collaborationNeeds: string[];
  dataAvailableForSharing: boolean;
  preferredPartnerCriteria: string;
  
  // Files
  manuscriptFile: File | null;
  supplementaryFiles: File[];
  ethicsDocuments: File[];
  
  // Additional Information
  previousPublications: string;
  conflictsOfInterest: string;
  acknowledgments: string;
}

const SubmitPaper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PaperSubmissionData>({
    title: '',
    abstract: '',
    keywords: [],
    researchType: 'observational',
    dataType: 'quantitative',
    methodology: '',
    sampleSize: '',
    studyStartDate: '',
    studyEndDate: '',
    geographicScope: [],
    populationDemographics: {
      ageGroups: [],
      genderDistribution: '',
      socioeconomicFactors: '',
      ethnicityFactors: '',
    },
    fundingSource: '',
    fundingAmount: '',
    ethicsApproval: false,
    ethicsCommittee: '',
    institutionalAffiliation: user?.institution || '',
    diseaseCategory: '',
    specificConditions: [],
    interventions: [],
    outcomes: [],
    isSeekingCollaboration: false,
    collaborationNeeds: [],
    dataAvailableForSharing: false,
    preferredPartnerCriteria: '',
    manuscriptFile: null,
    supplementaryFiles: [],
    ethicsDocuments: [],
    previousPublications: '',
    conflictsOfInterest: '',
    acknowledgments: '',
  });

  const totalSteps = 6;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof PaperSubmissionData] as any),
        [field]: value,
      },
    }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    if (value.trim()) {
      const currentArray = formData[field as keyof PaperSubmissionData] as string[];
      setFormData(prev => ({
        ...prev,
        [field]: [...currentArray, value.trim()],
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData[field as keyof PaperSubmissionData] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (files) {
      if (field === 'manuscriptFile') {
        setFormData(prev => ({
          ...prev,
          [field]: files[0],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: Array.from(files),
        }));
      }
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof PaperSubmissionData];
        if (key === 'manuscriptFile' && value) {
          submitData.append('manuscriptFile', value as File);
        } else if (key === 'supplementaryFiles' || key === 'ethicsDocuments') {
          (value as File[]).forEach((file, index) => {
            submitData.append(`${key}[${index}]`, file);
          });
        } else if (typeof value === 'object') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value as string);
        }
      });

      // TODO: Replace with actual API call
      // const response = await api.post('/papers/submit', submitData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Paper submitted successfully!');
      navigate('/papers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit paper');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Basic Information</h3>
            <div className="grid gap-4">
              <div className="form-group">
                <label className="form-label">Paper Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your paper title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Abstract *</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={formData.abstract}
                  onChange={(e) => handleInputChange('abstract', e.target.value)}
                  placeholder="Provide a comprehensive abstract of your research"
                  required
                />
                <div className="form-text">
                  Include background, objectives, methods, results, and conclusions.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Keywords</label>
                <div className="keywords-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a keyword and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('keywords', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="keywords-list mt-2 flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span key={index} className="badge badge-secondary">
                        {keyword}
                        <button
                          type="button"
                          className="ml-1 text-sm"
                          onClick={() => removeArrayItem('keywords', index)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Research Type *</label>
                  <select
                    className="form-control"
                    value={formData.researchType}
                    onChange={(e) => handleInputChange('researchType', e.target.value)}
                    required
                  >
                    <option value="observational">Observational Study</option>
                    <option value="experimental">Experimental Study</option>
                    <option value="review">Literature Review</option>
                    <option value="meta-analysis">Meta-Analysis</option>
                    <option value="case-study">Case Study</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Data Type *</label>
                  <select
                    className="form-control"
                    value={formData.dataType}
                    onChange={(e) => handleInputChange('dataType', e.target.value)}
                    required
                  >
                    <option value="quantitative">Quantitative</option>
                    <option value="qualitative">Qualitative</option>
                    <option value="mixed-methods">Mixed Methods</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>Research Details</h3>
            <div className="grid gap-4">
              <div className="form-group">
                <label className="form-label">Methodology *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  placeholder="Describe your research methodology"
                  required
                />
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Sample Size</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.sampleSize}
                    onChange={(e) => handleInputChange('sampleSize', parseInt(e.target.value) || '')}
                    placeholder="Number of participants/samples"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Disease Category *</label>
                  <select
                    className="form-control"
                    value={formData.diseaseCategory}
                    onChange={(e) => handleInputChange('diseaseCategory', e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="infectious-diseases">Infectious Diseases</option>
                    <option value="vector-borne">Vector-borne Diseases</option>
                    <option value="respiratory">Respiratory Diseases</option>
                    <option value="gastrointestinal">Gastrointestinal Diseases</option>
                    <option value="sexually-transmitted">Sexually Transmitted Infections</option>
                    <option value="emerging-diseases">Emerging Infectious Diseases</option>
                    <option value="antimicrobial-resistance">Antimicrobial Resistance</option>
                    <option value="outbreak-response">Outbreak Response</option>
                    <option value="vaccination">Vaccination & Immunization</option>
                    <option value="surveillance">Disease Surveillance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Study Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.studyStartDate}
                    onChange={(e) => handleInputChange('studyStartDate', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Study End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.studyEndDate}
                    onChange={(e) => handleInputChange('studyEndDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>Geographic & Demographic Information</h3>
            <div className="grid gap-4">
              <div className="form-group">
                <label className="form-label">Geographic Scope</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add location and press Enter (e.g., Nigeria, West Africa)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayInputChange('geographicScope', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="keywords-list mt-2 flex flex-wrap gap-2">
                  {formData.geographicScope.map((location, index) => (
                    <span key={index} className="badge badge-primary">
                      {location}
                      <button
                        type="button"
                        className="ml-1 text-sm"
                        onClick={() => removeArrayItem('geographicScope', index)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Age Groups</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add age group and press Enter (e.g., 18-65 years)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const currentAgeGroups = formData.populationDemographics.ageGroups;
                      handleNestedInputChange('populationDemographics', 'ageGroups', [...currentAgeGroups, e.currentTarget.value.trim()]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="keywords-list mt-2 flex flex-wrap gap-2">
                  {formData.populationDemographics.ageGroups.map((ageGroup, index) => (
                    <span key={index} className="badge badge-secondary">
                      {ageGroup}
                      <button
                        type="button"
                        className="ml-1 text-sm"
                        onClick={() => {
                          const newAgeGroups = formData.populationDemographics.ageGroups.filter((_, i) => i !== index);
                          handleNestedInputChange('populationDemographics', 'ageGroups', newAgeGroups);
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender Distribution</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.populationDemographics.genderDistribution}
                  onChange={(e) => handleNestedInputChange('populationDemographics', 'genderDistribution', e.target.value)}
                  placeholder="e.g., 60% female, 40% male"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Socioeconomic Factors</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.populationDemographics.socioeconomicFactors}
                  onChange={(e) => handleNestedInputChange('populationDemographics', 'socioeconomicFactors', e.target.value)}
                  placeholder="Describe socioeconomic characteristics of study population"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h3>Funding & Ethics</h3>
            <div className="grid gap-4">
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Funding Source</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fundingSource}
                    onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                    placeholder="e.g., NIH, WHO, Gates Foundation"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Funding Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fundingAmount}
                    onChange={(e) => handleInputChange('fundingAmount', e.target.value)}
                    placeholder="e.g., $500,000 USD"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Institutional Affiliation *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.institutionalAffiliation}
                  onChange={(e) => handleInputChange('institutionalAffiliation', e.target.value)}
                  placeholder="Your institution or organization"
                  required
                />
              </div>

              <div className="form-group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ethicsApproval"
                    checked={formData.ethicsApproval}
                    onChange={(e) => handleInputChange('ethicsApproval', e.target.checked)}
                  />
                  <label htmlFor="ethicsApproval" className="form-label mb-0">
                    Ethics approval obtained
                  </label>
                </div>
              </div>

              {formData.ethicsApproval && (
                <div className="form-group">
                  <label className="form-label">Ethics Committee/IRB</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.ethicsCommittee}
                    onChange={(e) => handleInputChange('ethicsCommittee', e.target.value)}
                    placeholder="Name of ethics committee or IRB"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Conflicts of Interest</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.conflictsOfInterest}
                  onChange={(e) => handleInputChange('conflictsOfInterest', e.target.value)}
                  placeholder="Declare any conflicts of interest or state 'None'"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-step">
            <h3>Collaboration Preferences</h3>
            <div className="grid gap-4">
              <div className="form-group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="seekingCollaboration"
                    checked={formData.isSeekingCollaboration}
                    onChange={(e) => handleInputChange('isSeekingCollaboration', e.target.checked)}
                  />
                  <label htmlFor="seekingCollaboration" className="form-label mb-0">
                    I am seeking collaboration opportunities
                  </label>
                </div>
              </div>

              {formData.isSeekingCollaboration && (
                <>
                  <div className="form-group">
                    <label className="form-label">Collaboration Needs</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add collaboration need and press Enter (e.g., Statistical analysis, Data collection)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayInputChange('collaborationNeeds', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="keywords-list mt-2 flex flex-wrap gap-2">
                      {formData.collaborationNeeds.map((need, index) => (
                        <span key={index} className="badge badge-success">
                          {need}
                          <button
                            type="button"
                            className="ml-1 text-sm"
                            onClick={() => removeArrayItem('collaborationNeeds', index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Partner Criteria</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.preferredPartnerCriteria}
                      onChange={(e) => handleInputChange('preferredPartnerCriteria', e.target.value)}
                      placeholder="Describe the type of collaborators you're looking for"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dataSharing"
                    checked={formData.dataAvailableForSharing}
                    onChange={(e) => handleInputChange('dataAvailableForSharing', e.target.checked)}
                  />
                  <label htmlFor="dataSharing" className="form-label mb-0">
                    Data available for sharing with collaborators
                  </label>
                </div>
                <div className="form-text">
                  Check this if you have datasets that could be shared with approved collaborators
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Previous Publications</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.previousPublications}
                  onChange={(e) => handleInputChange('previousPublications', e.target.value)}
                  placeholder="List relevant previous publications or state 'None'"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="form-step">
            <h3>File Uploads</h3>
            <div className="grid gap-4">
              <div className="form-group">
                <label className="form-label">Manuscript File *</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.rtf"
                  onChange={(e) => handleFileChange('manuscriptFile', e.target.files)}
                  required
                />
                <div className="form-text">
                  Accepted formats: PDF, DOC, DOCX, RTF (Max size: 10MB)
                </div>
                {formData.manuscriptFile && (
                  <div className="mt-2 text-sm text-success">
                    ✓ {formData.manuscriptFile.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Supplementary Files</label>
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
                  onChange={(e) => handleFileChange('supplementaryFiles', e.target.files)}
                />
                <div className="form-text">
                  Additional files like datasets, figures, appendices (Max 5 files, 50MB total)
                </div>
                {formData.supplementaryFiles.length > 0 && (
                  <div className="mt-2 text-sm">
                    {formData.supplementaryFiles.map((file, index) => (
                      <div key={index} className="text-success">✓ {file.name}</div>
                    ))}
                  </div>
                )}
              </div>

              {formData.ethicsApproval && (
                <div className="form-group">
                  <label className="form-label">Ethics Documentation</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('ethicsDocuments', e.target.files)}
                  />
                  <div className="form-text">
                    Upload ethics approval letters, consent forms, etc.
                  </div>
                  {formData.ethicsDocuments.length > 0 && (
                    <div className="mt-2 text-sm">
                      {formData.ethicsDocuments.map((file, index) => (
                        <div key={index} className="text-success">✓ {file.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Acknowledgments</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.acknowledgments}
                  onChange={(e) => handleInputChange('acknowledgments', e.target.value)}
                  placeholder="Acknowledge contributors, funding sources, etc."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="submit-paper-page">
        {/* Header */}
        <div className="page-header mb-6">
          <h1>Submit Research Paper</h1>
          <p className="text-lg text-gray-600">
            Share your research for peer review and collaboration opportunities
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator mb-6">
          <div className="flex justify-between items-center">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`step ${currentStep > index + 1 ? 'completed' : currentStep === index + 1 ? 'active' : ''}`}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-label">
                  {index === 0 && 'Basic Info'}
                  {index === 1 && 'Research Details'}
                  {index === 2 && 'Demographics'}
                  {index === 3 && 'Funding & Ethics'}
                  {index === 4 && 'Collaboration'}
                  {index === 5 && 'Files'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              {renderStep()}
            </div>
            
            <div className="card-footer">
              <div className="flex justify-between">
                <button
                  type="button"
                  className={`btn btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={nextStep}
                      disabled={isSubmitting}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={isSubmitting || !formData.title || !formData.abstract || !formData.manuscriptFile}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner mr-2" style={{ width: '16px', height: '16px' }}></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Paper'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Guidelines */}
        <div className="guidelines mt-6">
          <div className="card">
            <div className="card-header">
              <h3>Submission Guidelines</h3>
            </div>
            <div className="card-body">
              <ul className="space-y-2">
                <li>• All submissions must be original research or systematic reviews</li>
                <li>• Papers should focus on infectious diseases or public health topics</li>
                <li>• Ensure all ethical approvals are obtained before submission</li>
                <li>• Data sharing is encouraged but not mandatory</li>
                <li>• Peer review feedback will be provided within 2-4 weeks</li>
                <li>• Collaboration requests will be facilitated by platform moderators</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPaper;