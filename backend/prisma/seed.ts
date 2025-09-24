import { PrismaClient, Role, Category, Difficulty } from '@prisma/client'
import argon2 from 'argon2'
import seed from './seed-data.json'

const prisma = new PrismaClient()

async function main() {
  const adminPass = await argon2.hash(seed.admin.password)
  const admin = await prisma.user.upsert({
    where: { email: seed.admin.email },
    create: {
      username: seed.admin.username,
      email: seed.admin.email,
      country: seed.admin.country,
      password_hash: adminPass,
      role: Role.admin,
      email_verified: true,
    },
    update: {},
  })
  console.log('Admin upserted', admin.email)

  let created = 0
  for (const q of seed.questions) {
    await prisma.question.create({
      data: {
        category: q.category as Category,
        difficulty: q.difficulty as Difficulty,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        source: q.source || 'seed',
        created_by: admin.id,
      }
    })
    created++
  }
  console.log(`Seeded ${created} questions`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
