
import fs from 'fs';
import path from 'path';

export class FileService {
    private static uploadDir = path.join(process.cwd(), 'server', 'uploads');

    /**
     * Ensure upload directory exists
     */
    static async ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Get absolute path for a file
     */
    static getFilePath(filename: string): string {
        return path.join(this.uploadDir, filename);
    }

    /**
     * Delete file from storage
     */
    static async deleteFile(filename: string): Promise<boolean> {
        try {
            const filepath = this.getFilePath(filename);
            if (fs.existsSync(filepath)) {
                await fs.promises.unlink(filepath);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to delete file ${filename}:`, error);
            return false;
        }
    }
}
