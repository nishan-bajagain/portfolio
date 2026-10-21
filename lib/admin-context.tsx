"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { getPortfolioData, getMessages, updatePortfolioData, updateMessage, type PortfolioData, type Message, type Skill, type Project, type Experience, type Education } from "./data"
import { usePathname } from "next/navigation"

interface AdminContextType {
  data: PortfolioData
  messages: Message[]
  updateData: (newData: PortfolioData) => Promise<void>
  markMessageRead: (id: string, read: boolean) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  refreshData: () => Promise<void>
  refreshMessages: () => Promise<void>
  loading: boolean
  // Skills methods
  addSkill: (skill: Skill) => Promise<void>
  updateSkill: (index: number, skill: Skill) => Promise<void>
  deleteSkill: (index: number) => Promise<void>
  // Projects methods
  addProject: (project: Project) => Promise<void>
  updateProject: (index: number, project: Project) => Promise<void>
  deleteProject: (index: number) => Promise<void>
  // Experience methods
  addExperience: (experience: Experience) => Promise<void>
  updateExperience: (index: number, experience: Experience) => Promise<void>
  deleteExperience: (index: number) => Promise<void>
  // Education methods
  addEducation: (education: Education) => Promise<void>
  updateEducation: (index: number, education: Education) => Promise<void>
  deleteEducation: (index: number) => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>({
    personal: {
      name: "",
      roles: [],
      bio: "",
      email: "",
      phone: "",
      location: "",
      cvUrl: "",
      avatar: "",
      social: { github: "", linkedin: "", facebook: "", twitter: "" }
    },
    stats: { yearsExperience: 0, projectsCompleted: 0, technologiesUsed: 0 },
    skills: [],
    experience: [],
    education: [],
    projects: []
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const hasLoadedData = useRef(false)

  const refreshData = useCallback(async () => {
    try {
      const [portfolioData, messagesData] = await Promise.all([getPortfolioData(), getMessages()])
      setData(portfolioData)
      setMessages(messagesData)
    } catch (error) {
      console.error('Failed to refresh admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (pathname === "/admin/login" || hasLoadedData.current) return
    hasLoadedData.current = true
    void refreshData()
  }, [pathname, refreshData])

  const refreshMessages = useCallback(async () => {
    try {
      const messagesData = await getMessages()
      setMessages(messagesData)
    } catch (error) {
      console.error("Failed to refresh messages:", error)
    }
  }, [])

  const updateData = useCallback(async (newData: PortfolioData) => {
    try {
      await updatePortfolioData(newData)
      setData(newData)
    } catch (error) {
      console.error('Failed to update data:', error)
      throw error
    }
  }, [])

  const setMessageRead = useCallback(async (id: string, read: boolean) => {
    try {
      await updateMessage(id, read)
      setMessages((current) => current.map((message) => message.id === id ? { ...message, read } : message))
    } catch (error) {
      console.error('Failed to update message:', error)
      throw error
    }
  }, [])

  const removeMessage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      setMessages((current) => current.filter((message) => message.id !== id))
    } catch (error) {
      console.error("Failed to delete message:", error)
      throw error
    }
  }, [])

  // Skills methods
  const addSkill = useCallback(async (skill: Skill) => {
    const newData = { ...data, skills: [...data.skills, skill] }
    await updateData(newData)
  }, [data, updateData])

  const updateSkill = useCallback(async (index: number, skill: Skill) => {
    const newSkills = [...data.skills]
    newSkills[index] = skill
    const newData = { ...data, skills: newSkills }
    await updateData(newData)
  }, [data, updateData])

  const deleteSkill = useCallback(async (index: number) => {
    const newSkills = data.skills.filter((_, i) => i !== index)
    const newData = { ...data, skills: newSkills }
    await updateData(newData)
  }, [data, updateData])

  // Projects methods
  const addProject = useCallback(async (project: Project) => {
    const newData = { ...data, projects: [...data.projects, project] }
    await updateData(newData)
  }, [data, updateData])

  const updateProject = useCallback(async (index: number, project: Project) => {
    const newProjects = [...data.projects]
    newProjects[index] = project
    const newData = { ...data, projects: newProjects }
    await updateData(newData)
  }, [data, updateData])

  const deleteProject = useCallback(async (index: number) => {
    const newProjects = data.projects.filter((_, i) => i !== index)
    const newData = { ...data, projects: newProjects }
    await updateData(newData)
  }, [data, updateData])

  // Experience methods
  const addExperience = useCallback(async (experience: Experience) => {
    const newData = { ...data, experience: [...data.experience, experience] }
    await updateData(newData)
  }, [data, updateData])

  const updateExperience = useCallback(async (index: number, experience: Experience) => {
    const newExperience = [...data.experience]
    newExperience[index] = experience
    const newData = { ...data, experience: newExperience }
    await updateData(newData)
  }, [data, updateData])

  const deleteExperience = useCallback(async (index: number) => {
    const newExperience = data.experience.filter((_, i) => i !== index)
    const newData = { ...data, experience: newExperience }
    await updateData(newData)
  }, [data, updateData])

  // Education methods
  const addEducation = useCallback(async (education: Education) => {
    const newData = { ...data, education: [...data.education, education] }
    await updateData(newData)
  }, [data, updateData])

  const updateEducation = useCallback(async (index: number, education: Education) => {
    const newEducation = [...data.education]
    newEducation[index] = education
    const newData = { ...data, education: newEducation }
    await updateData(newData)
  }, [data, updateData])

  const deleteEducation = useCallback(async (index: number) => {
    const newEducation = data.education.filter((_, i) => i !== index)
    const newData = { ...data, education: newEducation }
    await updateData(newData)
  }, [data, updateData])

  return (
    <AdminContext.Provider value={{ 
      data, 
      messages, 
      updateData, 
      markMessageRead: setMessageRead,
      deleteMessage: removeMessage,
      refreshData,
      refreshMessages,
      loading,
      addSkill,
      updateSkill,
      deleteSkill,
      addProject,
      updateProject,
      deleteProject,
      addExperience,
      updateExperience,
      deleteExperience,
      addEducation,
      updateEducation,
      deleteEducation
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("usePortfolio must be used within an AdminProvider")
  }
  return context
}
