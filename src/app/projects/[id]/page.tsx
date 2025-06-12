"use client"

import { useEffect, useState } from 'react';
import { getProjectById, ministries, states } from '@/lib/data'; // Assuming you have a getProjectById
import type { Project, Feedback as FeedbackType } from '@/types';
import { ImageGallery } from '@/components/projects/image-gallery';
import { FeedbackForm } from '@/components/projects/feedback-form';
import { FeedbackList } from '@/components/projects/feedback-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Briefcase, DollarSign, Info, Users, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined); // undefined for loading state

  // Function to refresh feedback for the project
  const refreshFeedback = () => {
    const updatedProject = getProjectById(params.id); // Re-fetch or update project data
    if (updatedProject) {
      setProject(updatedProject);
    }
  };
  
  useEffect(() => {
    const fetchedProject = getProjectById(params.id);
    setProject(fetchedProject);
  }, [params.id]);

  if (project === undefined) { // Loading state
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    notFound();
  }
  
  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Ongoing: 'secondary',
    Completed: 'default',
    Planned: 'outline',
    'On Hold': 'destructive',
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 space-y-10">
      {/* Header Section */}
      <section className="pb-6 border-b">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">{project.title}</h1>
        <p className="text-lg text-foreground/80 mb-4">{project.subtitle}</p>
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          <Badge variant={statusColors[project.status] || 'outline'} className="text-sm px-3 py-1">{project.status}</Badge>
          <span>|</span>
          <div className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" /> {project.ministry.name}</div>
          <span>|</span>
          <div className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> {project.state.name}</div>
          <span>|</span>
          <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-1.5" /> Updated: {new Date(project.lastUpdatedAt).toLocaleDateString()}</div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column / Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {project.images && project.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Project Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery images={project.images} projectName={project.title} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm sm:prose-base max-w-none text-foreground/90"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </CardContent>
          </Card>
          
           {project.tags && project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column / Sidebar */}
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><Info className="h-5 w-5 mr-2 text-primary" /> Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Start Date:</span> <strong>{new Date(project.startDate).toLocaleDateString()}</strong></div>
              {project.expectedEndDate && <div className="flex justify-between"><span>Expected End:</span> <strong>{new Date(project.expectedEndDate).toLocaleDateString()}</strong></div>}
              {project.actualEndDate && <div className="flex justify-between"><span>Actual End:</span> <strong>{new Date(project.actualEndDate).toLocaleDateString()}</strong></div>}
              {project.budget && <div className="flex justify-between"><span>Budget:</span> <strong>₦{project.budget.toLocaleString()}</strong></div>}
              {project.expenditure && <div className="flex justify-between"><span>Expenditure:</span> <strong>₦{project.expenditure.toLocaleString()}</strong></div>}
            </CardContent>
          </Card>

          {project.impactStats && project.impactStats.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" /> Impact Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.impactStats.map((stat, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {stat.icon ? <stat.icon className="h-5 w-5 mr-3 text-primary/80" /> : <ThumbsUp className="h-5 w-5 mr-3 text-primary/80" />}
                    <span className="flex-1">{stat.label}:</span>
                    <strong className="text-primary">{stat.value}</strong>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      {/* Feedback Section */}
      <section className="space-y-8">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-foreground flex items-center">
          <MessageSquare className="h-7 w-7 mr-3 text-primary" /> Community Feedback
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-headline text-xl font-semibold mb-4">Share Your Thoughts</h3>
            <FeedbackForm projectId={project.id} onFeedbackSubmitted={refreshFeedback} />
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold mb-4">Recent Feedback</h3>
             <FeedbackList feedbackItems={project.feedback || []} />
          </div>
        </div>
      </section>
       <div className="mt-12 text-center">
          <Button variant="outline" asChild className="button-hover">
            <Link href="/projects">Back to All Projects</Link>
          </Button>
        </div>
    </div>
  );
}
