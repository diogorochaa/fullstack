import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CreateProductDto } from 'src/modules/products/application/dto/create-product.dto';
import { ListProductsQueryDto } from 'src/modules/products/application/dto/list-products-query.dto';
import { UpdateProductDto } from 'src/modules/products/application/dto/update-product.dto';
import { CreateProductUseCase } from 'src/modules/products/application/use-cases/create-product/create-product.usecase';
import { DeleteProductUseCase } from 'src/modules/products/application/use-cases/delete-product/delete-product.usecase';
import {
  GetProductUseCase,
  ListProductsUseCase,
} from 'src/modules/products/application/use-cases/get-product/get-product.usecase';
import { UpdateProductUseCase } from 'src/modules/products/application/use-cases/update-product/update-product.usecase';
import {
  PaginatedProductResponse,
  ProductResponse,
} from 'src/modules/products/presentation/responses/product.response';
import { Roles } from 'src/shared/auth/roles.decorator';
import { RolesGuard } from 'src/shared/auth/roles.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Get()
  async list(
    @Query() query: ListProductsQueryDto,
  ): Promise<PaginatedProductResponse> {
    const result = await this.listProducts.execute(query);
    return PaginatedProductResponse.fromResult(result);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<ProductResponse> {
    const product = await this.getProduct.execute(id, true);
    return ProductResponse.fromEntity(product);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: CreateProductDto): Promise<ProductResponse> {
    const product = await this.createProduct.execute(body);
    return ProductResponse.fromEntity(product);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductResponse> {
    const product = await this.updateProduct.execute(id, body);
    return ProductResponse.fromEntity(product);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteProduct.execute(id);
  }
}
