import CryptoJS from 'crypto-js';

const base64UrlEncode = (value: string) =>
  value
    .toString()
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

export default function generatePopSignature(
  accessToken: string,
  dateUTC: string,
  clientSecret: string,
) {
  const date = new Date(dateUTC);

  const timestamp = Math.round(date.getTime() / 1000);
  const message = `${timestamp.toString()}${accessToken}`;

  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(message, clientSecret),
  );

  const payload = {
    time_since_epoch: timestamp,
    sig: base64UrlEncode(signature),
  };

  const payloadBytes = JSON.stringify(payload);

  return base64UrlEncode(Buffer.from(payloadBytes).toString('base64'));
}
