import React from 'react';
import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import HmacCalculatorPage from './containers/HmacCalculatorPage';

const App = () => {
  return (
    <Router basename="/gp-tools-frontend">
      <QueryParamProvider ReactRouterRoute={Route}>
        <Link to="/hmac">HMAC Calculator</Link> | Pop Signature Calculator
        <Switch>
          <Route path="/hmac" component={HmacCalculatorPage} />
          <Redirect to="/hmac" />
        </Switch>
      </QueryParamProvider>
    </Router>
  );
};

export default App;
