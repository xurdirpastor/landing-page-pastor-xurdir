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

  await prisma.aboutPillar.createMany({
    data: [
      {
        icon: 'file-text',
        title: 'Palavra viva',
        description: 'Pregação bíblica clara e aplicável, semana após semana, presencial e online.',
        order: 0,
      },
      {
        icon: 'clock',
        title: 'Libertação e cura interior',
        description: 'Cultos e mentorias dedicados a restaurar corações e romper ciclos de dor.',
        order: 1,
      },
      {
        icon: 'user-plus',
        title: 'Formação de líderes',
        description: 'Mentorias que preparam novos libertadores para servir suas próprias comunidades.',
        order: 2,
      },
    ],
    skipDuplicates: true,
  })

  const now = Date.now()
  const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000)

  await prisma.agendaItem.createMany({
    data: [
      {
        title: 'Culto de Libertação',
        type: 'presencial',
        date: days(-3),
        dateLabel: 'Qui, 17 de julho · 19h30',
        location: 'Templo Vida em Aliança — São Paulo/SP',
        imageUrl: 'https://picsum.photos/seed/agenda-culto/680/510',
        linkUrl: '#agenda',
        order: 0,
        isPublished: true,
      },
      {
        title: 'Mentoria de Líderes',
        type: 'presencial',
        date: days(7),
        dateLabel: 'Sáb, 26 de julho · 09h00',
        location: 'Centro de Treinamento — São Paulo/SP',
        imageUrl: 'https://picsum.photos/seed/agenda-mentoria/680/510',
        linkUrl: '#agenda',
        order: 1,
        isPublished: true,
      },
      {
        title: 'Pregação: Vidas Restauradas',
        type: 'online',
        date: days(15),
        dateLabel: 'Dom, 3 de agosto · 18h00',
        location: 'Transmissão ao vivo — YouTube',
        imageUrl: 'https://picsum.photos/seed/agenda-pregacao/680/510',
        linkUrl: '#agenda',
        order: 2,
        isPublished: true,
      },
      {
        title: 'Culto de Celebração (encerrado)',
        type: 'presencial',
        date: days(-30),
        dateLabel: 'Dom, 21 de junho · 10h00',
        location: 'Templo Vida em Aliança — São Paulo/SP',
        imageUrl: 'https://picsum.photos/seed/agenda-celebracao/680/510',
        linkUrl: '#agenda',
        order: 3,
        isPublished: false,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.book.createMany({
    data: [
      {
        title: 'Libertos Para Libertar',
        subtitle: 'Um chamado para formar novos libertadores',
        description:
          'Neste livro, o Pastor Xurdir compartilha histórias reais de restauração e apresenta um caminho prático para quem deseja não apenas ser curado, mas se tornar instrumento de cura para outros.',
        price: '49.90',
        coverImageUrl: 'https://picsum.photos/seed/livro-capa/440/640',
        buyUrl: 'https://example.org/comprar/libertos-para-libertar',
        order: 0,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.testimonial.createMany({
    data: [
      {
        quote:
          'Encontrei libertação de anos de ansiedade depois de participar das mentorias. Minha família nunca mais foi a mesma.',
        name: 'Mariana Alves',
        role: 'Membro desde 2021',
        initials: 'MA',
        avatarColor: '#3159C7',
        order: 0,
        isPublished: true,
      },
      {
        quote:
          'O Pastor Xurdir me ensinou não só a receber cura, mas a levar essa cura para outros. Hoje sirvo como líder de célula.',
        name: 'Roberto Lima',
        role: 'Líder de célula',
        initials: 'RL',
        avatarColor: '#4C8CFF',
        order: 1,
        isPublished: true,
      },
      {
        quote:
          'A palavra pregada aqui é direta e transformadora. Cada culto renova minha esperança.',
        name: 'Fernanda Costa',
        role: 'Membro desde 2019',
        initials: 'FC',
        avatarColor: '#293868',
        order: 2,
        isPublished: true,
      },
      {
        quote:
          'Cheguei sem esperança e encontrei uma família. A mentoria de líderes mudou o rumo do meu ministério.',
        name: 'Diego Santos',
        role: 'Membro desde 2022',
        initials: 'DS',
        avatarColor: '#6A9FFF',
        order: 3,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
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
