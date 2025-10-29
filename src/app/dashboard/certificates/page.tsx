'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Search, Download, ExternalLink, Calendar, Award, GraduationCap } from 'lucide-react';
import { mockCertificates, mockEnrollments, mockCourses, mockStudent } from '@/lib/mockData';
import Link from 'next/link';

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const completedEnrollments = mockEnrollments.filter(
    e => e.studentId === mockStudent.id && e.status === 'completed'
  );

  const courseCertificates = mockCertificates.filter(cert => cert.type === 'course');

  const filteredCertificates = courseCertificates.filter(cert =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const graduationProgress = {
    completed: completedEnrollments.length,
    required: 5, // Mock requirement
    percentage: (completedEnrollments.length / 5) * 100
  };

  const isGraduationEligible = graduationProgress.completed >= graduationProgress.required;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            Your verified academic achievements on blockchain
          </p>
        </div>
        <Button variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Solana Scan
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="course" className="space-y-6">
        <TabsList>
          <TabsTrigger value="course" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Course Certificates ({courseCertificates.length})
          </TabsTrigger>
          <TabsTrigger value="graduation" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Graduation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="space-y-6">
          {filteredCertificates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn verified certificates
                </p>
                <Button asChild>
                  <Link href="/dashboard/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCertificates.map((certificate) => {
                const course = mockCourses.find(c => c.id === certificate.courseId);
                return (
                  <Card key={certificate.id} className="overflow-hidden">
                    <div className="aspect-video bg-linear-to-br from-blue-500 to-purple-600 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Award className="h-12 w-12 text-white" />
                      </div>
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        <Trophy className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{course?.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          Issued {certificate.issueDate}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Grade</span>
                        <Badge variant={certificate.grade! >= 80 ? 'default' : 'secondary'}>
                          {certificate.grade}%
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Blockchain</span>
                        <Badge variant="outline">Solana</Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/dashboard/certificates/${certificate.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Mint: {certificate.mintAddress.slice(0, 8)}...
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graduation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Graduation Status
              </CardTitle>
              <CardDescription>
                Complete all required courses to claim your graduation certificate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {graduationProgress.completed}/{graduationProgress.required} courses
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(graduationProgress.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(graduationProgress.percentage)}% complete
                </p>
              </div>

              {/* Completed Courses */}
              <div>
                <h4 className="font-medium mb-3">Completed Courses</h4>
                <div className="space-y-2">
                  {completedEnrollments.map((enrollment) => {
                    const course = mockCourses.find(c => c.id === enrollment.courseId);
                    return (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{course?.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Grade: {enrollment.grade}% • Completed {enrollment.completedAt}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          <Trophy className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Graduation Certificate */}
              {isGraduationEligible ? (
                <Card className="bg-linear-to-r from-amber-50 to-yellow-50 border-amber-200">
                  <CardContent className="text-center py-8">
                    <GraduationCap className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Congratulations! 🎉</h3>
                    <p className="text-muted-foreground mb-6">
                      You&apos;ve completed all required courses and are eligible for graduation!
                    </p>
                    <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                      Claim Graduation NFT
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Keep Learning!</h3>
                    <p className="text-muted-foreground mb-6">
                      Complete {graduationProgress.required - graduationProgress.completed} more courses to be eligible for graduation
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/courses">Browse Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
