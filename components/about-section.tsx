import { LegacyIcon } from "@/components/legacy-icon"
import type { PortfolioData } from "@/lib/types"

export function AboutSection({ data }: { data: PortfolioData }) {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-32 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
              <LegacyIcon className="ri-user-line" />
              About Me
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground">
              Get To Know Me
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Left Column - Bio & Social */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground flex items-center gap-3">
                  <LegacyIcon className="ri-user-smile-line text-primary" />
                  Who I Am
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg lg:text-xl">
                  {data.personal.bio}
                </p>
                {data.personal.whoIAm && (
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg">
                    {data.personal.whoIAm}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground flex items-center gap-3">
                  <LegacyIcon className="ri-contacts-line text-primary" />
                  Contact Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <ContactItem icon="ri-mail-line" label="Email" value={data.personal.email} />
                  <ContactItem icon="ri-phone-line" label="Phone" value={data.personal.phone} />
                  <ContactItem icon="ri-map-pin-line" label="Location" value={data.personal.location} />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground flex items-center gap-3">
                  <LegacyIcon className="ri-share-line text-primary" />
                  Connect With Me
                </h3>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  <SocialLink href={data.personal.social.github} icon="ri-github-fill" label="GitHub" />
                  <SocialLink href={data.personal.social.linkedin} icon="ri-linkedin-fill" label="LinkedIn" />
                  <SocialLink href={data.personal.social.facebook} icon="ri-facebook-fill" label="Facebook" />
                  <SocialLink href={data.personal.social.twitter} icon="ri-twitter-x-fill" label="Twitter" />
                </div>
              </div>
            </div>

            {/* Right Column - Experience & Education */}
            <div className="space-y-6 sm:space-y-8">
              {/* Experience */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground flex items-center gap-3">
                  <LegacyIcon className="ri-briefcase-line text-primary" />
                  Experience
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {data.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 sm:p-5 lg:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base lg:text-lg">
                          {exp.role}
                        </h4>
                        <span className="text-xs sm:text-sm text-muted-foreground bg-secondary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-primary font-medium mb-2 text-sm sm:text-base">{exp.company}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground flex items-center gap-3">
                  <LegacyIcon className="ri-graduation-cap-line text-primary" />
                  Education
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {data.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 sm:p-5 lg:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base lg:text-lg">
                          {edu.degree}
                        </h4>
                        <span className="text-xs sm:text-sm text-muted-foreground bg-secondary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit">
                          {edu.year}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm lg:text-base">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 sm:p-3 lg:p-4 rounded-lg bg-card border border-border">
      <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <LegacyIcon className={`${icon} text-primary text-sm sm:text-base lg:text-lg`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs lg:text-sm text-muted-foreground">{label}</p>
        <p className="text-xs sm:text-sm lg:text-base font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 lg:px-5 py-2 lg:py-3 bg-card border border-border rounded-lg hover:border-primary hover:text-primary transition-all duration-300"
      aria-label={label}
    >
      <LegacyIcon className={`${icon} text-base sm:text-lg lg:text-xl`} />
      <span className="text-xs sm:text-sm lg:text-base font-medium">{label}</span>
    </a>
  )
}
