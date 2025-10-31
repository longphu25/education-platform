'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, BookOpen, User, CreditCard } from 'lucide-react';
import { useCreateCourse, useCourseExists } from '@/hooks/useAcademicChain';
import { mockCourses } from '@/lib/mockData';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { useWalletUi } from '@wallet-ui/react';

export default function AddCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const { account } = useWalletUi();

  // Find course in mock data
  const course = mockCourses.find(c => c.id === courseId);
  const normalizedRequiredCredits =
    typeof course?.requiredCredits === 'object' && course?.requiredCredits !== null && 'toString' in course.requiredCredits
      ? Number((course.requiredCredits as { toString: () => string }).toString())
      : course?.requiredCredits ?? 0;

  const displayCourse = course
    ? {
        id: String(course.id),
        title: String(course.title),
        description: String(course.description ?? ''),
        difficulty:
          typeof course.difficulty === 'object' && course.difficulty !== null && 'toString' in course.difficulty
            ? (course.difficulty as { toString: () => string }).toString()
            : String(course.difficulty ?? ''),
        requiredCredits: normalizedRequiredCredits,
        learningOutcomes: Array.isArray(course.learningOutcomes)
          ? course.learningOutcomes.map((outcome) =>
              typeof outcome === 'object' && outcome !== null && 'toString' in outcome
                ? (outcome as { toString: () => string }).toString()
                : String(outcome ?? '')
            )
          : [],
      }
    : null;

  // State
  const [instructor, setInstructor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { data: courseExists, isLoading: checkingExists } = useCourseExists(courseId);

  // Don't pre-fill instructor from mock data - it's a name, not a wallet address
  // Users should click "Use My Wallet" or manually enter a valid address

  // Debug: Log account information
  useEffect(() => {
    if (account) {
      console.log('👛 Connected account:', {
        address: account.address,
        hasAddress: !!account.address,
        addressType: typeof account.address,
        addressLength: account.address?.length,
      });
    }
  }, [account]);

  if (!displayCourse) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-4">
              Course ID &quot;{courseId}&quot; does not exist in the course catalog.
            </p>
            <Button onClick={() => router.push('/dashboard/courses')}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/courses/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <Card>
          <CardContent className="text-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">Wallet Required</h3>
            <p className="text-muted-foreground">
              Connect a wallet with program authority access to add this course to the blockchain.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { createCourse, isProcessing } = useCreateCourse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!instructor.trim()) {
      toast.error('Instructor wallet address is required');
      return;
    }

    // Validate Solana address format
    try {
      new PublicKey(instructor.trim());
    } catch (err) {
      console.error('Invalid address:', instructor, err);
      toast.error(`Invalid Solana wallet address. Please enter a valid base58 address. Got: "${instructor.substring(0, 20)}..."`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createCourse({
        courseId: displayCourse.id,
        courseName: displayCourse.title,
        instructor: instructor.trim(),
        requiredCredits: displayCourse.requiredCredits,
      });
      
      toast.success('Course created successfully!');
      router.push(`/dashboard/courses/${displayCourse.id}?courseAdded=true`);
      router.refresh();
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (checkingExists) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Checking course status...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Course already exists
  if (courseExists) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/courses/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Course Already Exists</h3>
            <p className="text-muted-foreground mb-4">
              This course has already been created on the blockchain.
            </p>
            <Button onClick={() => router.push(`/dashboard/courses/${courseId}`)}>
              View Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/courses/${courseId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Add Course to Blockchain</h1>
        <p className="text-muted-foreground">
          Initialize this course on-chain to allow student registrations
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This course exists in the catalog but hasn&apos;t been created on the blockchain yet.
          Only program authorities can add courses.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <div className="w-32 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{displayCourse.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {displayCourse.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant={displayCourse.difficulty === 'beginner' ? 'secondary' : 'default'}>
                      {displayCourse.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Required Credits: {String(displayCourse.requiredCredits)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Course ID: {displayCourse.id}</span>
                </div>
              </div>

              <div className="border-t my-4"></div>

              <div>
                <h4 className="font-medium mb-2">Learning Outcomes</h4>
                <ul className="space-y-1">
                  {displayCourse.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add to Blockchain Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Initialize Course</CardTitle>
              <CardDescription>
                Add this course to the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course ID</Label>
                  <Input
                    id="courseId"
                    value={displayCourse.id}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    value={displayCourse.title}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredCredits">Required Credits</Label>
                  <Input
                    id="requiredCredits"
                    type="number"
                    value={String(displayCourse.requiredCredits)}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor Wallet Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="instructor"
                      placeholder="Enter Solana wallet address"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                      required
                      className="flex-1"
                    />
                    {account?.address && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInstructor(account.address)}
                      >
                        Use My Wallet
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The wallet address of the course instructor. You can use your connected wallet.
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    You must be the program authority to create courses.
                    This transaction will fail if you&apos;re not authorized.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isProcessing || !instructor.trim()}
                >
                  {isSubmitting || isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Course...
                    </>
                  ) : (
                    'Add to Blockchain'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
