import { OrderStatus, PaymentStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type DemoCustomerSeed = {
  name: string;
  email: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
};

type DemoOrderSeed = {
  customerEmail: string;
  status: OrderStatus;
  monthsAgo: number;
  day: number;
  items: { productSlug: string; quantity: number }[];
};

const demoCustomers: DemoCustomerSeed[] = [
  {
    name: 'Maria Silva',
    email: 'maria@shopmax.com',
    street: 'Rua das Flores',
    number: '120',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-100',
  },
  {
    name: 'João Santos',
    email: 'joao@shopmax.com',
    street: 'Av. Paulista',
    number: '900',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-200',
  },
  {
    name: 'Ana Costa',
    email: 'ana@shopmax.com',
    street: 'Rua do Comércio',
    number: '45',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip: '20040-020',
  },
  {
    name: 'Pedro Lima',
    email: 'pedro@shopmax.com',
    street: 'Rua Bahia',
    number: '310',
    city: 'Belo Horizonte',
    state: 'MG',
    zip: '30160-011',
  },
];

const demoOrders: DemoOrderSeed[] = [
  {
    customerEmail: 'maria@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 5,
    day: 8,
    items: [
      { productSlug: 'tenis-nike-air-max-90', quantity: 1 },
      { productSlug: 'camiseta-basica-premium', quantity: 2 },
    ],
  },
  {
    customerEmail: 'joao@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 5,
    day: 18,
    items: [{ productSlug: 'fone-bluetooth-pro', quantity: 1 }],
  },
  {
    customerEmail: 'ana@shopmax.com',
    status: 'PAID',
    monthsAgo: 4,
    day: 5,
    items: [{ productSlug: 'jaqueta-corta-vento', quantity: 1 }],
  },
  {
    customerEmail: 'pedro@shopmax.com',
    status: 'SHIPPED',
    monthsAgo: 4,
    day: 22,
    items: [
      { productSlug: 'tenis-adidas-ultraboost', quantity: 1 },
      { productSlug: 'bermuda-esportiva-dry-fit', quantity: 1 },
    ],
  },
  {
    customerEmail: 'maria@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 3,
    day: 11,
    items: [{ productSlug: 'mochila-urban-25l', quantity: 1 }],
  },
  {
    customerEmail: 'joao@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 3,
    day: 27,
    items: [{ productSlug: 'samsung-galaxy-watch-6', quantity: 1 }],
  },
  {
    customerEmail: 'ana@shopmax.com',
    status: 'CANCELLED',
    monthsAgo: 2,
    day: 6,
    items: [{ productSlug: 'oculos-de-sol-polarizado', quantity: 1 }],
  },
  {
    customerEmail: 'pedro@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 2,
    day: 14,
    items: [
      { productSlug: 'tenis-converse-all-star', quantity: 1 },
      { productSlug: 'cinto-de-couro-legitimo', quantity: 1 },
    ],
  },
  {
    customerEmail: 'maria@shopmax.com',
    status: 'SHIPPED',
    monthsAgo: 1,
    day: 3,
    items: [{ productSlug: 'smartwatch-esportivo-x200', quantity: 1 }],
  },
  {
    customerEmail: 'joao@shopmax.com',
    status: 'PAID',
    monthsAgo: 1,
    day: 19,
    items: [
      { productSlug: 'camiseta-basica-premium', quantity: 3 },
      { productSlug: 'bermuda-esportiva-dry-fit', quantity: 1 },
    ],
  },
  {
    customerEmail: 'ana@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 1,
    day: 28,
    items: [{ productSlug: 'tenis-nike-air-max-90', quantity: 1 }],
  },
  {
    customerEmail: 'pedro@shopmax.com',
    status: 'PENDING',
    monthsAgo: 0,
    day: 4,
    items: [{ productSlug: 'fone-bluetooth-pro', quantity: 1 }],
  },
  {
    customerEmail: 'maria@shopmax.com',
    status: 'PAID',
    monthsAgo: 0,
    day: 9,
    items: [
      { productSlug: 'jaqueta-corta-vento', quantity: 1 },
      { productSlug: 'mochila-urban-25l', quantity: 1 },
    ],
  },
  {
    customerEmail: 'joao@shopmax.com',
    status: 'SHIPPED',
    monthsAgo: 0,
    day: 15,
    items: [{ productSlug: 'tenis-adidas-ultraboost', quantity: 1 }],
  },
  {
    customerEmail: 'ana@shopmax.com',
    status: 'DELIVERED',
    monthsAgo: 0,
    day: 22,
    items: [{ productSlug: 'samsung-galaxy-watch-6', quantity: 1 }],
  },
];

const categories = [
  { name: 'Tênis', slug: 'tenis' },
  { name: 'Roupas', slug: 'roupas' },
  { name: 'Acessórios', slug: 'acessorios' },
  { name: 'Eletrônicos', slug: 'eletronicos' },
] as const;

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categorySlug: string;
};

