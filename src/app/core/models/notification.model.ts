export interface Notification {
    id: number;

    userName: string | null;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationPagination {
    pageSize: number;
    pageIndex: number;
    countOfSpec: number;
    totalPages: number;
    countOfAllItem: number;
    data: Notification[];
}