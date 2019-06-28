import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import HmacCalculatorPage from './containers/HmacCalculatorPage';

const App = () => {
  return (
    <Router>
      <QueryParamProvider ReactRouterRoute={Route}>
        <Link to="/hmac">HMAC Calculator</Link> | Pop Signature Calculator
        <Route path="/hmac" component={HmacCalculatorPage} />
      </QueryParamProvider>
    </Router>
  );
};

export default App;
