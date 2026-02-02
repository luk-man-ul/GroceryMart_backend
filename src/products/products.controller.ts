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
import { UpdateProductDto } from './dto/update-product.dto'
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  // ✅ GET ALL PRODUCTS
 @Get()
 @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'trash', required: false, description: 'Include deleted products (admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
  })
getAll(
  @Query('search') search?: string,
  @Query('categoryId') categoryId?: string,
  @Query('trash') trash?: string,
  @Query('cursor') cursor?: string,
  @Query('limit') limit = '10',
) {
  return this.service.findAll(
    search,
    categoryId ? +categoryId : undefined,
    trash === 'true',
    cursor ? +cursor : undefined,
    +limit,
  )
}


// ✅ GET ALL PRODUCTS FOR BILLING POS (NO PAGINATION)
@Get('all')
@ApiOperation({ summary: 'Get all products for Billing POS' })
@ApiResponse({
  status: 200,
  description: 'All products (no pagination)',
})
async getAllForBillingPOS() {
  const products = await this.service.findAllForBillingPOS()
  return { data: products }
}



  // ✅ GET SINGLE PRODUCT
  @Get(':id')
   @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
  })
  getOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ✅ CREATE PRODUCT (ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
   @ApiBearerAuth()
  @Post()
   @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  // ✅ DELETE PRODUCT (SOFT DELETE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
    @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
//restore product
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
 @ApiBearerAuth()
@Post(':id/restore')
@ApiOperation({ summary: 'Restore deleted product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product restored successfully',
  })
restore(@Param('id') id: string) {
  return this.service.restore(+id)
}


// ✅ UPDATE PRODUCT (ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Put(':id')
@ApiOperation({ summary: 'Update product (Admin only)' })
@ApiParam({
  name: 'id',
  description: 'Product ID to update',
})
@ApiResponse({
  status: 200,
  description: 'Product updated successfully',
})
update(
  @Param('id') id: string,
  @Body() dto: UpdateProductDto,
) {
  return this.service.update(+id, dto)
}

  // ✅ UPLOAD PRODUCT IMAGE (ADMIN ONLY)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post('upload')
  @ApiOperation({ summary: 'Upload product image (Admin only)' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      image: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@ApiResponse({
  status: 201,
  description: 'Product image uploaded successfully',
})
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
