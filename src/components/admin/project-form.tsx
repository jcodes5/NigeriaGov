
"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addProject } from "@/lib/actions";
import { ministries, states } from "@/lib/data"; // Using mock ministries/states for now
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { projectFormSchemaRaw } from "@/types"; // Import the raw schema parts

// Construct the Zod schema using the imported raw parts
const projectSchema = z.object({
  title: projectFormSchemaRaw.title(z),
  subtitle: projectFormSchemaRaw.subtitle(z),
  ministryId: projectFormSchemaRaw.ministryId(z),
  stateId: projectFormSchemaRaw.stateId(z),
  status: projectFormSchemaRaw.status(z),
  startDate: projectFormSchemaRaw.startDate(z),
  expectedEndDate: projectFormSchemaRaw.expectedEndDate(z),
  description: projectFormSchemaRaw.description(z),
  budget: projectFormSchemaRaw.budget(z),
  expenditure: projectFormSchemaRaw.expenditure(z),
  tags: projectFormSchemaRaw.tags(z),
});


type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: ProjectFormData; // For editing, not used in this "add" iteration
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      title: "",
      subtitle: "",
      ministryId: "",
      stateId: "",
      status: "Planned",
      startDate: undefined, // Let date picker handle initial undefined state
      expectedEndDate: undefined,
      description: "",
      budget: undefined,
      expenditure: undefined,
      tags: "",
    },
  });

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    const result = await addProject({
      ...data,
      // Convert tags string to array if necessary, or handle in server action
      tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    });

    if (result.success) {
      toast({
        title: "Project Added!",
        description: result.message,
      });
      reset(); // Reset form
      if (onSuccess) onSuccess();
      router.push("/dashboard/admin/manage-projects"); // Navigate back to list
    } else {
      toast({
        title: "Error Adding Project",
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
          <Label htmlFor="title">Project Title</Label>
          <Input id="title" {...register("title")} className="mt-1" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="subtitle">Project Subtitle / Tagline</Label>
          <Input id="subtitle" {...register("subtitle")} className="mt-1" />
          {errors.subtitle && <p className="text-sm text-destructive mt-1">{errors.subtitle.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="ministryId">Responsible Ministry</Label>
          <Controller
            name="ministryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Ministry" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.ministryId && <p className="text-sm text-destructive mt-1">{errors.ministryId.message}</p>}
        </div>
        <div>
          <Label htmlFor="stateId">State / Location</Label>
           <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.stateId && <p className="text-sm text-destructive mt-1">{errors.stateId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="status">Project Status</Label>
           <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {['Planned', 'Ongoing', 'Completed', 'On Hold'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
           <Controller
            name="startDate"
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
          {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="expectedEndDate">Expected End Date (Optional)</Label>
          <Controller
            name="expectedEndDate"
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
                  <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.expectedEndDate && <p className="text-sm text-destructive mt-1">{errors.expectedEndDate.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Project Description</Label>
        <Textarea id="description" {...register("description")} rows={5} className="mt-1" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="budget">Budget (NGN, Optional)</Label>
          <Input id="budget" type="number" {...register("budget")} className="mt-1" placeholder="e.g., 1000000" />
          {errors.budget && <p className="text-sm text-destructive mt-1">{errors.budget.message}</p>}
        </div>
        <div>
          <Label htmlFor="expenditure">Expenditure (NGN, Optional)</Label>
          <Input id="expenditure" type="number" {...register("expenditure")} className="mt-1" placeholder="e.g., 500000" />
          {errors.expenditure && <p className="text-sm text-destructive mt-1">{errors.expenditure.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="tags">Tags (Comma-separated, Optional)</Label>
        <Input id="tags" {...register("tags")} className="mt-1" placeholder="e.g., infrastructure, education, health" />
        {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>}
      </div>

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting}>
        {isSubmitting ? "Adding Project..." : "Add Project"}
      </Button>
    </form>
  );
}
