'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, BookOpen, Trophy, TrendingUp } from 'lucide-react';
import { mockStudent, mockEnrollments, mockCertificates, mockCourses } from '@/lib/mockData';
import Link from 'next/link';

export default function DashboardPage() {
  const enrolledCourses = mockEnrollments.filter(e => e.studentId === mockStudent.id);
  const activeCourses = enrolledCourses.filter(e => e.status === 'in_progress' || e.status === 'enrolled');
  const completedCourses = enrolledCourses.filter(e => e.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {mockStudent.name}!</h1>
          <p className="text-muted-foreground">
            Continue your Web3 learning journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/courses">Browse Courses</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/credits/buy">Buy Credits</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudent.creditBalance}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last purchase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedCourses.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCertificates.length}</div>
            <p className="text-xs text-muted-foreground">
              All verified on-chain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudent.graduationStatus === 'completed' ? '100%' : '60%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Toward graduation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
            <CardDescription>Your current learning progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCourses.map((enrollment) => {
              const course = mockCourses.find(c => c.id === enrollment.courseId);
              return (
                <div key={enrollment.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{course?.title}</h4>
                    <Badge variant={enrollment.status === 'in_progress' ? 'default' : 'secondary'}>
                      {enrollment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{enrollment.progress}% complete</span>
                    <span>{course?.duration}</span>
                  </div>
                </div>
              );
            })}
            {activeCourses.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No active courses. <Link href="/dashboard/courses" className="text-primary">Browse courses</Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCertificates.slice(0, 3).map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{cert.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Grade: {cert.grade}% • {cert.issueDate}
                  </p>
                </div>
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/certificates">View All Certificates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/dashboard/credits/buy">
                <CreditCard className="h-6 w-6" />
                Buy Credits
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/dashboard/courses">
                <BookOpen className="h-6 w-6" />
                Browse Courses
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/dashboard/certificates">
                <Trophy className="h-6 w-6" />
                My Certificates
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
