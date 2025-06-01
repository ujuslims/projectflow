
/**
 * @fileOverview Defines project type templates with default stages.
 */

export interface ProjectType {
  id: string;
  name: string;
}

export const projectTypes: ProjectType[] = [
  { id: 'none', name: 'None (Custom Stages)' },
  { id: 'topographic-survey', name: 'Topographic Survey' },
  { id: 'geotechnical-investigation', name: 'Geotechnical Investigation' },
  { id: 'construction-monitoring', name: 'Construction Site Monitoring' },
  { id: 'reality-scan', name: 'Reality Scan / As-Built' },
  { id: 'geospatial-analysis', name: 'Geospatial Analysis Project' },
  { id: 'site-characterization', name: 'Site Characterization' },
  { id: 'bathymetric-survey', name: 'Bathymetric Survey' },
];

export const projectStageTemplates: Record<string, string[]> = {
  'topographic-survey': [
    'Project Initiation & Planning',
    'Site Reconnaissance & Mobilization',
    'Field Data Acquisition (Survey)',
    'Data Processing & Quality Control',
    'Drafting & Plan Production',
    'Deliverables & Project Closeout',
  ],
  'geotechnical-investigation': [
    'Desktop Study & Proposal',
    'Site Mobilization & H&S',
    'Drilling, Sampling & In-situ Testing',
    'Laboratory Testing',
    'Data Analysis & Geotechnical Report',
    'Client Review & Finalization',
  ],
  'construction-monitoring': [
    'Baseline Survey & Setup',
    'Periodic Monitoring Cycles',
    'Data Processing & Comparison',
    'Reporting & Alerting',
    'Final Survey & Demobilization',
  ],
  'reality-scan': [
    'Scope Definition & Planning',
    'Site Access & Preparation',
    'Scanning & Data Capture',
    'Data Registration & Processing',
    'Modeling & Deliverable Creation',
    'Quality Assurance & Handover',
  ],
  'geospatial-analysis': [
    'Problem Definition & Data Sourcing',
    'Data Preprocessing & Cleaning',
    'Spatial Analysis & Modeling',
    'Visualization & Map Production',
    'Reporting & Dissemination',
  ],
  'site-characterization': [
    'Desktop Study & Planning',
    'Field Investigation (Geophysics, Sampling)',
    'Laboratory Testing & Analysis',
    'Data Interpretation & Modeling',
    'Reporting & Recommendations',
  ],
  'bathymetric-survey': [
    'Survey Planning & Mobilization',
    'Data Acquisition (Sonar, Lidar)',
    'Data Processing & Cleaning',
    'Chart Production & Analysis',
    'Deliverables & QC',
  ],
};

