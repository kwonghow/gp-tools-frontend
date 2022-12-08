import React from 'react';
import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

import { QueryParamProvider } from 'use-query-params';

import HmacCalculatorPage from './containers/HmacCalculatorPage';
import PopSignaturePage from './containers/PopSignaturePage';

const App = () => {
  return (
    <Router basename="/gp-tools-frontend">
      <QueryParamProvider adapter={ReactRouter5Adapter}>
        <Link to="/hmac">HMAC Calculator</Link> |{' '}
        <Link to="/pop-signature">POP Signature Calculator</Link>
        <Switch>
          <Route path="/hmac" component={HmacCalculatorPage} />
          <Route path="/pop-signature" component={PopSignaturePage} />
          <Redirect to="/hmac" />
        </Switch>
      </QueryParamProvider>
    </Router>
  );
};

export default App;