const products: ProductSeed[] = [
  {
    name: 'Tênis Nike Air Max 90',
    slug: 'tenis-nike-air-max-90',
    description:
      'Tênis clássico com amortecimento Air visível. Cabedal em mesh e couro sintético. Ideal para o dia a dia com estilo esportivo.',
    price: 499.9,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Tênis Adidas Ultraboost',
    slug: 'tenis-adidas-ultraboost',
    description:
      'Correr com conforto máximo. Tecnologia Boost no solado e cabedal Primeknit que se adapta ao pé.',
    price: 699.9,
    stock: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Tênis Converse All Star',
    slug: 'tenis-converse-all-star',
    description:
      'Ícone atemporal. Cano alto em lona com solado de borracha vulcanizada. Disponível em diversas cores.',
    price: 329.9,
    stock: 32,
    imageUrl:
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Camiseta Básica Premium',
    slug: 'camiseta-basica-premium',
    description:
      'Algodão penteado 30.1, corte regular. Macia, respirável e perfeita para combinar com qualquer look.',
    price: 79.9,
    stock: 120,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Jaqueta Corta-Vento',
    slug: 'jaqueta-corta-vento',
    description:
      'Proteção leve contra vento e chuva fina. Capuz ajustável, bolsos com zíper e tecido respirável.',
    price: 199.9,
    stock: 45,
    imageUrl:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Bermuda Esportiva Dry-Fit',
    slug: 'bermuda-esportiva-dry-fit',
    description:
      'Tecido que afasta o suor para treinos e passeios. Cintura elástica com cordão e bolsos laterais.',
    price: 89.9,
    stock: 60,
    imageUrl:
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Mochila Urban 25L',
    slug: 'mochila-urban-25l',
    description:
      'Compartimento acolchoado para notebook até 15". Alças ergonômicas e bolso anti-furto traseiro.',
    price: 149.9,
    stock: 38,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Cinto de Couro Legítimo',
    slug: 'cinto-de-couro-legitimo',
    description:
      'Couro bovino com fivela em metal escovado. Acabamento artesanal, disponível nos tamanhos 85 a 110.',
    price: 59.9,
    stock: 75,
    imageUrl:
      'https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Óculos de Sol Polarizado',
    slug: 'oculos-de-sol-polarizado',
    description:
      'Lentes UV400 com redução de brilho. Armação leve em TR90, estojo e flanela inclusos.',
    price: 119.9,
    stock: 50,
    imageUrl:
      'https://images.unsplash.com/photo-1572635196233-15949d1141b8?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Samsung Galaxy Watch 6',
    slug: 'samsung-galaxy-watch-6',
    description:
      'Smartwatch com monitoramento de sono, batimentos e GPS integrado. Compatível com Android e iOS.',
    price: 1299.0,
    stock: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Fone Bluetooth Pro',
    slug: 'fone-bluetooth-pro',
    description:
      'Cancelamento ativo de ruído, 30h de bateria com estojo e drivers de 10mm para graves profundos.',
    price: 249.9,
    stock: 42,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Smartwatch Esportivo X200',
    slug: 'smartwatch-esportivo-x200',
    description:
      'Resistente à água IP68, mais de 100 modos de treino e notificações do smartphone na pulseira.',
    price: 399.9,
    stock: 28,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Tênis New Balance 574',
    slug: 'tenis-new-balance-574',
    description:
      'Clássico casual com cabedal em suede e mesh. Solado encaixotado EVA para conforto o dia todo.',
    price: 459.9,
    stock: 27,
    imageUrl:
      'https://images.unsplash.com/photo-1606107557195-0a29cbf1fae2?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Tênis Vans Old Skool',
    slug: 'tenis-vans-old-skool',
    description:
      'Skate icon com faixa lateral e cabedal em canvas resistente. Versátil para streetwear.',
    price: 349.9,
    stock: 34,
    imageUrl:
      'https://images.unsplash.com/photo-1525966220534-080384ea9fbc?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Tênis Mizuno Wave Rider',
    slug: 'tenis-mizuno-wave-rider',
    description:
      'Amortecimento Wave para corridas leves. Mesh respirável e boa estabilidade.',
    price: 579.9,
    stock: 19,
    imageUrl:
      'https://images.unsplash.com/photo-1605348539781-1c53229c1d84?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Tênis Asics Gel-Nimbus',
    slug: 'tenis-asics-gel-nimbus',
    description:
      'Máximo conforto com tecnologia Gel no calcanhar e antepé. Ideal para longas caminhadas.',
    price: 649.9,
    stock: 16,
    imageUrl:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Tênis Olympikus Corre 4',
    slug: 'tenis-olympikus-corre-4',
    description:
      'Corrida com bom custo-benefício. Cabedal leve e solado com aderência para asfalto.',
    price: 279.9,
    stock: 41,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
    categorySlug: 'tenis',
  },
  {
    name: 'Calça Jogger Urban',
    slug: 'calca-jogger-urban',
    description:
      'Modelagem relax com punhos elásticos e bolsos laterais. Moletinho leve para o dia a dia.',
    price: 129.9,
    stock: 55,
    imageUrl:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Moletom Capuz Premium',
    slug: 'moletom-capuz-premium',
    description:
      'Algodão felpudo com capuz ajustável e bolso canguru. Conforto térmico para dias frios.',
    price: 159.9,
    stock: 48,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Vestido Midi Floral',
    slug: 'vestido-midi-floral',
    description:
      'Estampa floral discreta e caimento fluido. Perfeito para passeios e ocasiões casuais.',
    price: 139.9,
    stock: 33,
    imageUrl:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Calça Jeans Slim',
    slug: 'calca-jeans-slim',
    description:
      'Denim com elastano para maior mobilidade. Lavagem média e corte moderno.',
    price: 169.9,
    stock: 62,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Polo Piquet Clássica',
    slug: 'polo-piquet-classica',
    description:
      'Gola polo em malha piquet com acabamento premium. Elegante e confortável.',
    price: 99.9,
    stock: 70,
    imageUrl:
      'https://images.unsplash.com/photo-1586363104862-3a5e2a60e5c9?w=600',
    categorySlug: 'roupas',
  },
  {
    name: 'Boné Aba Curva Street',
    slug: 'bone-aba-curva-street',
    description:
      'Ajuste traseiro e aba curva estruturada. Bordado discreto na frente.',
    price: 49.9,
    stock: 90,
    imageUrl:
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Carteira Slim Couro',
    slug: 'carteira-slim-couro',
    description:
      'Couro sintético com compartimentos para cartões e notas. Perfil fino para bolso.',
    price: 69.9,
    stock: 58,
    imageUrl:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Relógio Minimalista DFR',
    slug: 'relogio-minimalista-dfr',
    description:
      'Mostrador limpo com pulseira em silicone. Resistente à água para uso diário.',
    price: 189.9,
    stock: 36,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Pulseira Esportiva Pack 3',
    slug: 'pulseira-esportiva-pack-3',
    description:
      'Kit com três pulseiras absorventes para treino. Cores variadas e ajuste confortável.',
    price: 39.9,
    stock: 110,
    imageUrl:
      'https://images.unsplash.com/photo-1611652022418-a9417f743cfb?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Necessaire Viagem Compacta',
    slug: 'necessaire-viagem-compacta',
    description:
      'Organize itens de higiene em viagens curtas. Material impermeável e zíper reforçado.',
    price: 54.9,
    stock: 64,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    categorySlug: 'acessorios',
  },
  {
    name: 'Caixa de Som Bluetooth 20W',
    slug: 'caixa-de-som-bluetooth-20w',
    description:
      'Som estéreo com graves reforçados e bateria de 12h. IPX5 para uso ao ar livre.',
    price: 219.9,
    stock: 29,
    imageUrl:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Mouse Sem Fio Ergonômico',
    slug: 'mouse-sem-fio-ergonomico',
    description:
      'Design confortável para longas jornadas. Sensor preciso e conexão USB receiver.',
    price: 119.9,
    stock: 44,
    imageUrl:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Teclado Mecânico RGB',
    slug: 'teclado-mecanico-rgb',
    description:
      'Switches táteis, iluminação RGB e construção em alumínio. Ideal para home office.',
    price: 349.9,
    stock: 22,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Power Bank 20000mAh',
    slug: 'power-bank-20000mah',
    description:
      'Carregamento rápido com duas saídas USB-C. Indicador LED de carga restante.',
    price: 159.9,
    stock: 51,
    imageUrl:
      'https://images.unsplash.com/photo-1609091839311-9d6704d0d0f3?w=600',
    categorySlug: 'eletronicos',
  },
  {
    name: 'Webcam Full HD Pro',
    slug: 'webcam-full-hd-pro',
    description:
      'Imagem 1080p com microfone embutido e redução de ruído. Clip universal para monitor.',
    price: 199.9,
    stock: 31,
    imageUrl:
      'https://images.unsplash.com/photo-1587825140708-dfaf300ae630?w=600',
    categorySlug: 'eletronicos',
  },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryMap.set(category.slug, record.id);
    console.log(`  ✓ Categoria: ${record.name}`);
  }

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Categoria não encontrada: ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        active: true,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        active: true,
        categoryId,
      },
    });

    console.log(`  ✓ Produto: ${product.name}`);
  }

  const adminPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@shopmax.com' },
    update: {
      name: 'Administrador',
      role: 'ADMIN',
      password: adminPassword,
    },
    create: {
      name: 'Administrador',
      email: 'admin@shopmax.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('  ✓ Usuário admin: admin@shopmax.com / Admin@123');

  const customerPassword = await bcrypt.hash('Cliente@123', 10);
  const customerMap = new Map<string, { userId: string; addressId: string }>();

  for (const customer of demoCustomers) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: { name: customer.name, role: 'CUSTOMER' },
      create: {
        name: customer.name,
        email: customer.email,
        password: customerPassword,
        role: 'CUSTOMER',
      },
    });

    const address = await prisma.address.upsert({
      where: { id: `${user.id}-default-address` },
      update: {
        street: customer.street,
        number: customer.number,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        isDefault: true,
      },
      create: {
        id: `${user.id}-default-address`,
        userId: user.id,
        street: customer.street,
        number: customer.number,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        isDefault: true,
      },
    });

    customerMap.set(customer.email, {
      userId: user.id,
      addressId: address.id,
    });
    console.log(`  ✓ Cliente demo: ${customer.email}`);
  }

  const productRecords = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, price: true },
  });
  const productMap = new Map(
    productRecords.map((product) => [product.slug, product]),
  );

  const demoEmails = demoCustomers.map((customer) => customer.email);
  const demoUserIds = (
    await prisma.user.findMany({
      where: { email: { in: demoEmails } },
      select: { id: true },
    })
  ).map((user) => user.id);

  await prisma.payment.deleteMany({
    where: { order: { userId: { in: demoUserIds } } },
  });
  await prisma.orderItem.deleteMany({
    where: { order: { userId: { in: demoUserIds } } },
  });
  await prisma.order.deleteMany({
    where: { userId: { in: demoUserIds } },
  });

  const now = new Date();
  let ordersCreated = 0;

  for (const demoOrder of demoOrders) {
    const customer = customerMap.get(demoOrder.customerEmail);
    if (!customer) continue;

    const orderDate = new Date(
      now.getFullYear(),
      now.getMonth() - demoOrder.monthsAgo,
      demoOrder.day,
      14,
      30,
      0,
    );

    const items = demoOrder.items.map((item) => {
      const product = productMap.get(item.productSlug);
      if (!product) {
        throw new Error(`Produto não encontrado: ${item.productSlug}`);
      }

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        userId: customer.userId,
        addressId: customer.addressId,
        status: demoOrder.status,
        total,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: { create: items },
      },
    });

    if (['PAID', 'SHIPPED', 'DELIVERED'].includes(demoOrder.status)) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          status: PaymentStatus.PAID,
          provider: 'simulated',
          externalId: `seed-${order.id}`,
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      });
    }

    ordersCreated += 1;
  }

  console.log(
    `  ✓ Vendas demo: ${ordersCreated} pedidos para ${demoCustomers.length} clientes (senha: Cliente@123)`,
  );

  const [categoryCount, productCount, userCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count(),
  ]);

  const orderCount = await prisma.order.count();

  console.log(
    `\n✅ Seed concluído — ${categoryCount} categorias, ${productCount} produtos, ${userCount} usuários, ${orderCount} pedidos.`,
  );
}

main()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
