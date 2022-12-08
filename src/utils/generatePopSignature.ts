import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

export interface Payload {
  time_since_epoch: number;
  sig: string;
}

const base64UrlEncode = (value: string) =>
  value.toString().replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

export default function generatePopSignature(
  accessToken: string,
  dateUTC: string,
  clientSecret: string
) {
  const date = new Date(dateUTC);

  const timestamp = Math.round(date.getTime() / 1000);
  const message = `${timestamp.toString()}${accessToken}`;

  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(message, clientSecret)
  );

  const payload: Payload = {
    time_since_epoch: timestamp,
    sig: base64UrlEncode(signature),
  };

  const payloadBytes = JSON.stringify(payload);

  const popSignature = base64UrlEncode(
    Buffer.from(payloadBytes).toString('base64')
  );

  return { message, payload, popSignature };
}
