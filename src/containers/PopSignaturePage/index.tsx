import React, { useState, useEffect, useCallback } from 'react';
import { useQueryParams, StringParam, withDefault } from 'use-query-params';

import generatePopSignature, {
  Payload,
} from '../../utils/generatePopSignature';

interface Result {
  message: string;
  payload: Payload;
  popSignature: string;
}

const PopSignaturePage = () => {
  const [params, setParams] = useQueryParams({
    accessToken: withDefault(StringParam, ''),
    date: withDefault(StringParam, new Date().toUTCString()),
    clientSecret: withDefault(StringParam, ''),
  });

  const [result, setResult] = useState<Result>({
    message: '',
    payload: { sig: '', time_since_epoch: 0 },
    popSignature: '',
  });

  const [errors, setErrors] = useState<string[]>([]);

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
        params.clientSecret as string
      )
    );
  }, [errors, params, validate]);

  useEffect(() => {
    computeResults();
  }, [computeResults, params]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
              rows={13}
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
        {errors.map((error) => (
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
            {result.popSignature && (
              <span className="break-word-container result">
                {result.popSignature}
              </span>
            )}
          </code>
          <br />
          <br />
          <code>
            Message:
            <br />
            {result.message && (
              <span className="break-word-container">{result.message}</span>
            )}
          </code>
          <br />
          <br />
          <code>
            time_since_epoch:{' '}
            {result.payload ? result.payload.time_since_epoch : ''}
          </code>
          <br />
          <br />
          <code>sig: {result.payload ? result.payload.sig : ''}</code>
        </pre>
      </form>
    </>
  );
};

export default PopSignaturePage;
