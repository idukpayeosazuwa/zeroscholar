import { Timestamp } from 'firebase/firestore';

export enum CourseCategory {
  STEM = "Science, Technology, Engineering, and Mathematics",
  Medicine = "Medicine and Health Sciences",
  Law = "Law",
  Arts = "Arts and Humanities",
  SocialScience = "Social Sciences",
  Education = "Education",
  Agriculture = "Agriculture"
}

export enum UniversityLevel {
  L100 = "100 Level",
  L200 = "200 Level",
  L300 = "300 Level",
  L400 = "400 Level",
  L500 = "500 Level",
}

export interface UserProfile {
  fullName: string;
  cgpa: number;
  level: UniversityLevel;
  courseCategory: CourseCategory;
  university: string;
  location: string;
}

export interface Scholarship {
  name: string;
  provider: string;
  description: string;
  eligibility: string[];
  rewardAmount: string;
  deadline: string;
  link: string;
  status?: string; // Optional property for initial grouping
  modeOfSelection?: string;
}

export type Tab = 'finder' | 'tests' | 'community';

export interface GraphDataSet {
  label: string;
  data: number[];
  backgroundColor?: string;
}

export interface GraphData {
  type: 'bar' | 'pie' | 'line';
  title?: string;
  labels: string[];
  datasets: GraphDataSet[];
  yAxisLabel?: string;
}

export interface TestQuestion {
  question: string;
  questionImage?: string; // For the main question image/sequence
  options: string[];
  optionImages?: string[]; // For image-based options
  correctAnswer: string;
  explanation?: string;
  preamble?: string;
  graphData?: GraphData;
}

export interface CommunityPost {
    id?: string; // Firestore will generate this
    author: string;
    authorId: string;
    avatar: string; // Kept for legacy emoji avatars
    tag: string;
    content: string;
    timestamp: Timestamp;
}

export interface Reply {
    id?: string;
    author: string;
    authorId: string;
    content: string;
    timestamp: Timestamp;
}

export interface TestResult {
  testName: string;
  score: number;
  totalQuestions: number;
  timestamp: Timestamp;
}

export interface Source {
  uri: string;
  title: string;
}