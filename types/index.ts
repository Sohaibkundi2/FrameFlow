export interface Video {
    id: string
    title: string
    description: string
    publicID: string
    originalSize: number
    compressedSize: number
    duration: number
    createdAt: Date
    updatedAt: Date
}