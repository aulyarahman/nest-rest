import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { LoginDto, VerifyDto } from './dto';
import { RtGuard } from '../common/guards';
import { GetCurrentUser, GetCurrentUserId, GetCurrentUserRoles, Public } from '../common/decorators';
import { SignUpCustomerDto } from 'src/customers/dto/signup-dto';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private authService: AuthenticationService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('customer/signup/otp')
  signUpSendOtp(@Body() item: SignUpCustomerDto) {
    return this.authService.sendOtpForSignupCustomer(item);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('customer/signup')
  signUp(@Body() item: SignUpCustomerDto, @Body() it: VerifyDto) {
    return this.authService.singupCustomerAndCheckVerifyOtp(item, it.id, it.otp);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('customer/login')
  singinCustomer(@Body() AuthDto: LoginDto) {
    return this.authService.sendOtpForSinginCustomer(AuthDto.phoneNumber);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('customer/verify')
  verifyCustomer(@Body() items: VerifyDto) {
    return this.authService.verifyOtpForSigninCustomer(items.id, items.otp);
  }

  @HttpCode(HttpStatus.OK)
  @Post('customer/logout')
  logoutCustomer(@GetCurrentUserId() userId: string) {
    return this.authService.logoutCustomer(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('customer/refresh')
  refreshTokenCustomer(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: string,
    @GetCurrentUserRoles() roles: string
  ) {
    return this.authService.refreshToken(userId, refreshToken, roles);
  }
}
