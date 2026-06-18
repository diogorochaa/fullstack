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
import { CreateCategoryDto } from 'src/modules/categories/application/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/categories/application/dto/update-category.dto';
import { CreateCategoryUseCase } from 'src/modules/categories/application/use-cases/create-category/create-category.usecase';
import { DeleteCategoryUseCase } from 'src/modules/categories/application/use-cases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from 'src/modules/categories/application/use-cases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from 'src/modules/categories/application/use-cases/list-categories/list-categories.usecase';
import { UpdateCategoryUseCase } from 'src/modules/categories/application/use-cases/update-category/update-category.usecase';
import {
  CategoryResponse,
  PaginatedCategoryResponse,
} from 'src/modules/categories/presentation/responses/category.response';
import { Roles } from 'src/shared/auth/roles.decorator';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly listCategories: ListCategoriesUseCase,
    private readonly getCategory: GetCategoryUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Get()
  async list(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedCategoryResponse> {
    const result = await this.listCategories.execute(
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
    );

    return PaginatedCategoryResponse.fromResult(result);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<CategoryResponse> {
    const category = await this.getCategory.execute(id);
    return CategoryResponse.fromEntity(category);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: CreateCategoryDto): Promise<CategoryResponse> {
    const category = await this.createCategory.execute(body);
    return CategoryResponse.fromEntity(category);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    const category = await this.updateCategory.execute(id, body);
    return CategoryResponse.fromEntity(category);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteCategory.execute(id);
  }
}
