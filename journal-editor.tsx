"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Clock, Heart, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function JournalEditor() {
  const [currentDate, setCurrentDate] = useState("")
  const [currentTime, setCurrentTime] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your thoughts...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[60vh] text-gray-900",
      },
    },
  })

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }

      setCurrentDate(now.toLocaleDateString("en-US", dateOptions))
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions))
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">{currentDate}</h1>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-8 py-4">
        <p className="text-gray-600 italic text-lg">How are you feeling today?</p>
      </div>

      {/* Editor */}
      <div className="flex-1 px-8 py-4">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-8 py-6 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Add to Favorites</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Tag className="w-4 h-4" />
            <span className="text-sm">Add Tag</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Auto-saved</span>
          <Button className="bg-black hover:bg-gray-800 text-white px-6">Save Entry</Button>
        </div>
      </div>
    </div>
  )
}
