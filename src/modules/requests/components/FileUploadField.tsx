import { useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

export function FileUploadField({ files, onFilesChange }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const validFiles: File[] = []
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      if (file.size <= 10 * 1024 * 1024) { // 10MB
        validFiles.push(file)
      } else {
        alert(`El archivo ${file.name} supera el límite de 10MB`)
      }
    }
    onFilesChange([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Adjuntos de Respaldo (Fotos de insumos, actas o remisiones)
      </label>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-blue-600">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Haz clic para subir o arrastra archivos aquí
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              PNG, JPG, PDF hasta 10MB (Sin datos clínicos nominales)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between p-3 text-sm">
              <div className="flex items-center gap-2.5 truncate">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className="truncate font-medium text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-400">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
