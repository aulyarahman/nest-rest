import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { CustomersService } from 'src/customers/customers.service';
import { JwtPayload, ResponseTokens } from './interface';
import { TemporaryOtp, TemporaryOtpDocument } from './schemas/temp.schema';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ErrorsMessage, Roles } from 'src/enum';
import { signupCustomerTypes } from '../customers/interface';
import { MessageService } from '../message/message.service';
import { WsException } from '@nestjs/websockets';
import { phoneNumberRegExp } from '../utils';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(TemporaryOtp.name)
    private readonly tempModel: Model<TemporaryOtpDocument>,
    @Inject(forwardRef(() => CustomersService))
    private customerService: CustomersService,
    private messageService: MessageService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  /**
   * SEND OTP
   */
  async sendPhoneNumberCustomer(phoneNumber: string): Promise<TemporaryOtpDocument> {
    const codeGenerate = Math.floor(Math.random() * 8999 + 1000);
    const params = {
      phone: phoneNumber,
      body: `Kode verifikasi (OTP) *${codeGenerate}* hanya berlaku 3 menit - Kodal Apps`,
      messageType: 'otp'
    };

    if (!phoneNumberRegExp(phoneNumber)) {
      throw new BadRequestException(ErrorsMessage.PHONE_NUMBER);
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // CHECK IF PHONE NUMBER REGISTER
      await this.customerService.findPhoneNumber(phoneNumber);

      // const sendMessage = await this.messageService.sendMessage({
      //   message: params.body,
      //   phoneNumber: phoneNumber,
      //   msgType: 'otp'
      // });
      //
      // if (!sendMessage.id) {
      //   return Promise.reject(new BadRequestException('Id tidak ditemukan'));
      // }

      const setTemporary = await new this.tempModel({
        _id: codeGenerate + '123QWERTYYYED', //sendMessage.id
        otp: 1234,
        phoneNumber
      }).save();
      await session.commitTransaction();
      return setTemporary;
    } catch (e) {
      await session.abortTransaction();
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
    }
  }

  /**
   * VERIFY OTP
   */
  async verifyOtpForSigninCustomer(id: string, otp: string): Promise<ResponseTokens> {
    try {
      // await this.messageService.messageVerified(id);

      const searchOtp = await this.tempModel.findById(id);
      if (!searchOtp || searchOtp.otp !== otp) {
        return Promise.reject(new UnauthorizedException(ErrorsMessage.CODE_OTP));
      }

      const result = await this.customerService.findPhoneNumber(searchOtp.phoneNumber);

      const tokens = await this.getTokens(result.id, result.phoneNumber, Roles.Customer);
      await this.updateRtHashCustomer(result.id, tokens.refresh_token);
      await this.tempModel.findByIdAndDelete(id);

      return { ...tokens, userId: result.id };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async verifyOtpForUpdateCustomer(id: string, otp: string): Promise<boolean> {
    try {
      await this.messageService.messageVerified(id);

      const searchOtp = await this.tempModel.findById(id);
      if (!searchOtp || searchOtp.otp !== otp) {
        return Promise.reject(new UnauthorizedException(ErrorsMessage.CODE_OTP));
      }

      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendOtpForSinginCustomer(phoneNumber: string) {
    try {
      const checkPhone = await this.customerService.findPhoneNumber(phoneNumber);
      if (!checkPhone) return Promise.reject(new BadRequestException(ErrorsMessage.USER_NOT_EXIST));
      return await this.sendPhoneNumberCustomer(phoneNumber);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendOtpForSignupCustomer(item: signupCustomerTypes) {
    try {
      await this.customerService.findPhoneNumberNotExist(item.phoneNumber);
      await this.customerService.findByEmail(item.email);
      return await this.sendPhoneNumberCustomer(item.phoneNumber);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async singupCustomerAndCheckVerifyOtp(item: signupCustomerTypes, id: string, otp: string): Promise<ResponseTokens> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const searchOtp = await this.tempModel.findById(id);
      if (!searchOtp || searchOtp.otp !== otp) {
        return Promise.reject(new UnauthorizedException(ErrorsMessage.CODE_OTP));
      }

      const resCreateCustomer = await this.customerService.signupCustomers(item);
      const tokens = await this.getTokens(resCreateCustomer.id, resCreateCustomer.phoneNumber, Roles.Customer);
      await this.updateRtHashCustomer(resCreateCustomer.id, tokens.refresh_token);
      await this.tempModel.findByIdAndDelete(id);

      await session.commitTransaction();
      return { ...tokens, userId: resCreateCustomer.id };
    } catch (e) {
      await session.abortTransaction();
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
    }
  }

  /**
   * REFRESH TOKEN
   */
  async refreshToken(userId: string, rt: string, roles: string) {
    try {
      const user = await this.customerService.findOne(userId);
      if (!user || !user.rt) {
        return Promise.reject(new ForbiddenException('Access Denied'));
      }

      const rtMatches = argon.verify(user.rt, rt);
      if (!rtMatches) {
        return Promise.reject(new ForbiddenException('Access Denied'));
      }

      const tokens = await this.getTokens(user.id, user.phoneNumber, roles);
      await this.updateRtHashCustomer(user.id, tokens.refresh_token);
      return { ...tokens, userId: user.id };
    } catch (e) {
      throw new BadRequestException(e.response);
    }
  }

  /**
   * UPDATE REFRESH TOKEN
   */
  async updateRtHashCustomer(userId: string, rt: string) {
    const hash = await argon.hash(rt);
    await this.customerService.updateHash(userId, hash);
  }

  /**
   * LOGOUT CUSTOMER
   */
  async logoutCustomer(userId: string) {
    const cekUser = await this.customerService.findOne(userId);
    if (cekUser.rt === null) throw new BadRequestException('Access Denied');
    await this.customerService.updateHash(userId, null);
    return;
  }

  public async VerfiyTokenFromHeaderSocket(token: string) {
    try {
      const payload: any = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET')
      });
      return payload;
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  /**
   * GENERATED TOKEN
   */
  async getTokens(userId: string, phoneNumber: string, roles: string) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      roles,
      phoneNumber
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '7d'
      })
    ]);
    return {
      access_token: at,
      refresh_token: rt
    };
  }
}
