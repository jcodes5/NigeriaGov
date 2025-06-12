import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data for featured projects, replace with actual data fetching
const featuredProjects = [
  { id: "1", title: "Lagos-Ibadan Expressway Rehabilitation", ministry: "Works & Housing", image: "https://placehold.co/600x400.png", dataAiHint:"road construction" },
  { id: "2", title: "National Social Investment Program", ministry: "Humanitarian Affairs", image: "https://placehold.co/600x400.png", dataAiHint:"community people" },
  { id: "3", title: "Digital Nigeria Initiative", ministry: "Communications & Digital Economy", image: "https://placehold.co/600x400.png", dataAiHint:"technology computer" },
];

export default function Home() {
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
      <section className="py-16 bg-muted/30 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground">
            Featured Initiatives
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden card-hover shadow-md">
                <CardHeader className="p-0">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint={project.dataAiHint}
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-xl mb-2 text-primary">{project.title}</CardTitle>
                  <CardDescription className="text-sm text-foreground/70 mb-4">
                    Ministry: {project.ministry}
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
    </div>
  );
}
