import CloseIcon from "@/components/ui/CloseIcon"
import JsonIcon from "@/components/ui/JsonIcon"
import PdfIcon from "@/components/ui/PdfIcon"
import { useState } from 'react'

const AttachmentPopup = ({ setIsAttachmentPopupOpen }: { setIsAttachmentPopupOpen: (open: boolean) => void }) => {
    const [isUploading, setIsUploading] = useState(false)

    const handleFileSelect = async (type: 'pdf' | 'json') => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = type === 'pdf' ? '.pdf' : '.json'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                setIsUploading(true)
                try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', type)

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })

                    if (!response.ok) {
                        throw new Error('Upload failed')
                    }

                    setIsAttachmentPopupOpen(false)
                    
                } catch (error) {
                    console.error('Error uploading file:', error)
                    alert('Failed to upload file. Please try again.')
                } finally {
                    setIsUploading(false)
                }
            }
        }
        input.click()
    }

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 transition-opacity"
                onClick={() => !isUploading && setIsAttachmentPopupOpen(false)}
            />
            
            {/* Popup Content */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:max-w-md lg:max-w-lg min-w-[350px] max-w-[90vw] bg-white rounded-xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Upload File</h2>
                    <button 
                        onClick={() => !isUploading && setIsAttachmentPopupOpen(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading}
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex gap-14 p-8 justify-center">
                    <div 
                        onClick={() => !isUploading && handleFileSelect('pdf')}
                        className={`border-3 border-red-400 rounded-lg p-10 text-center flex flex-col items-center gap-2 cursor-pointer bg-red-300 hover:bg-red-400 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <PdfIcon />
                        <span className="text-red-700 font-medium">PDF</span>
                    </div>
                    <div 
                        onClick={() => !isUploading && handleFileSelect('json')}
                        className={`border-3 border-yellow-300 rounded-lg p-10 text-center flex flex-col items-center gap-2 cursor-pointer bg-yellow-200 hover:bg-yellow-300 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <JsonIcon />
                        <span className="text-yellow-700 font-medium">JSON</span>
                    </div>
                </div>
                {isUploading && (
                    <div className="text-center text-gray-500">
                        Uploading file...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AttachmentPopup