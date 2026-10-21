import { LegacyIcon } from "@/components/legacy-icon"
import type { PortfolioData, Project } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProjectImage } from "@/components/project-image"

export function ProjectsSection({ data, showAll = false }: { data: PortfolioData; showAll?: boolean }) {

  const projects = showAll ? data.projects : data.projects.slice(0, 6)

  return (
    <section id="projects" className="py-12 sm:py-16 md:py-20 lg:py-32 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
              <LegacyIcon className="ri-folder-line" />
              My Projects
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4">
              Featured Work
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm sm:text-base lg:text-lg">
              A selection of projects that showcase my skills and passion for creating impactful digital solutions.
            </p>
          </div>

          {/* Projects Grid - Better responsive columns */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          {/* View All Button */}
          {!showAll && (
            <div className="text-center mt-10 sm:mt-12 lg:mt-16">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all duration-300 group text-sm sm:text-base lg:text-lg"
              >
                <LegacyIcon className="ri-folder-open-line" />
                View All Projects
                <LegacyIcon className="ri-arrow-right-line transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const statusColors = {
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    "in-progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    future: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  }

  const statusLabels = {
    completed: "Completed",
    "in-progress": "In Progress",
    future: "Future Plan",
  }

  return (
    <div
      className="group rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <ProjectImage
          src={project.image || "/project-placeholder.svg"}
          alt={project.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Overlay Actions */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="project_live"
              data-track-id={project.id}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <LegacyIcon className="ri-external-link-line" />
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="project_code"
              data-track-id={project.id}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <LegacyIcon className="ri-github-fill" />
              Code
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          <span
            className={cn(
              "shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border",
              statusColors[project.status],
            )}
          >
            {statusLabels[project.status]}
          </span>
        </div>

        <p className="text-muted-foreground text-sm lg:text-base line-clamp-2">{project.description}</p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {project.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 bg-secondary text-muted-foreground rounded text-xs">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{project.date}</span>
        </div>
      </div>
    </div>
  )
}
