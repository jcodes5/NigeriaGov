
import { getNewsArticleBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { CalendarDays, Tag, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = getNewsArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Button variant="outline" asChild className="mb-4 button-hover">
        <Link href="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Back to News</Link>
      </Button>
      <Card className="overflow-hidden shadow-lg">
        {article.imageUrl && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={article.imageUrl}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={article.dataAiHint || "news article"}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary">{article.title}</CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Published: {format(new Date(article.publishedDate), 'PPP')}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1.5" />
              Category: <Badge variant="secondary" className="ml-1">{article.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm sm:prose-base max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Generate static paths if you have a fixed set of news articles
// export async function generateStaticParams() {
//   const news = getAllNewsArticles();
//   return news.map((article) => ({
//     slug: article.slug,
//   }));
// }
