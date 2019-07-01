import React, { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { useQueryParams, StringParam } from 'use-query-params';

const base64UrlEncode = (value: string) =>
  value
    .toString()
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const generatePopSignature = (
  accessToken: string,
  dateUTC: string,
  clientSecret: string,
) => {
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
};

const PopSignaturePage = () => {
  const [params, setParams] = useQueryParams({
    accessToken: StringParam,
    date: StringParam,
    clientSecret: StringParam,
  });

  const [result, setResult] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setParams({
      accessToken: params.accessToken || '',
      clientSecret: params.clientSecret || '',
      date: params.date || new Date().toUTCString(),
    });
    // eslint-disable-next-line
  }, []);

  const validate = useCallback(() => {
    const rules: Array<{
      key: 'accessToken' | 'clientSecret';
      label: string;
    }> = [
      { key: 'clientSecret', label: 'Secret' },
      { key: 'accessToken', label: 'Access Token' },
    ];

    const newErrors: string[] = [];

    rules.forEach(({ key, label }) => {
      if (!params[key]) {
        newErrors.push(`Please enter ${label}.`);
      }
    });

    return newErrors;
  }, [params]);

  const computeResults = useCallback(() => {
    const newErrors = validate();

    if (errors.length) {
      setErrors(newErrors);
    }

    if (newErrors.length) {
      return;
    }

    setResult(
      generatePopSignature(
        params.accessToken as string,
        params.date as string,
        params.clientSecret as string,
      ),
    );
  }, [errors, params, validate]);

  useEffect(() => {
    computeResults();
  }, [computeResults, params]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newParams = { ...params, [e.target.name]: e.target.value };
    setParams(newParams);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();

    if (newErrors) {
      setErrors(newErrors);
      return;
    }

    computeResults();
  };

  return (
    <>
      <h1>POP Signature Calculator</h1>
      <form>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="client-secret">
            Client Secret
          </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              id="client-secret"
              name="clientSecret"
              onChange={handleChange}
              required
              type="text"
              value={params.clientSecret}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="date">
            Header Date
          </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              id="date"
              name="date"
              onChange={handleChange}
              type="text"
              value={params.date}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="access-token">
            Access Token
          </label>
          <div className="col-sm-8">
            <textarea
              className="form-control monospace"
              id="access-token"
              name="accessToken"
              onChange={handleChange}
              rows={3}
              value={params.accessToken}
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          id="submit-btn"
          onClick={handleSubmit}
          type="button"
        >
          Calculate HMAC
        </button>
        {errors.map(error => (
          <div className="error" key={error}>
            {error}
          </div>
        ))}
        <hr />
        <h3>Result</h3>
        <pre>
          <code>
            Signature:
            <br />
            {result && <span className="result">{result}</span>}
          </code>
        </pre>
      </form>
    </>
  );
};

export default PopSignaturePage;
