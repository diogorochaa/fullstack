import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUserId } from '../../shared/decorators/ActiveUserId';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './services/categories.service';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ description: 'Category created' })
  create(
    @ActiveUserId() userId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List categories from current user' })
  @ApiOkResponse({
    description: 'Category list',
    schema: {
      example: [
        {
          id: '0b577dfe-41d7-4ce3-b17d-729d6ebfd18a',
          name: 'Salario',
          icon: 'wallet',
          type: 'INCOME',
          userId: '17d9d0e9-b198-43f9-b32f-13f57f4f6fd7',
        },
      ],
    },
  })
  findAll(@ActiveUserId() userId: string) {
    return this.categoriesService.findAllByUserId(userId);
  }
}
