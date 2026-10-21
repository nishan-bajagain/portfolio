import { z } from "zod"

const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().max(80),
  category: z.enum(["frontend", "backend", "other"]),
}).strict()

const projectSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(3000),
  image: z.string().trim().max(2048),
  date: z.string().trim().max(50),
  status: z.enum(["completed", "in-progress", "future"]),
  technologies: z.array(z.string().trim().max(80)).max(30),
  liveUrl: z.string().url().max(2048).optional().or(z.literal("")),
  githubUrl: z.string().url().max(2048).optional().or(z.literal("")),
}).strict()

export const portfolioSchema = z.object({
  updatedAt: z.string().datetime().optional(),
  personal: z.object({
    name: z.string().trim().min(1).max(120),
    roles: z.array(z.string().trim().min(1).max(100)).max(20),
    bio: z.string().trim().max(5000),
    whoIAm: z.string().trim().max(5000).optional(),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(50),
    location: z.string().trim().max(150),
    cvUrl: z.string().trim().max(2048),
    avatar: z.string().trim().max(2048),
    social: z.object({
      github: z.string().trim().max(2048),
      linkedin: z.string().trim().max(2048),
      facebook: z.string().trim().max(2048),
      twitter: z.string().trim().max(2048),
    }).strict(),
  }).strict(),
  stats: z.object({
    yearsExperience: z.number().int().min(0).max(100),
    projectsCompleted: z.number().int().min(0).max(100_000),
    technologiesUsed: z.number().int().min(0).max(100_000),
  }).strict(),
  skills: z.array(skillSchema).max(200),
  experience: z.array(z.object({
    id: z.string().trim().min(1).max(100),
    company: z.string().trim().max(150),
    role: z.string().trim().max(150),
    duration: z.string().trim().max(100),
    description: z.string().trim().max(3000),
  }).strict()).max(100),
  education: z.array(z.object({
    id: z.string().trim().min(1).max(100),
    institution: z.string().trim().max(200),
    degree: z.string().trim().max(200),
    year: z.string().trim().max(50),
  }).strict()).max(100),
  projects: z.array(projectSchema).max(200),
}).strict()

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(200).optional(),
}).strict()
