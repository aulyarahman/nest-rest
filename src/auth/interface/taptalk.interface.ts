export interface ResapTalkTypes<T = errorTypesTapTalk, S = dataResponseTapTalk> {
  status: number;
  reqID: string;
  error: T;
  data: S;
}

export interface errorTypesTapTalk {
  code: string;
  message: string;
  field: string;
}

export interface dataResponseTapTalk {
  success: boolean;
  message: string;
  reason: string;
  id: string;
}
