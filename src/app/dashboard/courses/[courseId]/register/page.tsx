'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, Clock, CreditCard, Users, Star, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCourseRegistrationPage } from '@/hooks/useAcademicChain';
import { mockCourses } from '@/lib/mockData';
import { useWalletUi } from '@wallet-ui/react';
import { getStudentProfile } from '@/lib/academic-chain-client';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'gill';

export default function CourseRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { account } = useWalletUi();
  
  // Use blockchain data
  const {
    wallet,
    course: onChainCourse,
    creditBalance: tokenBalance,
    isLoading,
    isEnrolled,
    isProcessing,
    registerCourse,
  } = useCourseRegistrationPage(courseId);

  // Also fetch from student profile as fallback
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-balance-register', account?.address],
    queryFn: () => getStudentProfile(account!.address as Address),
    enabled: !!account,
  });
  
  // Calculate balance from profile if available
  const profileBalance = studentProfile 
    ? Number(studentProfile.data.totalCreditsPurchased - studentProfile.data.totalCreditsSpent)
    : null;
  
  // Use token balance if available, otherwise use profile balance, otherwise 0
  const creditBalance = tokenBalance || profileBalance || 0;

  // Fallback to mock data for UI display (since course details may be stored off-chain)
  const mockCourse = mockCourses.find(c => c.id === courseId);
  
  // Use on-chain data if available, otherwise use mock
  const course = mockCourse; // In production, you'd fetch full course details from your API
  const requiredCredits = onChainCourse?.requiredCredits 
    ? Number(onChainCourse.requiredCredits) 
    : course?.requiredCredits || 0;

  // Recalculate canAfford with the correct balance
  const canAfford = creditBalance >= requiredCredits;
  const canRegister = !isEnrolled && canAfford && !!course;

  // Log for debugging
  console.log('📊 Registration Page State:', {
    courseId,
    wallet: !!wallet,
    walletAddress: wallet?.publicKey?.toString(),
    tokenBalance,
    profileBalance,
    creditBalance,
    requiredCredits,
    canAfford,
    canRegister,
    isEnrolled,
    isLoading,
  });

  // Handle course registration
  const handleRegister = async () => {
    if (!canRegister || !wallet) return;
    
    try {
      await registerCourse(courseId);
      
      // Redirect to course page on success
      router.push(`/dashboard/courses/${courseId}`);
    } catch (error) {
      // Error is already handled by the hook with toast
      console.error('Registration error:', error);
    }
  };

  // Wallet not connected
  if (!wallet) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Wallet Not Connected</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to register for courses
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
      <div className="max-w-4xl mx-auto space-y-6">
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
  if (!course) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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

  const balanceAfterRegistration = creditBalance - requiredCredits;



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Registration</h1>
        <p className="text-muted-foreground">
          Review course details and complete enrollment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <div className="w-32 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {course.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant={course.difficulty === 'beginner' ? 'secondary' : 'default'}>
                      {course.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {course.enrolledCount.toLocaleString()} students
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Category: {course.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Cost: {course.requiredCredits} Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Instructor: {course.instructor}</span>
                </div>
              </div>

              <div className="border-t my-4"></div>

              <div>
                <h4 className="font-medium mb-2">Learning Outcomes</h4>
                <ul className="space-y-1">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Prerequisites</h4>
                  <div className="flex gap-2 flex-wrap">
                    {course.prerequisites.map((prereq) => (
                      <Badge key={prereq} variant="outline">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex gap-2 flex-wrap">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Credits Required</span>
                  <span className="font-medium">{requiredCredits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Your Balance</span>
                  <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {creditBalance}
                  </span>
                </div>
                <div className="border-t my-2"></div>
                <div className="flex justify-between">
                  <span>After Registration</span>
                  <span className="font-medium">
                    {balanceAfterRegistration}
                  </span>
                </div>
              </div>

              {/* Debug info - development only */}
              {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs font-mono mb-1">
                    <span className="text-muted-foreground">Token Balance:</span> {tokenBalance}
                  </p>
                  <p className="text-xs font-mono mb-1">
                    <span className="text-muted-foreground">Profile Balance:</span> {profileBalance ?? 'N/A'}
                  </p>
                  <p className="text-xs font-mono">
                    <span className="text-muted-foreground">Final Balance:</span> {creditBalance}
                  </p>
                </div>
              )}

              {/* Alerts */}
              {isEnrolled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are already enrolled in this course.
                  </AlertDescription>
                </Alert>
              )}

              {!canAfford && !isEnrolled && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient credits. You need {requiredCredits - creditBalance} more credits.
                  </AlertDescription>
                </Alert>
              )}

              {canAfford && !isEnrolled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ready to register! Credits will be burned upon enrollment.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {isEnrolled ? (
                  <Button className="w-full" onClick={() => router.push(`/dashboard/courses/${courseId}`)}>
                    Go to Course
                  </Button>
                ) : !canAfford ? (
                  <Button className="w-full" onClick={() => router.push('/dashboard/credits/buy')}>
                    Buy More Credits
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleRegister}
                    disabled={isProcessing || !canRegister}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      `Register for ${requiredCredits} Credits`
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Back to Course
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Registration is final. Credits will be burned and cannot be refunded.
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>✓ Credits are burned from your balance</p>
              <p>✓ Enrollment record created on-chain</p>
              <p>✓ Access to course materials unlocked</p>
              <p>✓ Progress tracking begins</p>
              <p>✓ Certificate available upon completion</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
