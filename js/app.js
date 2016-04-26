import React from "react";
import ReactDOM from "react-dom";
import Relay from "react-relay";

import Main from "./components/Main";


class HomeRoute extends Relay.Route {
  static routeName = 'Home';
  static queries = {
    store: (Component) => Relay.QL`
      query MainQuery {
        store {
          ${Component.getFragment('store')}
        }
      }
    `
  }
}

// Can't sent a fragment to the GraphQL server. Need to sent a Query.
// The variable Main here is no longer a React component; it's now a Relay container
ReactDOM.render(
    <Relay.RootContainer
      Component = {Main}
      route={new HomeRoute()}
      />,
    // <Main />,
    document.getElementById('react')
  );
