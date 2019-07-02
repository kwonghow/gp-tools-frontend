import CryptoJS from 'crypto-js';

export default function generateHmacSignature(
  method: string,
  headerContentType: string,
  headerDate: string,
  requestUrl: string,
  requestBody: string,
  partnerSecret: string,
) {
  if (method === 'GET' || !requestBody) {
    requestBody = '';
  }

  const hashedPayload = requestBody
    ? CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(requestBody))
    : '';

  const requestData = [
    [method, headerContentType, headerDate, requestUrl, hashedPayload].join(
      '\n',
    ),
    '\n',
  ].join('');

  const hmacDigest = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(requestData, partnerSecret),
  );

  return { hashedPayload, requestData, hmacDigest };
}
