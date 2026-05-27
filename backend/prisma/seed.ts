import { PrismaClient, UserRole, CourseStatus, ClassStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeadura do banco de dados...');

  // Limpar tabelas existentes em ordem reversa para evitar problemas de FK
  await prisma.attendance.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.localNode.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Tabelas limpas com sucesso.');

  // Criar senhas criptografadas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('aluno123', 10);

  // 1. Criar Usuários
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador Cursos GT',
      email: 'admin@cursosgt.com.br',
      password: adminPassword,
      role: UserRole.ADMIN,
      cpf: '111.111.111-11',
      phone: '(11) 99999-9999',
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Aluno de Teste GT',
      email: 'aluno@cursosgt.com.br',
      password: studentPassword,
      role: UserRole.STUDENT,
      cpf: '222.222.222-22',
      phone: '(11) 98888-8888',
    },
  });

  console.log('Usuários semeados:');
  console.log(`- ADMIN: ${admin.email} (senha: admin123)`);
  console.log(`- STUDENT: ${student.email} (senha: aluno123)`);

  // 2. Criar Unidade Física Local (Local Node)
  const localNode = await prisma.localNode.create({
    data: {
      name: 'Unidade Principal - Centro',
      secretKey: 'token_local_secreto',
      ipAddress: '192.168.1.10',
      isActive: true,
    },
  });
  console.log(`Unidade Física semeada: ${localNode.name}`);

  // 3. Criar Cursos
  const courseDesign = await prisma.course.create({
    data: {
      title: 'Design Gráfico Profissional',
      slug: 'design-grafico-profissional',
      summary: 'Aprenda Photoshop, Illustrator, InDesign e crie projetos de design gráfico surpreendentes e profissionais.',
      description: 'O curso de Design Gráfico Profissional foi estruturado para capacitar alunos desde o absoluto zero até o nível profissional de criação visual.\n\nDurante o treinamento, você dominará as principais ferramentas do mercado e desenvolverá o senso estético, alinhando técnica, teoria cromática e design prático.\n\nConteúdo ideal para quem quer trabalhar em agências, estúdios ou como freelancer.',
      price: 299.90,
      duration: 40,
      status: CourseStatus.PUBLISHED,
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop',
    },
  });

  const courseInformatica = await prisma.course.create({
    data: {
      title: 'Informática Avançada e Office',
      slug: 'informatica-avancada-e-office',
      summary: 'Domine o Windows, Word, Excel Avançado e ferramentas de produtividade para o mercado de trabalho administrativo.',
      description: 'Ter domínio das ferramentas de produtividade corporativa já não é mais um diferencial, mas sim um pré-requisito fundamental.\n\nEste curso prepara você para todas as tarefas administrativas e operacionais do mercado de trabalho. Aprenda desde a manipulação e organização de arquivos no sistema operacional até fórmulas complexas e dashboards dinâmicos de Excel.',
      price: 199.90,
      duration: 30,
      status: CourseStatus.PUBLISHED,
      thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop',
    },
  });

  console.log('Cursos semeados com sucesso.');

  // 4. Criar Aulas (Lessons)
  await prisma.lesson.createMany({
    data: [
      {
        courseId: courseDesign.id,
        title: '01. Introdução ao Design Gráfico e Teoria das Cores',
        description: 'Fundamentos e princípios do design, roda de cores, harmonia e psicologia das cores nos projetos visuais.',
        duration: 45,
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/H59gX0P05_c',
      },
      {
        courseId: courseDesign.id,
        title: '02. Primeiros Passos no Adobe Photoshop',
        description: 'Entendendo a área de trabalho, gerenciando pranchetas, criando novos arquivos e dominando o uso de camadas.',
        duration: 60,
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/IskL8qM8gC4',
      },
      {
        courseId: courseDesign.id,
        title: '03. Vetores e Criação com Adobe Illustrator',
        description: 'Conceitos básicos de imagens vetoriais vs rasterizadas, ferramenta caneta (pen tool) e formas geométricas básicas.',
        duration: 50,
        order: 3,
        videoUrl: 'https://www.youtube.com/embed/5Hl6s5HjU3w',
      },
    ],
  });

  await prisma.lesson.createMany({
    data: [
      {
        courseId: courseInformatica.id,
        title: '01. Interface do Sistema e Gerenciamento de Arquivos',
        description: 'Explorando o painel de controle, organização de arquivos no Windows Explorer e atalhos vitais.',
        duration: 30,
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/M19m_Qn4s1k',
      },
      {
        courseId: courseInformatica.id,
        title: '02. Microsoft Word: Formatação e Normas ABNT',
        description: 'Criando sumários automatizados, formatação de parágrafos, numeração de páginas e margens ABNT.',
        duration: 40,
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/8v_gW2XQ7r8',
      },
      {
        courseId: courseInformatica.id,
        title: '03. Microsoft Excel: Fórmulas Básicas e Funções SOMA/MÉDIA',
        description: 'Conceito de células, fórmulas matemáticas básicas, preenchimento automático e formatação condicional de planilhas.',
        duration: 55,
        order: 3,
        videoUrl: 'https://www.youtube.com/embed/9Bq75m1X16g',
      },
    ],
  });

  console.log('Aulas semeadas com sucesso.');

  // 5. Criar Turmas (Classes)
  const classDesign = await prisma.class.create({
    data: {
      courseId: courseDesign.id,
      name: 'Turma A - Terça e Quinta à Noite',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // começou há 5 dias
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),  // dura mais 90 dias
      schedule: 'Ter/Qui das 19h às 21h',
      maxStudents: 25,
      status: ClassStatus.IN_PROGRESS,
    },
  });

  const classInformatica = await prisma.class.create({
    data: {
      courseId: courseInformatica.id,
      name: 'Turma B - Sábado de Manhã',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // começa em 10 dias
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 70),
      schedule: 'Sábados das 08h às 12h',
      maxStudents: 20,
      status: ClassStatus.SCHEDULED,
    },
  });

  console.log('Turmas semeadas:');
  console.log(`- ${classDesign.name}`);
  console.log(`- ${classInformatica.name}`);

  // 6. Matricular Aluno de Teste na Turma de Design (Em Andamento)
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      classId: classDesign.id,
      status: 'ACTIVE',
    },
  });

  console.log('Matrícula de teste ativada com sucesso.');
  console.log('Semeadura do banco concluída com sucesso total!');
}

main()
  .catch((e) => {
    console.error('Erro na semeadura:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
