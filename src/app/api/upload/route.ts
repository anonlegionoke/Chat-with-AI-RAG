import { NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string

        if (!file || !type) {
            return NextResponse.json(
                { error: 'File and type are required' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Get the data directory path
        const dataDir = join(process.cwd(), 'src', 'data')
        
        // Delete existing context.json if it exists
        try {
            await unlink(join(dataDir, 'context.json'))
        } catch (error) {
            console.log('No existing context.json to delete')
        }

        // Save the new file
        const fileName = type === 'json' ? 'context.json' : file.name
        const filePath = join(dataDir, fileName)
        await writeFile(filePath, buffer)

        return NextResponse.json(
            { message: 'File uploaded successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
} 