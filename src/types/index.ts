export interface Student {
  id: string;
  publicKey: string;
  name: string;
  email: string;
  avatar?: string;
  creditBalance: number;
  totalCreditsSpent: number;
  coursesCompleted: number;
  joinedDate: string;
  graduationStatus: 'not_started' | 'in_progress' | 'completed';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  requiredCredits: number;
  duration: string; // "4 weeks"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  thumbnail: string;
  enrolledCount: number;
  rating: number;
  isActive: boolean;
  prerequisites?: string[];
  learningOutcomes: string[];
  createdAt: string;
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  progress: number; // 0-100
  grade?: number; // 0-100
  creditsPaid: number;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  type: 'course' | 'graduation';
  studentId: string;
  courseId?: string;
  title: string;
  issueDate: string;
  grade?: number;
  mintAddress: string;
  metadataUri: string;
  isVerified: boolean;
  issuer: string;
  blockchain: 'solana';
  transactionHash: string;
}

export interface Transaction {
  id: string;
  type: 'credit_purchase' | 'course_registration' | 'certificate_mint';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  timestamp: string;
  fromAddress?: string;
  toAddress?: string;
  gasFee: number;
  details: Record<string, unknown>;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalCourses: number;
  certificatesIssued: number;
  totalCreditsInCirculation: number;
  monthlyActiveUsers: number;
  averageGrade: number;
  completionRate: number;
  revenueThisMonth: number;
}
