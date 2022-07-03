import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerTypes } from './interface';
import { GetCurrentUserId, GetCurrentUserRoles } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from '../common/guards';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Roles } from '../enum';
import { TopupDto } from './dto/topup.dto';

interface VerifyUpdatePhoneNumberProps {
  phoneNumber: string;
  otp: string;
  id: string;
}

@UseGuards(RoleGuard(Roles.Customer))
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Get All Customers
   */
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<CustomerTypes[]> {
    return this.customersService.findAll();
  }

  /**
   * Get Customer By ID
   */
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CustomerTypes> {
    return this.customersService.findOne(id);
  }

  /**
   * Delete Customers
   */
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    return this.customersService.delete(id);
  }

  /**
   * SEND OTP TO PHONE NUMBER
   * @param userId
   * @param phoneNumber
   */
  @HttpCode(HttpStatus.OK)
  @Post('send/otp')
  sendOtpForUpdate(@GetCurrentUserId() userId: string, @Body('phoneNumber') phoneNumber: string) {
    return this.customersService.SendOtpToPhoneNumberUpdate(userId, phoneNumber);
  }

  /**
   * VERIFY OTP TO PHONE NUMBER
   * @param userId
   * @param item
   */
  @HttpCode(HttpStatus.OK)
  @Post('send/verify')
  verifyOtpForUpdate(@GetCurrentUserId() userId: string, @Body() item: VerifyUpdatePhoneNumberProps) {
    return this.customersService.VerifyOtpToPhoneNumberUpdate(userId, item.phoneNumber, item.otp, item.id);
  }

  /**
   * Update Customers
   */
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @Put()
  update(
    @Body() updateCustomer: UpdateCustomerDto,
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUserId() userId: string
  ): Promise<boolean> {
    return this.customersService.update(userId, updateCustomer, file);
  }


  /**
   * Set Default Image Customers
   * @param userId
   */
  @HttpCode(HttpStatus.OK)
  @Put('defaultimg')
  deleteImage(@GetCurrentUserId() userId: string) {
    return this.customersService.deleteImage(userId);
  }
}
