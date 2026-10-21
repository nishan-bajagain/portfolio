import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { SkillsSection } from "@/components/skills-section"
import { ProjectsSection } from "@/components/projects-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { getPortfolio } from "@/lib/portfolio.server"
import { getSafeImageSource } from "@/lib/images.server"

export const revalidate = 3600

export default async function Home() {
  const data = await getPortfolio()
  const publicData = {
    ...data,
    personal: {
      ...data.personal,
      avatar: getSafeImageSource(data.personal.avatar, "/profile.png"),
    },
    projects: data.projects.map((project) => ({
      ...project,
      image: getSafeImageSource(project.image, "/project-placeholder.svg"),
    })),
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nishanbajagain.com.np"
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: publicData.personal.name,
      url: siteUrl,
      jobTitle: publicData.personal.roles[0],
      email: publicData.personal.email,
      address: { "@type": "PostalAddress", addressLocality: publicData.personal.location },
      sameAs: Object.values(publicData.personal.social).filter(Boolean),
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: publicData.personal.name, url: siteUrl },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      dateCreated: data.updatedAt,
      mainEntity: { "@type": "Person", name: publicData.personal.name, url: siteUrl },
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <HeroSection data={publicData} />
        <AboutSection data={publicData} />
        <SkillsSection data={publicData} />
        <ProjectsSection data={publicData} />
        <ContactSection data={publicData} />
      </main>
      <Footer data={publicData} />
    </>
  )
}
