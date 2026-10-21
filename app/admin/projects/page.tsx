"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"
import type { Project } from "@/lib/data"

export default function ProjectsPage() {
  const { data, addProject, updateProject, deleteProject } = usePortfolio()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Project>({
    id: "",
    title: "",
    description: "",
    image: "",
    date: "",
    status: "completed",
    technologies: [],
    liveUrl: "",
    githubUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAddModal = () => {
    setEditIndex(null)
    setFormData({
      id: Date.now().toString(),
      title: "",
      description: "",
      image: "",
      date: new Date().getFullYear().toString(),
      status: "completed",
      technologies: [],
      liveUrl: "",
      githubUrl: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (index: number) => {
    setEditIndex(index)
    setFormData(data.projects[index])
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      if (editIndex !== null) {
        await updateProject(editIndex, formData)
      } else {
        await addProject(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(index)
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Projects Management</h1>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.projects.map((project, index) => (
                  <div key={project.id} className="border rounded-lg overflow-hidden bg-card">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={600}
                      height={300}
                      unoptimized
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(index)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <LegacyIcon className="ri-edit-line"></LegacyIcon>
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <LegacyIcon className="ri-delete-bin-line"></LegacyIcon>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{project.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === "completed" ? "bg-green-100 text-green-800" :
                          project.status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null ? 'Edit Project' : 'Add Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "completed" | "in-progress" | "future" })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="future">Future</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={formData.technologies.join(", ")}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Live URL</label>
                  <input
                    type="url"
                    value={formData.liveUrl || ""}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl || ""}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
