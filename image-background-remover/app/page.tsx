'use client'

import { useState, useRef, useCallback } from 'react'

type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function Home() {
  const [status, setStatus] = useState<Status>('idle')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('仅支持 JPG、PNG、WebP 格式')
      setStatus('error')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('文件大小不能超过 10MB')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg(null)

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setOriginalImage(base64)
    }
    reader.readAsDataURL(file)

    setStatus('processing')

    try {
      // Call Cloudflare Worker API
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || '/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || '处理失败，请重试')
      }

      const data = await res.json()
      setResultImage(data.image)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '处理失败，请重试')
      setStatus('error')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setOriginalImage(null)
    setResultImage(null)
    setErrorMsg(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const downloadImage = useCallback(() => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = 'removed-background.png'
    link.click()
  }, [resultImage])

  // ===== Render States =====

  if (status === 'done' && resultImage) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl w-full">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">处理完成 ✓</h1>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">原图</p>
              <div className="border rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalImage!} alt="Original" className="w-full object-contain max-h-80" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">透明背景</p>
              <div className="border rounded-xl overflow-hidden bg-gray-100 bg-checkerboard">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultImage!} alt="Result" className="w-full object-contain max-h-80" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={downloadImage}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              下载 PNG
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              继续处理
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Background Remover</h1>
        <p className="text-gray-500 mb-8">一键去除图片背景，下载透明PNG</p>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-xl p-16 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 font-medium">点击上传 或 拖拽图片到这里</p>
              <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG、WebP，最大 10MB</p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="mt-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">
                {status === 'uploading' ? '上传中...' : 'AI 抠图中...'}
              </span>
            </div>
            {status === 'processing' && originalImage && (
              <div className="mt-4 bg-gray-100 rounded-lg p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalImage!} alt="Uploading" className="h-32 object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && errorMsg && (
          <div className="mt-8 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              重新上传
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Powered by Remove.bg · Cloudflare Workers
      </p>
    </main>
  )
}