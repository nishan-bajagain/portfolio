"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"
import type { Experience } from "@/lib/data"

export default function ExperiencePage() {
  const { data, addExperience, updateExperience, deleteExperience } = usePortfolio()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Experience>({
    id: "",
    company: "",
    role: "",
    duration: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAddModal = () => {
    setEditIndex(null)
    setFormData({
      id: Date.now().toString(),
      company: "",
      role: "",
      duration: "",
      description: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (index: number) => {
    setEditIndex(index)
    setFormData(data.experience[index])
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company.trim() || !formData.role.trim()) return

    setIsSubmitting(true)
    try {
      if (editIndex !== null) {
        await updateExperience(editIndex, formData)
      } else {
        await addExperience(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save experience:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      try {
        await deleteExperience(index)
      } catch (error) {
        console.error('Failed to delete experience:', error)
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
                <h1 className="text-3xl font-bold">Experience Management</h1>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Add Experience
                </button>
              </div>

              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="p-6 border rounded-lg bg-card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{exp.role}</h3>
                        <p className="text-lg text-primary">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">{exp.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(index)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <LegacyIcon className="ri-edit-line"></LegacyIcon>
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <LegacyIcon className="ri-delete-bin-line"></LegacyIcon>
                        </button>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{exp.description}</p>
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
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null ? 'Edit Experience' : 'Add Experience'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="2022 - Present"
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
