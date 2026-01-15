import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Query, Put } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

 
@Get()
getAll(@Query('trash') trash?: string) {
  return this.service.findAll(trash === 'true');
}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Post(':id/restore')
restore(@Param('id') id: string) {
  return this.service.restore(+id);
}
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Put(':id')
update(
  @Param('id') id: string,
  @Body() dto: CreateCategoryDto,
) {
  return this.service.update(+id, dto);
}

}
