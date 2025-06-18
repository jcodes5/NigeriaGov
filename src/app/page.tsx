
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Eye, Newspaper, Server, PlayCircle, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllNewsArticles, mockServices, getAllProjects, mockFeaturedVideos } from "@/lib/data";
import { NewsCard } from "@/components/news/news-card";
import { ServiceCard } from "@/components/services/service-card";
import { VideoCard } from "@/components/common/video-card";
import type { Project, NewsArticle } from "@/types";


const popularServices = mockServices.slice(0, 3); // Services still mock for now

export default async function Home() {
  const allProjects: Project[] = await getAllProjects();
  const featuredProjects = allProjects.slice(0, 3);

  const allNews: NewsArticle[] = await getAllNewsArticles();
  const latestNews = allNews.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary mb-6">
            See What Nigeria is Building
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
            Discover transparent insights into government projects and initiatives across all sectors. Track progress, understand impact, and engage with a new era of governance.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="button-hover shadow-md">
              <Link href="/projects">Explore Projects <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="button-hover shadow-md">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground">
            Transparency at Your Fingertips
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm card-hover">
              <Eye className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">Discover Projects</h3>
              <p className="text-foreground/80 text-sm">
                Easily find information on projects by ministry, state, or category.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm card-hover">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">Track Progress</h3>
              <p className="text-foreground/80 text-sm">
                Stay updated with real-time information on project statuses and milestones.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm card-hover">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-4"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18.1H3"/></svg>
              <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">Provide Feedback</h3>
              <p className="text-foreground/80 text-sm">
                Share your thoughts and contribute to the development process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-16 bg-muted/30 rounded-lg">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <Briefcase className="h-8 w-8 mr-3 text-primary" /> Featured Initiatives
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover shadow-md">
                  <CardHeader className="p-0">
                    <Image
                      src={project.images[0]?.url || 'https://placehold.co/600x400.png'}
                      alt={project.images[0]?.alt || project.title}
                      data-ai-hint={project.images[0]?.dataAiHint || "project image"}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-xl mb-2 text-primary">{project.title}</CardTitle>
                    <CardDescription className="text-sm text-foreground/70 mb-4">
                      Ministry: {project.ministry.name}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" asChild className="w-full button-hover">
                      <Link href={`/projects/${project.id}`}>View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="button-hover">
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Latest News Section */}
      {latestNews.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <Newspaper className="h-8 w-8 mr-3 text-primary" /> Latest News & Updates
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {latestNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="button-hover">
                <Link href="/news">View All News</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Services Section */}
      {popularServices.length > 0 && (
        <section className="py-16 bg-muted/30 rounded-lg">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <Server className="h-8 w-8 mr-3 text-primary" /> Popular Government Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {popularServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="button-hover">
                <Link href="/services">Explore All Services</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Videos Section */}
      {mockFeaturedVideos.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <PlayCircle className="h-8 w-8 mr-3 text-primary" /> Featured Videos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFeaturedVideos.map((video) => (
                <VideoCard key={video.id} video={video} embed={true} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
