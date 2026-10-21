export interface Project {
  id: string
  title: string
  description: string
  image: string
  date: string
  status: "completed" | "in-progress" | "future"
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
}

export interface Skill {
  name: string
  icon: string
  category: "frontend" | "backend" | "other"
}

export interface Experience {
  id: string
  company: string
  role: string
  duration: string
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  year: string
}

export interface Message {
  id: string
  name: string
  email: string
  message: string
  date: string
  read: boolean
}

export interface PortfolioData {
  updatedAt?: string
  personal: {
    name: string
    roles: string[]
    bio: string
    whoIAm?: string
    email: string
    phone: string
    location: string
    cvUrl: string
    avatar: string
    social: {
      github: string
      linkedin: string
      facebook: string
      twitter: string
    }
  }
  stats: {
    yearsExperience: number
    projectsCompleted: number
    technologiesUsed: number
  }
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  projects: Project[]
}
