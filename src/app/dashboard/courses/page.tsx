'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Star, Users, Clock } from 'lucide-react';
import { mockCourses, mockEnrollments, mockStudent } from '@/lib/mockData';
import Link from 'next/link';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const enrolledCourseIds = mockEnrollments
    .filter(e => e.studentId === mockStudent.id)
    .map(e => e.courseId);

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty && course.isActive;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground">
          Explore Web3 and blockchain courses
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('all')}
          >
            All
          </Button>
          <Button
            variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('beginner')}
          >
            Beginner
          </Button>
          <Button
            variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('intermediate')}
          >
            Intermediate
          </Button>
          <Button
            variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('advanced')}
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            
            return (
              <Card key={course.id} className="overflow-hidden flex flex-col">
                <div className="aspect-video bg-linear-to-br from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white opacity-50" />
                  </div>
                  {isEnrolled && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      Enrolled
                    </Badge>
                  )}
                  <Badge className="absolute top-2 left-2" variant="outline">
                    {course.difficulty}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {course.enrolledCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">by {course.instructor}</span>
                      <Badge>{course.requiredCredits} Credits</Badge>
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                      {course.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <Button className="flex-1" asChild>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          Continue Course
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button className="flex-1" asChild>
                          <Link href={`/dashboard/courses/${course.id}/register`}>
                            Enroll Now
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/courses/${course.id}`}>
                            Details
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
