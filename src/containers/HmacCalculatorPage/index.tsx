import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import generateHmacSignature from '../../utils/generateHmacSignature';

interface Result {
  hashedPayload: string;
  hmacDigest: string;
  requestData: string;
}

const HmacCalculatorPage = () => {
  const [params, setParams] = useQueryParams({
    contentType: StringParam,
    headerDate: StringParam,
    method: StringParam,
    partnerSecret: StringParam,
    requestBody: StringParam,
    requestUrl: StringParam,
  });

  const [result, setResult] = useState<Result>({
    hashedPayload: '',
    hmacDigest: '',
    requestData: '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setParams({
      contentType: params.contentType || 'application/json',
      headerDate: params.headerDate || new Date().toUTCString(),
      method: params.method || 'POST',
      partnerSecret: params.partnerSecret || '',
      requestBody: params.requestBody || `{"foo":"bar","baz":"lol","kek":168}`,
      requestUrl: params.requestUrl || '/relative-path',
    });
    // eslint-disable-next-line
  }, []);

  const computeResults = useCallback(() => {
    if (!params.partnerSecret) {
      return;
    }

    setErrors([]);

    setResult(
      generateHmacSignature(
        params.method as string,
        params.contentType as string,
        params.headerDate as string,
        params.requestUrl as string,
        params.requestBody as string,
        params.partnerSecret as string,
      ),
    );
  }, [params]);

  useEffect(() => {
    computeResults();
  }, [computeResults, params]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const newParams = { ...params, [e.target.name]: e.target.value };
    setParams(newParams);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!params.partnerSecret) {
      setErrors([...errors, 'Please enter secret.']);
      return;
    }

    computeResults();
  };

  return (
    <>
      <h1>HMAC Calculator</h1>
      <form>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="partner-secret">
            Secret
          </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              id="partner-secret"
              name="partnerSecret"
              onChange={handleChange}
              required
              type="text"
              value={params.partnerSecret}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="method">
            Method
          </label>
          <div className="col-sm-8">
            <select
              className="custom-select"
              id="method"
              name="method"
              onChange={handleChange}
              value={params.method}
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
            </select>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="content-type">
            Header Content Type
          </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              id="content-type"
              name="contentType"
              onChange={handleChange}
              type="text"
              value={params.contentType}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="header-date">
            Header Date
          </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              id="header-date"
              name="headerDate"
              onChange={handleChange}
              type="text"
              value={params.headerDate}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="request-url">
            Request URL
          </label>
          <div className="col-sm-8">
            <input
              className="form-control"
              id="request-url"
              name="requestUrl"
              onChange={handleChange}
              type="text"
              placeholder="/relative-path"
              value={params.requestUrl}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-sm-4" htmlFor="request-body">
            Request Body
            <br />
            (JSON stringified)
          </label>
          <div className="col-sm-8">
            <textarea
              className="form-control monospace"
              id="request-body"
              name="requestBody"
              onChange={handleChange}
              rows={3}
              value={params.requestBody}
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
          <div className="error">{error}</div>
        ))}
        <hr />
        <h3>Result</h3>
        <pre>
          <code>
            HMAC:{' '}
            {result.hmacDigest && (
              <span className="result">{result.hmacDigest}</span>
            )}
          </code>
          <br />
          <br />
          <code>
            Hashed payload:{' '}
            {params.method === 'GET' ? 'N/A' : result.hashedPayload}
          </code>
          <br />
          <br />
          <code>
            Request data:
            <br />
            {result.requestData}
          </code>
        </pre>
        <h3>CURL</h3>
        <pre>
          <code>
              curl -X '{params.method}' '&lt;HOST&gt;{params.requestUrl}' \<br />
                -H 'Authorization: &lt;PARTNER_ID&gt;:{result.hmacDigest}' \<br />
                -H 'Content-Type: {params.contentType}' \<br />
                -H 'Date: {params.headerDate}' \<br />
                -d '{params.method === 'GET' ? '' : params.requestBody}'
            </code>
        </pre>
      </form>
    </>
  );
};

export default HmacCalculatorPage;
