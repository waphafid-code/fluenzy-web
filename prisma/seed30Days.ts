import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Generating 30 days of realistic learning activity for demo...');

  const user = await prisma.user.findFirst({
    where: { email: 'budi@fluenzy.id' },
  });

  if (!user) {
    console.error('❌ User budi@fluenzy.id not found. Please run npm run seed first.');
    return;
  }

  const skills = await prisma.skill.findMany();
  const questions = await prisma.question.findMany();

  if (skills.length === 0 || questions.length === 0) {
    console.error('❌ Questions or Skills missing.');
    return;
  }

  // 1. Bersihkan DailyActivity dan AnswerLog lama untuk demo
  await prisma.dailyActivity.deleteMany({ where: { userId: user.id } });
  await prisma.answerLog.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  let cumulativeXp = 0;
  let totalLessons = 0;

  const errorTypes = ['typo', 'word_order', 'missing_word', 'wrong_word', 'wrong_choice'];

  // 2. Loop 30 hari ke belakang
  for (let i = 29; i >= 0; i--) {
    const activityDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = activityDate.toISOString().split('T')[0];

    // Siswa belajar pada 25 dari 30 hari (konsistensi 83%)
    const isRestDay = i === 12 || i === 22 || i === 5;
    const lessonsCount = isRestDay ? 0 : Math.floor(Math.random() * 3) + 1; // 1-3 sesi
    const dailyXp = isRestDay ? 0 : lessonsCount * 25 + Math.floor(Math.random() * 15);

    cumulativeXp += dailyXp;
    totalLessons += lessonsCount;

    if (!isRestDay) {
      await prisma.dailyActivity.create({
        data: {
          userId: user.id,
          date: dateStr,
          xpEarned: dailyXp,
          lessonsCompleted: lessonsCount,
        },
      });

      // Tambahkan 2-4 AnswerLogs per hari aktif
      const logsToday = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < logsToday; j++) {
        const randQ = questions[Math.floor(Math.random() * questions.length)];
        // Tingkat akurasi realistis ~70%
        const isCorrect = Math.random() < 0.7;
        const errType = isCorrect ? null : errorTypes[Math.floor(Math.random() * errorTypes.length)];

        let ans = 'apple';
        try {
          const p = JSON.parse(randQ.payload);
          ans = p.correctAnswer || p.options?.[0] || 'correct';
          if (!isCorrect) {
            ans = ans + '_err';
          }
        } catch {
          ans = 'answer';
        }

        await prisma.answerLog.create({
          data: {
            userId: user.id,
            questionId: randQ.id,
            skillId: randQ.skillId,
            exerciseType: randQ.type,
            userAnswer: ans,
            correctAnswer: ans,
            isCorrect,
            errorType: errType,
            responseTimeMs: Math.floor(Math.random() * 4000) + 1800,
            hintUsed: !isCorrect && Math.random() < 0.3,
            createdAt: activityDate,
          },
        });
      }
    }
  }

  // 3. Update UserStats dengan total XP dan streak terkini
  await prisma.userStats.update({
    where: { userId: user.id },
    data: {
      totalXp: cumulativeXp + 150,
      currentStreak: 7,
      longestStreak: 14,
      lastActiveDate: now.toISOString().split('T')[0],
      streakFreezeCount: 1,
      gems: 280,
    },
  });

  console.log(`✅ Generated 30 days of data: ${totalLessons} lessons completed, ${cumulativeXp} XP accumulated.`);
  console.log('🎉 Dashboard is now richly populated for presentation!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
