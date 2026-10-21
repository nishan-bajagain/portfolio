"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { useState, useTransition } from "react"
import type { PortfolioData, Skill } from "@/lib/types"
import { cn } from "@/lib/utils"

type Category = "all" | "frontend" | "backend" | "other"

export function SkillsSection({ data }: { data: PortfolioData }) {
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [, startTransition] = useTransition()

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "ri-apps-line" },
    { value: "frontend", label: "Frontend", icon: "ri-layout-line" },
    { value: "backend", label: "Backend", icon: "ri-server-line" },
    { value: "other", label: "Others", icon: "ri-tools-line" },
  ]

  const filteredSkills =
    activeCategory === "all"
      ? data.skills
      : data.skills.filter((skill) => skill.category === activeCategory)

  return (
    <section id="skills" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-secondary/30 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
              <LegacyIcon className="ri-code-s-slash-line" />
              My Skills
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4">
              Technologies I Work With
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm sm:text-base lg:text-lg px-4">
              A comprehensive toolkit of modern technologies and frameworks that I use to build exceptional digital
              experiences.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-12 px-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => startTransition(() => setActiveCategory(category.value))}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-medium transition-all duration-300",
                  activeCategory === category.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
                )}
              >
                <LegacyIcon className={`${category.icon} text-sm sm:text-base lg:text-lg`} />
                {category.label}
              </button>
            ))}
          </div>

          {/* Skills Grid - Larger cards on bigger screens */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 lg:gap-5">
            {filteredSkills.map((skill, index) => (
              <SkillCard key={skill.name} skill={skill} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <div
      className="skill-card group p-3 sm:p-5 lg:p-6 rounded-xl bg-card border border-border hover:border-primary/50 text-center cursor-default"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
        <LegacyIcon className={`${skill.icon} text-lg sm:text-2xl lg:text-3xl text-primary`} />
      </div>
      <h4 className="font-medium text-foreground text-xs sm:text-sm lg:text-base group-hover:text-primary transition-colors leading-tight">
        {skill.name}
      </h4>
    </div>
  )
}
