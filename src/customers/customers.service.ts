import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as mongoose from 'mongoose';
import { CustomerTypes, CustomerUpdateTypes, signupCustomerTypes, topupPayment } from './interface';
import { DEFAULT_IMAGE, phoneNumberRegExp } from '../utils';
import { FileUploadService as UploadImageService } from '../uploads/upload.service';
import { KodalPayService } from '../kodal-pay/kodal-pay.service';
import { CustomersRepository } from './customers.repository';
import { CustomerDocument } from './schemas/customers.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { ErrorsMessage } from '../enum';
import { AuthenticationService } from '../auth/auth.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly uploadImageService: UploadImageService,
    private readonly kodalPayService: KodalPayService,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  /**
   * SIGNUP CUSTOMER
   * @param item
   */
  async signupCustomers(item: signupCustomerTypes) {
    if (!phoneNumberRegExp(item.phoneNumber)) {
      throw new BadRequestException(ErrorsMessage.PHONE_NUMBER);
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const findPhoneNumber = await this.customersRepository.findOne({
        phoneNumber: item.phoneNumber
      });
      if (findPhoneNumber) return Promise.reject(new BadRequestException(ErrorsMessage.PHONE_NUMBER_EXIST));

      const findEmail = await this.customersRepository.findOne({
        email: item.email
      });
      if (findEmail) return Promise.reject(new BadRequestException(ErrorsMessage.EMAIL_EXIST));
      await session.commitTransaction();
      return await this.customersRepository.create({ ...item, _id: 'CUS-' + uuidv4() });
    } catch (e) {
      await session.abortTransaction();
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
    }
  }

  /**
   * UPDATE PHONE NUMBER CUSTOMER SEND OTP
   * @param userId
   * @param phoneNumber
   */
  async SendOtpToPhoneNumberUpdate(userId: string, phoneNumber: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const findUser = await this.customersRepository.findOne({ _id: userId });
      if (!findUser) return Promise.reject(new NotFoundException(ErrorsMessage.USER_NOT_FOUND));
      await session.commitTransaction();
      return await this.authenticationService.sendPhoneNumberCustomer(phoneNumber);
    } catch (e) {
      await session.abortTransaction();
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
    }
  }

  async VerifyOtpToPhoneNumberUpdate(userId: string, phoneNumber: string, otp: string, id: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // CEK USER
      const findUser = await this.customersRepository.findOne({ _id: userId });
      if (!findUser) return Promise.reject(new UnauthorizedException(ErrorsMessage.USER_NOT_FOUND));

      // CEK OTP
      await this.authenticationService.verifyOtpForUpdateCustomer(id, otp);

      //  UPDATE PHONE NUMBER
      await this.customersRepository.findOneAndUpdate({ _id: userId }, { phoneNumber: phoneNumber });

      await session.commitTransaction();

      return true;
    } catch (e) {
      await session.abortTransaction();
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
    }
  }

  /**
   * FIND PHONE NUMBER IF NOT EXIST
   * @param phoneNumber
   */
  async findPhoneNumberNotExist(phoneNumber: string): Promise<boolean> {
    try {
      const result = await this.customersRepository.findOne({
        phoneNumber: phoneNumber
      });
      if (result) return Promise.reject(new BadRequestException(ErrorsMessage.PHONE_NUMBER_EXIST));
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * FIND PHONE NUMBER IF ALREADY EXIST
   * @param phoneNumber
   */
  async findPhoneNumber(phoneNumber: string): Promise<CustomerTypes> {
    try {
      return await this.customersRepository.findOne({
        phoneNumber: phoneNumber
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * FIND EMAIL IF ALREADY USE
   * @param email
   */
  async findByEmail(email: string): Promise<CustomerDocument> {
    try {
      const result = await this.customersRepository.findOne({
        email: email
      });
      if (result) return Promise.reject(new BadRequestException('Email sudah terpakai'));
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * FIND ALL CUSTOMERS
   */
  async findAll(): Promise<CustomerDocument[]> {
    try {
      return await this.customersRepository.find({});
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * FIND CUSTOMER BY ID
   * @param id
   */
  async findOne(id: string) {
    try {
      return await this.customersRepository.findOne({ _id: id });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * DELETE CUSTOMER
   * @param id
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.customersRepository.findOneAndDelete({ _id: id });
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * UPDATE CUSTOMER DATA
   * @param id
   * @param item
   * @param file
   */
  async update(id: string, item: CustomerUpdateTypes, file: Express.Multer.File): Promise<boolean> {
    if (item.phoneNumber && !phoneNumberRegExp(item.phoneNumber)) {
      throw new BadRequestException(ErrorsMessage.PHONE_NUMBER);
    }

    try {
      if (file) await this.upload(file, id);

      await this.customersRepository.findOneAndUpdate({ _id: id }, item);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * UPDATE REFRESH TOKEN CUSTOMER
   * @param id
   * @param hash
   */
  async updateHash(id: string, hash: string): Promise<CustomerDocument> {
    try {
      return await this.customersRepository.findOneAndUpdate({ _id: id }, { rt: hash });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * UPDATE FCM TOKEN
   * @param fcm
   * @param id
   */
  async updateFcmToken(fcm: string, id: string): Promise<boolean> {
    const user = await this.customersRepository.findOne({ _id: id });
    if (user.id !== id) throw new ForbiddenException('Access Denied');

    try {
      await this.customersRepository.findOneAndUpdate(
        { _id: id },
        {
          fcmToken: fcm
        }
      );

      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * UPLOAD IMAGE & UPDATE IMAGE CUSTOMER
   * @param item
   * @param id
   */
  async upload(item: Express.Multer.File, id: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.customersRepository.findOne({ _id: id });
      if (user.id !== id) return Promise.reject(new ForbiddenException('Access Denied'));

      const findKeyUser = await this.customersRepository.findOne({ _id: id });
      const res = await this.uploadImageService.uploadImage({
        file: item.buffer,
        bucket: 'customer',
        name: item.originalname
      });
      if (findKeyUser.imageKey) {
        await this.uploadImageService.deleteImage({ bucket: 'customer', key: findKeyUser.imageKey });
      }

      const resImageUrl = await this.updateImage(id, res.Location, res.key);
      await session.commitTransaction();
      return resImageUrl;
    } catch (e) {
      await session.abortTransaction();
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
      await mongoose.connection.close();
    }
  }

  /**
   * UPDATE URL IMAGE CUSTOMER
   * @param id
   * @param file
   * @param key
   */
  async updateImage(id: string, file: string, key: string): Promise<boolean> {
    const user = await this.customersRepository.findOne({ _id: id });
    if (user.id !== id) throw new ForbiddenException('Access Denied');

    try {
      await this.customersRepository.findOneAndUpdate(
        { _id: id },
        {
          imageUrl: file,
          imageKey: key
        }
      );

      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * DELETE & USING DEFAULT IMAGE CUSTOMER
   * @param id
   */
  async deleteImage(id: string) {
    try {
      await this.customersRepository.findOneAndUpdate(
        { _id: id },
        {
          imageUrl: DEFAULT_IMAGE,
          imageKey: ''
        }
      );
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * ACTVATED KODAL PAY CUSTOMER
   * @param id
   * @param roles
   */
  async activateKodalPayCustomer(id: string, roles: string) {
    const session = await this.connection.startSession();

    const findUser = await this.customersRepository.findOne({ _id: id });
    if (findUser.kodalPay) {
      throw new BadRequestException('Kodal pay telah di aktivasi');
    }

    await session.withTransaction(async () => {
      const [v1, v2] = await Promise.all([
        this.kodalPayService.getCustomerByRefrenceId(findUser.id),
        this.kodalPayService.findKodalPayByRefrenceId(findUser.id)
      ]);

      if (v1.data.length && !v2) {
        const result = await this.kodalPayService.createKodalPay(
          {
            referenceID: v1.data[0].reference_id,
            phoneNumber: v1.data[0].mobile_number,
            roles: roles,
            email: v1.data[0].email
          },
          session
        );
        await this.customersRepository.findOneAndUpdate({ _id: id }, { kodalPay: result.id }, session);
      } else {
        const result = await this.kodalPayService.createCustomerXendit({
          referenceID: findUser.id,
          phoneNumber: findUser.phoneNumber,
          givenNames: findUser.name,
          email: findUser.email,
          roles: roles
        });
        await this.customersRepository.findOneAndUpdate({ _id: id }, { kodalPay: result.id }, session);
      }
    });

    session.endSession();
    return true;
  }

  /**
   * TOP UP KODAL PAY CUSTOMER VIA E-WALLET
   * @param userId
   * @param item
   * @param phoneNumber
   */
  async topUpEwalletCustomer(userId: string, item: topupPayment, phoneNumber?: string) {
    const paymentType = ['ID_OVO', 'ID_DANA', 'ID_LINKAJA', 'ID_SHOPEEPAY', 'PH_PAYMAYA'];
    if (!paymentType.includes(item.typePayment)) {
      throw new BadRequestException('Payment method tidak valid');
    }

    if (item.typePayment === 'ID_OVO' && !phoneNumber) {
      throw new BadRequestException('Payment method OVO membutuhkan nomor handphone');
    }

    if (phoneNumber && !phoneNumberRegExp(phoneNumber)) {
      throw new BadRequestException(ErrorsMessage.PHONE_NUMBER);
    }

    return await this.kodalPayService.createPaymentEwallet({
      referenceID: userId,
      amount: item.amount,
      typePayment: item.typePayment,
      phoneNumber: phoneNumber
    });
  }

  async EwalletChargeStatus(id: string) {
    return await this.kodalPayService.paymentEwalletChargeStatus(id).finally(() => {
      mongoose.connection.close();
    });
  }

  async GetBalanceCustomer(userId: string) {
    try {
      return await this.kodalPayService.getBalanceUser({ idUser: userId, AccountType: 'CASH' });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async GetPaymentList() {
    return await this.kodalPayService.listPayment();
  }
}
