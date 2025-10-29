import { Student, Course, CourseEnrollment, Certificate, Transaction, DashboardMetrics } from '@/types';

export const mockStudent: Student = {
  id: '1',
  publicKey: 'AcademicChainStudentXXXXXXXXXXXXXXXXXXXXXX',
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@example.com',
  avatar: '/avatars/student1.jpg',
  creditBalance: 25,
  totalCreditsSpent: 35,
  coursesCompleted: 3,
  joinedDate: '2025-09-15',
  graduationStatus: 'in_progress',
};

export const mockCourses: Course[] = [
  {
    id: 'SOL101',
    title: 'Solana Blockchain Fundamentals',
    description: 'Learn the basics of Solana blockchain, accounts, transactions, and programs.',
    instructor: 'Dr. Sarah Chen',
    instructorAvatar: '/avatars/instructor1.jpg',
    requiredCredits: 5,
    duration: '4 weeks',
    difficulty: 'beginner',
    category: 'Blockchain',
    tags: ['Solana', 'Blockchain', 'Crypto'],
    thumbnail: '/course-thumbnails/solana-101.jpg',
    enrolledCount: 1247,
    rating: 4.8,
    isActive: true,
    prerequisites: [],
    learningOutcomes: [
      'Understand Solana architecture',
      'Create and manage Solana accounts',
      'Build basic Solana programs',
      'Deploy programs to devnet'
    ],
    createdAt: '2025-08-01',
  },
  {
    id: 'SOL102',
    title: 'Advanced Solana Development',
    description: 'Deep dive into Anchor framework, PDAs, and complex program interactions.',
    instructor: 'Prof. Michael Rodriguez',
    instructorAvatar: '/avatars/instructor2.jpg',
    requiredCredits: 8,
    duration: '6 weeks',
    difficulty: 'advanced',
    category: 'Development',
    tags: ['Solana', 'Anchor', 'Rust', 'DApps'],
    thumbnail: '/course-thumbnails/solana-102.jpg',
    enrolledCount: 823,
    rating: 4.9,
    isActive: true,
    prerequisites: ['SOL101'],
    learningOutcomes: [
      'Master Anchor framework',
      'Implement PDAs and CPIs',
      'Build full-stack DApps',
      'Security best practices'
    ],
    createdAt: '2025-08-15',
  },
  {
    id: 'WEB301',
    title: 'Web3 Frontend Development',
    description: 'Build modern Web3 frontends with React, Next.js, and Solana wallet integration.',
    instructor: 'Emily Johnson',
    instructorAvatar: '/avatars/instructor3.jpg',
    requiredCredits: 6,
    duration: '5 weeks',
    difficulty: 'intermediate',
    category: 'Frontend',
    tags: ['React', 'Next.js', 'Web3', 'TypeScript'],
    thumbnail: '/course-thumbnails/web3-frontend.jpg',
    enrolledCount: 1156,
    rating: 4.7,
    isActive: true,
    prerequisites: ['SOL101'],
    learningOutcomes: [
      'React + Web3 integration',
      'Wallet adapter usage',
      'Transaction handling',
      'UI/UX best practices'
    ],
    createdAt: '2025-09-01',
  },
  {
    id: 'RUST201',
    title: 'Rust Programming for Blockchain',
    description: 'Master Rust programming language specifically for blockchain development.',
    instructor: 'Dr. Alex Kumar',
    requiredCredits: 7,
    duration: '8 weeks',
    difficulty: 'intermediate',
    category: 'Programming',
    tags: ['Rust', 'Programming', 'Systems'],
    thumbnail: '/course-thumbnails/rust-blockchain.jpg',
    enrolledCount: 945,
    rating: 4.6,
    isActive: true,
    createdAt: '2025-08-20',
    prerequisites: [],
    learningOutcomes: [
      'Master Rust fundamentals',
      'Understand ownership and borrowing',
      'Write safe concurrent code',
      'Build blockchain applications'
    ],
  }
];

