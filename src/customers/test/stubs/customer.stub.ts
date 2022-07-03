import { CustomerTypes } from '../../interface';

export const customerStub = (): CustomerTypes => {
  return {
    id: '134',
    name: 'Test',
    phoneNumber: '+52323211212',
    email: 'test@email.com',
    imageUrl: 'Image',
    imageKey: '22',
    fcmToken: 'dd',
    rt: 'aaa',
    createdAt: '2022-03-31T23:24:22.763Z' as unknown as Date,
    updateAt: '2022-03-31T23:24:22.763Z' as unknown as Date
  };
};
