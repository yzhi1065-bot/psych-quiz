import { IsString, IsOptional, IsMobilePhone } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  password: string;
}

export class LoginDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  password: string;
}