export const mockEnrollments: CourseEnrollment[] = [
  {
    id: 'enroll_1',
    studentId: '1',
    courseId: 'SOL101',
    enrolledAt: '2025-09-20',
    completedAt: '2025-10-15',
    status: 'completed',
    progress: 100,
    grade: 85,
    creditsPaid: 5,
    certificateId: 'cert_1',
  },
  {
    id: 'enroll_2',
    studentId: '1',
    courseId: 'WEB301',
    enrolledAt: '2025-10-01',
    completedAt: '2025-10-25',
    status: 'completed',
    progress: 100,
    grade: 92,
    creditsPaid: 6,
    certificateId: 'cert_2',
  },
  {
    id: 'enroll_3',
    studentId: '1',
    courseId: 'SOL102',
    enrolledAt: '2025-10-20',
    status: 'in_progress',
    progress: 65,
    creditsPaid: 8,
  },
  {
    id: 'enroll_4',
    studentId: '1',
    courseId: 'RUST201',
    enrolledAt: '2025-10-25',
    status: 'enrolled',
    progress: 15,
    creditsPaid: 7,
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert_1',
    type: 'course',
    studentId: '1',
    courseId: 'SOL101',
    title: 'Solana Blockchain Fundamentals - Certificate',
    issueDate: '2025-10-15',
    grade: 85,
    mintAddress: 'CertSOL101XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    metadataUri: 'https://ipfs.io/ipfs/QmCertSOL101...',
    isVerified: true,
    issuer: 'AcademicChain University',
    blockchain: 'solana',
    transactionHash: 'TxHashSOL101XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  },
  {
    id: 'cert_2',
    type: 'course',
    studentId: '1',
    courseId: 'WEB301',
    title: 'Web3 Frontend Development - Certificate',
    issueDate: '2025-10-25',
    grade: 92,
    mintAddress: 'CertWEB301XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    metadataUri: 'https://ipfs.io/ipfs/QmCertWEB301...',
    isVerified: true,
    issuer: 'AcademicChain University',
    blockchain: 'solana',
    transactionHash: 'TxHashWEB301XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    type: 'credit_purchase',
    amount: 30,
    status: 'confirmed',
    hash: 'TxPurchase30XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    timestamp: '2025-09-15T10:30:00Z',
    fromAddress: 'StudentWalletXXXXXXXXXXXXXXXXXXXXXXXXXX',
    toAddress: 'TreasuryWalletXXXXXXXXXXXXXXXXXXXXXXXXX',
    gasFee: 0.00001,
    details: {
      solCost: 0.15,
      creditsReceived: 30,
      pricePerCredit: 0.005
    }
  },
  {
    id: 'tx_2',
    type: 'course_registration',
    amount: 5,
    status: 'confirmed',
    hash: 'TxRegisterSOL101XXXXXXXXXXXXXXXXXXXXXXXXXXX',
    timestamp: '2025-09-20T14:20:00Z',
    gasFee: 0.000005,
    details: {
      courseId: 'SOL101',
      courseName: 'Solana Blockchain Fundamentals',
      creditsBurned: 5
    }
  },
  {
    id: 'tx_3',
    type: 'certificate_mint',
    amount: 1,
    status: 'confirmed',
    hash: 'TxCertSOL101XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    timestamp: '2025-10-15T16:45:00Z',
    gasFee: 0.000008,
    details: {
      courseId: 'SOL101',
      courseName: 'Solana Blockchain Fundamentals',
      grade: 85,
      certificateId: 'cert_1'
    }
  }
];

// Dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalStudents: 2847,
  totalCourses: 24,
  certificatesIssued: 1653,
  totalCreditsInCirculation: 45670,
  monthlyActiveUsers: 1245,
  averageGrade: 83.7,
  completionRate: 78.5,
  revenueThisMonth: 234.67 // SOL
};
