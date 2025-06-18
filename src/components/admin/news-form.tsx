
"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addNewsArticle } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { newsArticleFormSchemaRaw } from "@/types";

// Construct the Zod schema using the imported raw parts
const newsSchema = z.object({
  title: newsArticleFormSchemaRaw.title(z),
  slug: newsArticleFormSchemaRaw.slug(z),
  summary: newsArticleFormSchemaRaw.summary(z),
  category: newsArticleFormSchemaRaw.category(z),
  publishedDate: newsArticleFormSchemaRaw.publishedDate(z),
  content: newsArticleFormSchemaRaw.content(z),
  imageUrl: newsArticleFormSchemaRaw.imageUrl(z).nullable(),
  dataAiHint: newsArticleFormSchemaRaw.dataAiHint(z).nullable(),
});


type NewsArticleFormData = z.infer<typeof newsSchema>;

interface NewsArticleFormProps {
  article?: NewsArticleFormData; // For editing
  onSuccess?: () => void;
}

export function NewsArticleForm({ article, onSuccess }: NewsArticleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewsArticleFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: article || {
      title: "",
      slug: "",
      summary: "",
      category: "",
      publishedDate: new Date(),
      content: "",
      imageUrl: "",
      dataAiHint: "",
    },
  });

  const onSubmit: SubmitHandler<NewsArticleFormData> = async (data) => {
    // Ensure optional fields are null if empty, or Prisma might complain
    const dataToSubmit = {
      ...data,
      imageUrl: data.imageUrl || null,
      dataAiHint: data.dataAiHint || null,
    };

    const result = await addNewsArticle(dataToSubmit);

    if (result.success) {
      toast({
        title: "News Article Added!",
        description: result.message,
      });
      reset(); 
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-news");
    } else {
      toast({
        title: "Error Adding News Article",
        description: result.message || "An unknown error occurred.",
        variant: "destructive",
      });
      console.error("Error details:", result.errorDetails);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} className="mt-1" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL-friendly identifier)</Label>
          <Input id="slug" {...register("slug")} className="mt-1" placeholder="e.g., new-policy-announced" />
          {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" {...register("summary")} rows={3} className="mt-1" />
        {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} className="mt-1" placeholder="e.g., Governance, Health" />
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <Label htmlFor="publishedDate">Published Date</Label>
          <Controller
            name="publishedDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.publishedDate && <p className="text-sm text-destructive mt-1">{errors.publishedDate.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="content">Full Content</Label>
        <Textarea id="content" {...register("content")} rows={10} className="mt-1" placeholder="Write the full news article here..." />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="imageUrl">Image URL (Optional)</Label>
          <Input id="imageUrl" {...register("imageUrl")} className="mt-1" placeholder="https://example.com/image.png" />
          {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
        </div>
         <div>
          <Label htmlFor="dataAiHint">Image AI Hint (Optional, max 2 words)</Label>
          <Input id="dataAiHint" {...register("dataAiHint")} className="mt-1" placeholder="e.g., government building" />
          {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting}>
        {isSubmitting ? "Adding Article..." : "Add News Article"}
      </Button>
    </form>
  );
}
