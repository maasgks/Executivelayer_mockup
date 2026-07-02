import { prisma } from '../db';

export function logActivity(params: {
  entityType: string;
  entityId: string;
  kind: 'log' | 'workflow';
  title?: string;
  description?: string;
  status?: string;
  userName?: string;
}) {
  return prisma.activityLog.create({ data: params });
}
