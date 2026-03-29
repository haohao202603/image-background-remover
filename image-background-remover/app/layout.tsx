import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Image Background Remover',
  description: '一键去除图片背景，下载透明PNG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}