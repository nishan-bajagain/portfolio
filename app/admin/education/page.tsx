"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"
import type { Education } from "@/lib/data"

export default function EducationPage() {
  const { data, addEducation, updateEducation, deleteEducation } = usePortfolio()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Education>({
    id: "",
    institution: "",
    degree: "",
    year: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAddModal = () => {
    setEditIndex(null)
    setFormData({
      id: Date.now().toString(),
      institution: "",
      degree: "",
      year: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (index: number) => {
    setEditIndex(index)
    setFormData(data.education[index])
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.institution.trim() || !formData.degree.trim()) return

    setIsSubmitting(true)
    try {
      if (editIndex !== null) {
        await updateEducation(editIndex, formData)
      } else {
        await addEducation(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save education:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (confirm('Are you sure you want to delete this education?')) {
      try {
        await deleteEducation(index)
      } catch (error) {
        console.error('Failed to delete education:', error)
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
                <h1 className="text-3xl font-bold">Education Management</h1>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Add Education
                </button>
              </div>

              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="p-6 border rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{edu.degree}</h3>
                        <p className="text-lg text-primary">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">{edu.year}</p>
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
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null ? 'Edit Education' : 'Add Education'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="2019"
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
