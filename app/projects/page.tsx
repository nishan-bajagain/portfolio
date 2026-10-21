import { LegacyIcon } from "@/components/legacy-icon"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { ProjectsSection } from "@/components/projects-section"
import { Footer } from "@/components/footer"
import { getPortfolio } from "@/lib/portfolio.server"
import type { Metadata } from "next"
import { getSafeImageSource } from "@/lib/images.server"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Projects",
  description: "Selected software projects by Nishan Bajagain.",
  alternates: { canonical: "/projects" },
}

export default async function ProjectsPage() {
  const data = await getPortfolio()
  const publicData = {
    ...data,
    projects: data.projects.map((project) => ({
      ...project,
      image: getSafeImageSource(project.image, "/project-placeholder.svg"),
    })),
  }
  const works = publicData.projects.map((project) => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: project.liveUrl,
    dateCreated: project.date,
    creator: { "@type": "Person", name: data.personal.name },
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(works).replace(/</g, "\\u003c") }}
      />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar isHome={false} />
      <main id="main-content" className="min-h-screen">
        <h1 className="sr-only">Projects</h1>
        <div className="pt-24">
          <div className="container mx-auto px-4 mb-8">
            <Link href="/#projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <LegacyIcon className="ri-arrow-left-line text-lg" />
              Back
            </Link>
          </div>
          <ProjectsSection data={publicData} showAll />
        </div>
      </main>
      <Footer data={publicData} isHome={false} />
    </>
  )
}
