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
  fullName?: string;
  email?: string;
  userID?: string;
  level: UniversityLevel;
  course?: string;
  gender?: 'Male' | 'Female';
  state?: string;
  university?: string;
  uni?: string;
  cgpa?: number;
  jamb?: number;
  lga?: string;
  rel?: string;
  orphan?: boolean;
  finance?: boolean;
  chal?: boolean;
  notifiedScholarships?: string[];
  pushSubscription?: string; // Storing the subscription object as a JSON string
  applications?: string[]; // Array of scholarship IDs that user has applied to
}

export interface Application {
  scholarshipId: string;
  scholarshipName: string;
  appliedAt: string; // ISO date string
  deadline: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  description:string;
  eligibility: string[];
  rewardAmount: string;
  deadline: string;
  link: string;
  status?: string; // Optional property for initial grouping
  modeOfSelection?: string;
}

export type Tab = 'finder' | 'applied' | 'tests' | 'community';

export interface GraphDataSet {
  label: string;
  data: number[];
  // Fix: Allow backgroundColor to be an array of strings for pie chart compatibility.
  backgroundColor?: string | string[];
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
    $id?: string; // Appwrite document ID
    author: string;
    authorId: string;
    avatar: string; // Kept for legacy emoji avatars
    tag: string;
    content: string;
    $createdAt: string; // Appwrite timestamp
}

export interface Reply {
    $id?: string; // Appwrite document ID
    author: string;
    authorId: string;
    content: string;
    $createdAt: string; // Appwrite timestamp
}

export interface TestResult {
  testName: string;
  score: number;
  totalQuestions: number;
  $createdAt: string; // Appwrite timestamp
  userId: string;
}

export interface Source {
  uri: string;
  title: string;
}