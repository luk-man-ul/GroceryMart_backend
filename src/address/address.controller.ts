import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AddressService } from './address.service'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/update-address.dto'

@UseGuards(AuthGuard('jwt'))
@Controller('addresses')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  // ================= CREATE ADDRESS =================
  @Post()
  create(@Req() req, @Body() dto: CreateAddressDto) {
    return this.addressService.create(
      req.user.userId,
      dto,
    )
  }

  // ================= LIST USER ADDRESSES =================
  @Get()
  findAll(@Req() req) {
    return this.addressService.findAll(
      req.user.userId,
    )
  }

  // ================= UPDATE / SET DEFAULT =================
  @Patch(':id')
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(
      req.user.userId,
      id,
      dto,
    )
  }

  // ================= DELETE ADDRESS (SAFE) =================
  @Delete(':id')
  remove(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.remove(
      req.user.userId,
      id,
    )
  }
}
