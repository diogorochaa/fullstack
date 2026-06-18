import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription(
      'API do ecommerce fullstack — catálogo, carrinho, pedidos e pagamentos',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      'access-token',
    )
    .addTag('auth', 'Registro, login e refresh token')
    .addTag('users', 'Perfil do usuário autenticado')
    .addTag('categories', 'Categorias do catálogo')
    .addTag('products', 'Produtos do catálogo')
    .addTag('cart', 'Carrinho de compras')
    .addTag('addresses', 'Endereços de entrega')
    .addTag('orders', 'Pedidos')
    .addTag('payments', 'Pagamentos')
    .addTag('admin', 'Operações administrativas (role ADMIN)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
