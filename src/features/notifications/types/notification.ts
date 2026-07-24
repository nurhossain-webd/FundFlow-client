export type NotificationType =
  | "campaign_submitted"
  | "campaign_approved"
  | "campaign_rejected"
  | "campaign_reported"
  | "campaign_suspended"
  | "campaign_deleted"
  | "contribution_received"
  | "contribution_approved"
  | "contribution_rejected"
  | "contribution_refunded"
  | "payment_completed"
  | "payment_failed"
  | "withdrawal_requested"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_completed"
  | "account_suspended"
  | "report_resolved"
  | "system";

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  toEmail: string;
  actionRoute: string | null;
  type: NotificationType;
  isRead: boolean;
  time: string;
}

export interface NotificationPage {
  notifications: DashboardNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
