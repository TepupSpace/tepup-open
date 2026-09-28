import { prisma } from './prisma';

export async function logScriptRun(
  name: string,
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL',
  message?: string
) {
  return prisma.scriptLog.create({
    data: { name, status, message },
  });
}

export async function hasScriptRun(name: string) {
  return prisma.scriptLog.findFirst({
    where: { name, status: 'SUCCESS' },
    orderBy: { ranAt: 'desc' },
  });
}

export async function getScriptHistory(name?: string) {
  return prisma.scriptLog.findMany({
    where: name ? { name } : undefined,
    orderBy: { ranAt: 'desc' },
  });
}
