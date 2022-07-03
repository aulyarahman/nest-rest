export interface CustomerTypes {
  id?: string;
  name: string;
  phoneNumber: string;
  email: string;
  imageUrl: string;
  imageKey: string;
  fcmToken: string;
  rt: string;
  createdAt?: Date;
  updateAt?: Date;
}

export interface OtpTypes {
  idUser: string;
  codeOtp: string;
  createdAt: Date;
}

export interface FcmUpdateTypes {
  id: string;
  fcmToken: string;
}

export interface topupPayment {
  amount: number;
  typePayment: 'ID_OVO' | 'ID_DANA' | 'ID_LINKAJA' | 'ID_SHOPEEPAY' | 'PH_PAYMAYA';
}
