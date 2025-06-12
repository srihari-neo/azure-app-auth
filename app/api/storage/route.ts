// app/api/upload/route.ts (for App Router with TypeScript)
export const dynamic = 'force-dynamic';

import { listFiles, uploadFile, UploadFileResult } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';


interface UploadRequestBody {
  containerName: string;
  fileName: string;
  fileBuffer: number[];
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadFileResult>> {
  try {
    const body: UploadRequestBody = await request.json();
    const { containerName, fileName, fileBuffer } = body;

    if (!containerName || !fileName || !fileBuffer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert the array back to Uint8Array
    const buffer = new Uint8Array(fileBuffer);

    // Upload to Azure
    const result = await uploadFile(containerName, fileName, buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    // You can get the container name from environment variables or make it dynamic
    const containerName = process.env.AZURE_CONTAINER_NAME || 'uploads';
    
    const result = await listFiles(containerName);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to list files' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: result.files || []
    });
  } catch (error) {
    console.error('Error in files API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}