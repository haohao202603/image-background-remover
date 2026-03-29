import { NextRequest, NextResponse } from 'next/server'

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!REMOVE_BG_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API Key 未配置' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const image = formData.get('image')

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { success: false, error: '请上传图片' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { success: false, error: '仅支持 JPG、PNG、WebP 格式' },
        { status: 400 }
      )
    }

    // Validate file size (10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过 10MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for Remove.bg API
    const arrayBuffer = await image.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Call Remove.bg API
    const rbResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size: 'auto',
        format: 'png',
      }),
    })

    if (!rbResponse.ok) {
      const errorText = await rbResponse.text()
      console.error('Remove.bg API error:', errorText)
      return NextResponse.json(
        { success: false, error: '抠图服务出错，请重试' },
        { status: 500 }
      )
    }

    // Remove.bg returns PNG directly as binary
    const resultBuffer = await rbResponse.arrayBuffer()
    const resultBase64 = Buffer.from(resultBuffer).toString('base64')
    const dataUri = `data:image/png;base64,${resultBase64}`

    return NextResponse.json({ success: true, image: dataUri })
  } catch (err) {
    console.error('Remove-bg error:', err)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}