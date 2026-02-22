'use client'

import CloseIcon from "@/components/ui/CloseIcon"
import JsonIcon from "@/components/ui/JsonIcon"
import PdfIcon from "@/components/ui/PdfIcon"
import { useState } from 'react'

interface UploadedFileInfo {
    fileName: string
    fileType: 'pdf' | 'json'
}

interface AttachmentPopupProps {
    setIsAttachmentPopupOpen: (open: boolean) => void
    onFileUploaded: (fileInfo: UploadedFileInfo) => void
}

const AttachmentPopup = ({ setIsAttachmentPopupOpen, onFileUploaded }: AttachmentPopupProps) => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState<UploadedFileInfo | null>(null)
    const [pdfHover, setPdfHover] = useState(false)
    const [jsonHover, setJsonHover] = useState(false)

    const handleFileSelect = async (type: 'pdf' | 'json') => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = type === 'pdf' ? '.pdf' : '.json'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                setIsUploading(true)
                setUploadSuccess(null)
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

                    const data = await response.json()
                    const fileInfo: UploadedFileInfo = { fileName: data.fileName, fileType: data.fileType }
                    setUploadSuccess(fileInfo)
                    onFileUploaded(fileInfo)

                    // Auto-close after a short delay so user sees the success
                    setTimeout(() => {
                        setIsAttachmentPopupOpen(false)
                    }, 1800)

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
                onClick={() => !isUploading && !uploadSuccess && setIsAttachmentPopupOpen(false)}
            />

            {/* Popup Content */}
            <div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:max-w-md lg:max-w-lg min-w-[350px] max-w-[90vw] rounded-xl shadow-2xl p-6 transition-colors"
                style={{ backgroundColor: 'var(--chat-bg)', color: 'var(--text-primary)' }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Upload File</h2>
                    <button
                        onClick={() => !isUploading && setIsAttachmentPopupOpen(false)}
                        className="transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: 'var(--text-secondary)' }}
                        disabled={isUploading}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Success State */}
                {uploadSuccess ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--contextual-button-active, #3b82f6)' }}>
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Upload Successful!</p>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--message-bg)' }}>
                            {uploadSuccess.fileType === 'pdf' ? <PdfIcon /> : <JsonIcon />}
                            <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{uploadSuccess.fileName}</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>You can now ask questions about this document.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-14 p-8 justify-center">
                            <div
                                onClick={() => !isUploading && handleFileSelect('pdf')}
                                className={`border-3 rounded-lg p-10 text-center flex flex-col items-center gap-2 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{
                                    backgroundColor: pdfHover ? 'var(--pdf-border, #f87171)' : 'var(--pdf-bg, #fee2e2)',
                                    borderColor: 'var(--pdf-border, #f87171)',
                                }}
                                onMouseEnter={() => setPdfHover(true)}
                                onMouseLeave={() => setPdfHover(false)}
                            >
                                <PdfIcon />
                                <span className="font-medium" style={{ color: 'var(--pdf-text, #b91c1c)' }}>PDF</span>
                            </div>
                            <div
                                onClick={() => !isUploading && handleFileSelect('json')}
                                className={`border-3 rounded-lg p-10 text-center flex flex-col items-center gap-2 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{
                                    backgroundColor: jsonHover ? 'var(--json-border, #fde047)' : 'var(--json-bg, #fef9c3)',
                                    borderColor: 'var(--json-border, #fde047)',
                                }}
                                onMouseEnter={() => setJsonHover(true)}
                                onMouseLeave={() => setJsonHover(false)}
                            >
                                <JsonIcon />
                                <span className="font-medium" style={{ color: 'var(--json-text, #a16207)' }}>JSON</span>
                            </div>
                        </div>
                        {isUploading && (
                            <div className="flex items-center justify-center gap-2 py-2" style={{ color: 'var(--text-secondary)' }}>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Uploading file...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AttachmentPopup