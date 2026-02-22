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

        if (type === 'json' && !file.name.endsWith('.json')) {
            return NextResponse.json(
                { error: 'Invalid file type. Expected JSON file.' },
                { status: 400 }
            )
        }
        if (type === 'pdf' && !file.name.endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Invalid file type. Expected PDF file.' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Get the data directory path
        const dataDir = join(process.cwd(), 'src', 'data')

        const filesToDelete = ['context.json', 'context.pdf']
        for (const fileName of filesToDelete) {
            try {
                await unlink(join(dataDir, fileName))
            } catch (error) {
                console.log(`No existing ${fileName} to delete`)
            }
        }

        // Save the new file
        const newFileName = type === 'json' ? 'context.json' : 'context.pdf'
        const filePath = join(dataDir, newFileName)
        await writeFile(filePath, buffer)

        return NextResponse.json(
            { message: 'File uploaded successfully', fileName: file.name, fileType: type },
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