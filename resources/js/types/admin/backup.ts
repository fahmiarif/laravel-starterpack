export interface Backup {
    filename: string;
    path: string;
    size: number;
    date: string;
}

export interface BackupResponse {
    success: boolean;
    message: string;
    data: Backup[];
}
