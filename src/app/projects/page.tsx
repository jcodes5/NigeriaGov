"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Project } from '@/types';
import { getAllProjects, ministries, states } from '@/lib/data';
import { ProjectCard } from '@/components/projects/project-card';
import { FilterControls } from '@/components/projects/filter-controls';
import { Pagination } from '@/components/common/pagination';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<object>({});


  useEffect(() => {
    // Simulate fetching projects
    const projectsData = getAllProjects();
    setAllProjects(projectsData);
    setFilteredProjects(projectsData);
  }, []);
  
  const applyFilters = (newFilters: { ministryId?: string; stateId?: string; date?: Date, status?: string }) => {
    setCurrentPage(1); // Reset to first page on filter change
    setActiveFilters(newFilters);

    let projectsToFilter = allProjects;

    if (newFilters.ministryId) {
      projectsToFilter = projectsToFilter.filter(p => p.ministry.id === newFilters.ministryId);
    }
    if (newFilters.stateId) {
      projectsToFilter = projectsToFilter.filter(p => p.state.id === newFilters.stateId);
    }
    if (newFilters.status) {
      projectsToFilter = projectsToFilter.filter(p => p.status === newFilters.status);
    }
    if (newFilters.date) {
      const selectedDate = newFilters.date.getTime();
      projectsToFilter = projectsToFilter.filter(p => {
        const startDate = new Date(p.startDate).getTime();
        const endDate = p.expectedEndDate ? new Date(p.expectedEndDate).getTime() : (p.actualEndDate ? new Date(p.actualEndDate).getTime() : Infinity);
        return selectedDate >= startDate && selectedDate <= endDate;
      });
    }
    
    setFilteredProjects(projectsToFilter);
  };
  
  const clearFilters = () => {
    setCurrentPage(1);
    setActiveFilters({});
    setSearchTerm('');
    setFilteredProjects(allProjects);
  }

  const projectsToDisplay = useMemo(() => {
    let projects = filteredProjects;
    if (searchTerm) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    return projects;
  }, [filteredProjects, searchTerm]);


  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return projectsToDisplay.slice(startIndex, endIndex);
  }, [projectsToDisplay, currentPage]);

  const totalPages = Math.ceil(projectsToDisplay.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-gradient-to-br from-primary/5 via-background to-background rounded-lg shadow-sm">
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">Government Projects</h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Explore ongoing and completed government initiatives across Nigeria. Filter by ministry, state, status, or date to find projects relevant to you.
        </p>
      </section>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects by keyword, ministry, state, tag..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset page on search
          }}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>
      
      <FilterControls 
        ministries={ministries} 
        states={states} 
        onFilterChange={applyFilters}
        onClearFilters={clearFilters}
      />

      {paginatedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}

      {totalPages > 1 && (
         <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
      )}
    </div>
  );
}
