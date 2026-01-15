import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Delete,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  // ✅ GET ALL PRODUCTS
 @Get()
getAll(
  @Query('search') search?: string,
  @Query('categoryId') categoryId?: string,
  @Query('trash') trash?: string,
) {
  return this.service.findAll(
    search,
    categoryId ? +categoryId : undefined,
    trash === 'true',
  )
}

  // ✅ GET SINGLE PRODUCT
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ✅ CREATE PRODUCT (ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  // ✅ DELETE PRODUCT (SOFT DELETE)
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
  return this.service.restore(+id)
}


// ✅ UPDATE PRODUCT (ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Put(':id')
update(
  @Param('id') id: string,
  @Body() dto: CreateProductDto,
) {
  return this.service.update(+id, dto)
}

  // ✅ UPLOAD PRODUCT IMAGE (ADMIN ONLY)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {/*Admin Freq cloud image storage code*/ 
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    return {
      imageUrl: `http://localhost:3000/uploads/products/${file.filename}`,
    };
  }
}
