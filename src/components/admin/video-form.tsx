
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addVideo, updateVideo } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { videoFormSchemaRaw, type Video, type VideoFormData } from "@/types";
import { useEffect } from "react";

const videoSchema = z.object({
  title: videoFormSchemaRaw.title(z),
  url: videoFormSchemaRaw.url(z),
  thumbnailUrl: videoFormSchemaRaw.thumbnailUrl(z),
  dataAiHint: videoFormSchemaRaw.dataAiHint(z),
  description: videoFormSchemaRaw.description(z),
});

interface VideoFormProps {
  initialData?: Video;
  videoId?: string;
  onSuccess?: () => void;
}

export function VideoForm({ initialData, videoId, onSuccess }: VideoFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!videoId;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData ? {
      ...initialData,
      thumbnailUrl: initialData.thumbnailUrl || "",
      dataAiHint: initialData.dataAiHint || "",
      description: initialData.description || "",
    } : {
      title: "",
      url: "",
      thumbnailUrl: "",
      dataAiHint: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        thumbnailUrl: initialData.thumbnailUrl || "",
        dataAiHint: initialData.dataAiHint || "",
        description: initialData.description || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<VideoFormData> = async (data) => {
    const dataToSubmit = {
      ...data,
      thumbnailUrl: data.thumbnailUrl || null,
      dataAiHint: data.dataAiHint || null,
      description: data.description || null,
    };

    let result;
    if (isEditMode && videoId) {
      result = await updateVideo(videoId, dataToSubmit);
    } else {
      result = await addVideo(dataToSubmit);
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Video Updated!" : "Video Added!",
        description: result.message,
      });
      if (!isEditMode) reset();
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-videos");
      router.refresh();
    } else {
      toast({
        title: isEditMode ? "Error Updating Video" : "Error Adding Video",
        description: result.message || "An unknown error occurred.",
        variant: "destructive",
      });
      console.error("Error details:", result.errorDetails);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Video Title</Label>
        <Input id="title" {...register("title")} className="mt-1" />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="url">Video Embed URL</Label>
        <Input id="url" {...register("url")} className="mt-1" placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID" />
        {errors.url && <p className="text-sm text-destructive mt-1">{errors.url.message}</p>}
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
        <Input id="thumbnailUrl" {...register("thumbnailUrl")} className="mt-1" placeholder="https://example.com/thumbnail.jpg" />
        {errors.thumbnailUrl && <p className="text-sm text-destructive mt-1">{errors.thumbnailUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="dataAiHint">Thumbnail AI Hint (Optional, max 2 words)</Label>
        <Input id="dataAiHint" {...register("dataAiHint")} className="mt-1" placeholder="e.g., government building" />
        {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register("description")} rows={3} className="mt-1" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Video" : "Add Video")}
      </Button>
    </form>
  );
}
