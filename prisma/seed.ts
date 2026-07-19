import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.admin.upsert({
    where: { email: 'fred.rlopes@gmail.com' },
    update: {},
    create: {
      email: 'fred.rlopes@gmail.com',
      name: 'Fred',
      isSuperAdmin: true,
    },
  })

  await prisma.pastorProfile.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      heroPhotoUrl: 'https://picsum.photos/seed/pastor-hero/1200/800',
      heroHeadline: 'Uma palavra que liberta.',
      heroHighlight: 'Uma família que acolhe.',
      heroIntro: 'Conteúdo placeholder — editar no admin.',
      familyPhotoUrl: 'https://picsum.photos/seed/pastor-familia/460/320',
      aboutEyebrow: 'Sobre o Ministério',
      aboutHeading: 'Uma missão, três frentes',
      aboutIntro: 'Conteúdo placeholder — editar no admin.',
    },
  })

  await prisma.videoHighlight.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      eyebrow: 'Palavra Recente',
      title: 'Libertos para libertar',
      description: 'Conteúdo placeholder — editar no admin.',
      thumbnailUrl: 'https://picsum.photos/seed/pastor-video/900/640',
      videoUrl: 'https://youtube.com',
      durationLabel: '42 min',
      ctaLabel: 'Assistir agora',
    },
  })

  await prisma.offeringSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      pixKey: 'financeiro@example.org',
      pixKeyType: 'email',
      pixMerchantName: 'Ministerio Seja Livre',
      pixMerchantCity: 'SAO PAULO',
      nationalBank: 'Banco Exemplo S.A.',
      nationalAgency: '0000',
      nationalAccount: '00000-0',
      nationalCnpj: '00.000.000/0001-00',
      intlBank: 'Global Trust Bank',
      intlIban: 'BR00 0000 0000 0000 0000',
      intlSwift: 'EXAMPLEXXX',
      intlAccountHolder: 'Ministerio Seja Livre',
    },
  })

  await prisma.footerSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      cnpj: '00.000.000/0001-00',
      address: 'Endereço placeholder — editar no admin.',
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
      whatsappUrl: 'https://wa.me/5500000000000',
      copyrightText: '© 2026 Ministério Seja Livre. Todos os direitos reservados.',
    },
  })

  console.log('Seed concluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
