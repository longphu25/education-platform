'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Star, CheckCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCourse, useEnrollment, useCreditBalance, useCourseExists } from '@/hooks/useAcademicChain';
import { mockCourses } from '@/lib/mockData';
import { useWalletUi } from '@wallet-ui/react';
import { getStudentProfile } from '@/lib/academic-chain-client';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'gill';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { connected, account } = useWalletUi();
  const courseId = params.courseId as string;

  // Fetch blockchain data
  const { data: onChainCourse, isLoading: courseLoading } = useCourse(courseId);
  const { data: courseExists, isLoading: checkingExists } = useCourseExists(courseId);
  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollment(courseId);
  
  // Try to get balance from token account first (preferred method)
  const { data: tokenBalance = 0 } = useCreditBalance();
  
  // Also fetch from student profile as fallback
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-balance', account?.address],
    queryFn: () => getStudentProfile(account!.address as Address),
    enabled: connected && !!account,
  });
  
  // Calculate balance from profile if available
  const profileBalance = studentProfile 
    ? Number(studentProfile.data.totalCreditsPurchased - studentProfile.data.totalCreditsSpent)
    : null;
  
  // Use token balance if available, otherwise use profile balance, otherwise 0
  const creditBalance = tokenBalance || profileBalance || 0;
  
  console.log('💳 Course Detail Page - Credit Balance:', {
    tokenBalance,
    profileBalance,
    finalBalance: creditBalance,
    hasProfile: !!studentProfile,
    walletAddress: account?.address?.slice(0, 8) + '...',
  });

  // Get mock course for UI details (can be replaced with API call)
  const mockCourse = mockCourses.find(c => c.id === courseId);

  const isLoading = courseLoading || enrollmentLoading;
  const isEnrolled = !!enrollment;
  const requiredCredits = onChainCourse?.requiredCredits 
    ? Number(onChainCourse.requiredCredits) 
    : mockCourse?.requiredCredits || 0;
  const canAfford = creditBalance >= requiredCredits;

  // Wallet not connected
  if (!connected) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Wallet Not Connected</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view course details
            </p>
            <Button onClick={() => router.push('/dashboard/courses')}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading course details...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Course not found
  if (!mockCourse) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Course not found</h3>
            <Button onClick={() => router.push('/dashboard/courses')}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const course = mockCourse;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <div className="flex gap-4 items-start">
          <div className="w-48 h-32 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="h-16 w-16 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              {isEnrolled && (
                <Badge variant="secondary" className="text-sm">
                  ✓ Enrolled
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {course.description}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Badge variant={course.difficulty === 'beginner' ? 'secondary' : 'default'}>
                {course.difficulty}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{course.enrolledCount.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">{requiredCredits} credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Course Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Not On-Chain Alert */}
          {!checkingExists && !courseExists && connected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Course not initialized on blockchain</p>
                  <p className="text-sm mt-1">
                    This course needs to be added to the blockchain before students can register.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="ml-4 shrink-0"
                >
                  <Link href={`/dashboard/courses/${courseId}/add`}>
                    Add to Blockchain
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enrollment Status */}
          {isEnrolled ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>You are enrolled in this course</span>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/courses/${courseId}/learn`}>
                    Start Learning →
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : !canAfford ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient credits. You need {requiredCredits - creditBalance} more credits to enroll.
              </AlertDescription>
            </Alert>
          ) : null}

          {/* What You'll Learn */}
          <Card>
            <CardHeader>
              <CardTitle>What You&apos;ll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                8 lessons • {course.duration}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Lesson {index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {index === 0 ? 'Introduction & Setup' : 
                         index === 7 ? 'Final Project' :
                         `Core Concepts Part ${index}`}
                      </p>
                    </div>
                    {isEnrolled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 30) + 10} min
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {course.prerequisites.map((prereq) => (
                    <Badge key={prereq} variant="outline">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Enroll Card */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="font-medium">{requiredCredits} Credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {creditBalance} Credits
                  </span>
                </div>
                {/* Debug info - remove after fixing */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div>Token: {tokenBalance}</div>
                    <div>Profile: {profileBalance ?? 'N/A'}</div>
                    <div>Final: {creditBalance}</div>
                  </div>
                )}
              </div>

              {isEnrolled ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/dashboard/courses/${courseId}/learn`}>
                    Continue Learning
                  </Link>
                </Button>
              ) : !courseExists ? (
                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="outline"
                  disabled
                >
                  Course Not On-Chain
                </Button>
              ) : canAfford ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/dashboard/courses/${courseId}/register`}>
                    Enroll Now
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href="/dashboard/credits/buy">
                    Buy Credits
                  </Link>
                </Button>
              )}

              {!isEnrolled && courseExists && (
                <p className="text-xs text-muted-foreground text-center">
                  Credits will be burned upon enrollment
                </p>
              )}
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Instructor</span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{course.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium capitalize">{course.difficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lessons</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">English</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
