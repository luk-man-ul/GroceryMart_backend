import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'

@ApiTags('Categories')   // 📂 Swagger group
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  // =========================
  // GET ALL CATEGORIES
  // =========================
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'trash',
    required: false,
    description: 'Include deleted categories (admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
  })
  getAll(@Query('trash') trash?: string) {
    return this.service.findAll(trash === 'true')
  }

  // =========================
  // CREATE CATEGORY (ADMIN)
  // =========================
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto)
  }

  // =========================
  // UPDATE CATEGORY (ADMIN)
  // =========================
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.update(+id, dto)
  }

  // =========================
  // DELETE CATEGORY (ADMIN)
  // =========================
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }

  // =========================
  // RESTORE CATEGORY (ADMIN)
  // =========================
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted category (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category restored successfully',
  })
  restore(@Param('id') id: string) {
    return this.service.restore(+id)
  }
}
