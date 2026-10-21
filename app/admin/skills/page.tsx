"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"
import type { Skill } from "@/lib/data"
import { cn } from "@/lib/utils"
import { skillIconOptions } from "@/components/legacy-icon"

export default function SkillsPage() {
  const { data, addSkill, updateSkill, deleteSkill } = usePortfolio()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Skill>({
    name: "",
    icon: "ri-code-line",
    category: "frontend",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAddModal = () => {
    setEditIndex(null)
    setFormData({ name: "", icon: "ri-code-line", category: "frontend" })
    setIsModalOpen(true)
  }

  const openEditModal = (index: number) => {
    setEditIndex(index)
    setFormData(data.skills[index])
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      if (editIndex !== null) {
        await updateSkill(editIndex, formData)
      } else {
        await addSkill(formData)
      }
      setIsModalOpen(false)
      setFormData({ name: "", icon: "ri-code-line", category: "frontend" })
    } catch (error) {
      console.error('Failed to save skill:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteSkill(index)
      } catch (error) {
        console.error('Failed to delete skill:', error)
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
                <h1 className="text-3xl font-bold">Skills Management</h1>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Add Skill
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.skills.map((skill, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LegacyIcon className={`${skill.icon} text-xl text-primary`}></LegacyIcon>
                        <h3 className="font-semibold">{skill.name}</h3>
                      </div>
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
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      skill.category === "frontend" && "bg-blue-100 text-blue-800",
                      skill.category === "backend" && "bg-green-100 text-green-800",
                      skill.category === "other" && "bg-purple-100 text-purple-800"
                    )}>
                      {skill.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null ? 'Edit Skill' : 'Add Skill'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full p-2 border rounded-lg capitalize"
                >
                  {skillIconOptions.map((option) => (
                    <option key={option.value} value={option.value} className="capitalize">{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as "frontend" | "backend" | "other" })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="other">Other</option>
                </select>
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
