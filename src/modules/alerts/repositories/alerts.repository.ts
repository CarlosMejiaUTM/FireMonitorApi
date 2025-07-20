export abstract class AlertsRepository {
  abstract create(alertData: any): Promise<any>;

  abstract findAll(filters: {
    tipo?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }>;
}
