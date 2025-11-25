/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';

import './index.css';
import App from './App';
import { Route, Router } from '@solidjs/router';
import { Sprint } from './pages/Sprint';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Profile } from './pages/Profile';
import { Privacy } from './pages/Privacy';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => (
    <Router>
      <Route path="/" component={App}>
        <Route path={""} component={Home}></Route>
        <Route path={"Profile"} component={Profile}></Route>
        <Route path={"Sprint"} component={Sprint}></Route>
        <Route path={"About"} component={About}></Route>
        <Route path={"Privacy"} component={Privacy}></Route>
      </Route>
    </Router>
  ),
  root!,
);
