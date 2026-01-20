import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    console.log('REGISTER DTO RECEIVED:', dto);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    return { message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
  console.log('LOGGING IN', dto)

  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  })

  if (!user) {
    throw new UnauthorizedException('Invalid credentials')
  }

  // 🔒 BLOCK DISABLED USERS (VERY IMPORTANT)
  if (!user.isActive) {
    throw new UnauthorizedException(
      'Account disabled by admin',
    )
  }

  const passwordMatch = await bcrypt.compare(
    dto.password,
    user.password,
  )

  if (!passwordMatch) {
    throw new UnauthorizedException('Invalid credentials')
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  }

  const token = await this.jwtService.signAsync(payload)

  return {
    access_token: token,
  }
}

}
