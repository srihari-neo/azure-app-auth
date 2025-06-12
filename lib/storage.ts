// lib/azure-storage.ts
import { BlobServiceClient } from '@azure/storage-blob';

// Initialize the Azure Storage client
const azureStorageClient = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING; 
  if (!connectionString) {
    throw new Error('Azure Storage connection string is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in your environment variables.');
  }

  // Validate the connection string format
  if (!connectionString.includes('DefaultEndpointsProtocol=')) {
    throw new Error('Invalid connection string format. Missing DefaultEndpointsProtocol. Please check your Azure Storage connection string.');
  }

  // Check if the protocol is valid
  const protocolMatch = connectionString.match(/DefaultEndpointsProtocol=(https?)/i);
  if (!protocolMatch) {
    throw new Error('Invalid DefaultEndpointsProtocol in connection string. Must be "https" or "http".');
  }

  console.log('Initializing Azure Storage with protocol:', protocolMatch[1]);
  
  try {
    return BlobServiceClient.fromConnectionString(connectionString);
  } catch (error) {
    console.error('Failed to initialize Azure Storage client:', error);
    throw new Error('Failed to initialize Azure Storage client. Please verify your connection string.');
  }
};

let blobServiceClient: BlobServiceClient;

// Initialize client with error handling
try {
  blobServiceClient = azureStorageClient();
} catch (error) {
  console.error('Azure Storage initialization error:', error);
  // Don't throw here, let individual functions handle the error
}

// Helper functions
export interface UploadFileResult {
    success: boolean;
    url?: string;
    requestId?: string;
    error?: string;
}

export const uploadFile = async (
  containerName: string,
  fileName: string,
  fileBuffer: Buffer | Uint8Array
): Promise<UploadFileResult> => {
  try {
    const client = azureStorageClient();
    const containerClient = client.getContainerClient(containerName);

    // Create container if it doesn't exist, with default private access
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const uploadResponse = await blockBlobClient.upload(fileBuffer, fileBuffer.length);

    return {
      success: true,
      url: blockBlobClient.url, // Note: URL requires SAS token or authentication for access
      requestId: uploadResponse.requestId
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const downloadFile = async (containerName: string, fileName: string) => {
  try {
    if (!blobServiceClient) {
      return {
        success: false,
        error: 'Azure Storage client not initialized. Please check your connection string.'
      };
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    const downloadResponse = await blockBlobClient.download();
    return {
      success: true,
      data: downloadResponse
    };
  } catch (error) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export interface DeleteFileResult {
    success: boolean;
    requestId?: string;
    error?: string;
}

export const deleteFile = async (
    containerName: string,
    fileName: string
): Promise<DeleteFileResult> => {
    try {
        if (!blobServiceClient) {
            return {
                success: false,
                error: 'Azure Storage client not initialized. Please check your connection string.'
            };
        }

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        
        const deleteResponse = await blockBlobClient.delete();
        return {
            success: true,
            requestId: deleteResponse.requestId
        };
    } catch (error) {
        console.error('Delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

export interface ListFileItem {
    name: string;
    url: string;
    size?: number;
    lastModified?: Date;
}

export interface ListFilesResult {
    success: boolean;
    files?: ListFileItem[];
    error?: string;
}

export const listFiles = async (containerName: string): Promise<ListFilesResult> => {
    try {
        if (!blobServiceClient) {
            return {
                success: false,
                error: 'Azure Storage client not initialized. Please check your connection string.'
            };
        }

        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        const files: ListFileItem[] = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            files.push({
                name: blob.name,
                url: `${containerClient.url}/${blob.name}`,
                size: blob.properties.contentLength,
                lastModified: blob.properties.lastModified
            });
        }
        
        return {
            success: true,
            files
        };
    } catch (error) {
        console.error('List files error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

// Export the client getter function for direct use if needed
export const getAzureStorageClient = () => {
    if (!blobServiceClient) {
        throw new Error('Azure Storage client not initialized. Please check your connection string.');
    }
    return blobServiceClient;
};

export default azureStorageClient;
