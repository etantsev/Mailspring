// A 0 code is when an error returns without a status code, like "ESOCKETTIMEDOUT"
export const TimeoutErrorCodes = [
  0,
  408,
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT',
  'ECONNRESET',
  'ENETDOWN',
  'ENETUNREACH',
];
export const PermanentErrorCodes = [
  400,
  401,
  402,
  403,
  404,
  405,
  429,
  500,
  'ENOTFOUND',
  'ECONNREFUSED',
  'EHOSTDOWN',
  'EHOSTUNREACH',
];
export const CanceledErrorCodes = [-123, 'ECONNABORTED'];
export const SampleTemporaryErrorCode = 504;

export default {
  TimeoutErrorCodes,
  PermanentErrorCodes,
  CanceledErrorCodes,
  SampleTemporaryErrorCode,
};
