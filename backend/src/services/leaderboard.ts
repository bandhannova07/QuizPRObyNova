import { prisma } from './prisma'

function getPeriods(now = new Date()) {
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return {
    daily: `daily:${year}-${month}-${day}`,
    monthly: `monthly:${year}-${month}`,
    alltime: 'alltime',
  }
}

export async function updateLeaderboard(userId: string, deltaScore: number) {
  const periods = getPeriods()
  for (const period of Object.values(periods)) {
    await prisma.leaderboard.upsert({
      where: { user_id_period: { user_id: userId, period } },
      create: { user_id: userId, period, score: deltaScore },
      update: { score: { increment: deltaScore }, updated_at: new Date() },
    })
  }
}
