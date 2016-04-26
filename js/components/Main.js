import React from "react";
import Relay from "react-relay";
import {debounce} from "lodash";
// ---- Don't need for Relay
// import API from "../API";
// import LinkStore from "../stores/LinkStore";

import Link from "./Link";

// define a mutation class
import CreateLinkMutation from "../mutation/CreateLinkMutation";

// let _getAppState = () => {
//   return {links : LinkStore.getAll() };
// };

class Main extends React.Component {

  // Don't need this.
  // // need beyond es2015 +++ to enable this.
  // static propTypes = {
  //   limit: React.PropTypes.number
  // }
  //
  // static defaultProps = {
  //   limit: 4
  // }

  //  ---- Don't need for Relay
  // state = _getAppState();
  //
  // // Don't need this because of the => function binding on onchange below
  // // constructor(props){
  // //   super(props);
  // //   // this.state = _getAppState();
  // //   this.onChange  = this.onChange.bind(this); // bind the function to the Component as a reciever
  // // }
  //
  // // componentWillMount(){}
  // componentDidMount(){
  //   API.fetchLinks();
  //   LinkStore.on("change", this.onChange);
  // }
  //
  // componentWillUnmount(){
  //   LinkStore.removeListener("change", this.onChange);
  // }
  //
  // onChange = () => {
  //   this.setState(_getAppState());
  // }

  // Debounce is when we delay the request to search for something. also to check if the user is still typing during the delay.
  // below delay by 30sec
  constructor(props){
    super(props);
    this.search = debouce(this.search, 300);
  }

  search = (e) => {
    let query = e.target.value;
    this.props.relay.setVariables({ query });
  }

  setLimit = (e) => {
    // on change of the target value in select tag below. do a relay call to set variables
    // Set the limit to newLimit
    let newLimit = Number(e.target.value);
    this.props.relay.setVariables({limit: newLimit});
  }

  handleSumbit= (e) => {
    e.preventDefault();
    // Mutation
    Relay.Store.update(
      new CreateLinkMutation({
        title:this.refs.newTitle.value,
        url: this.refs.newUrl.value,
        // Also need to update the parent object. in this case it is the store object itself. Which is avaialble on the Main component as a prop
        store: this.props.store
      })
    );
    // Reset fields to empty
    this.refs.newTitle.value="";
    this.refs.newUrl.value="";
  }

  render() {
    let content = this.prop.store.linkConnection.edges.maps(edges => {
    //
    // Don't need Slice
    // Instead of reading from the link from the state, we're going to pass the component a prop now.
    //  data-exposed props will be mapped to the GraphQL fragments, so a stored fragment will give us a stored prop
    // and the links can be accessed under that. All we need to do to make Relay read the data for this component
    // is to declare the requirement using GraphQL (see below...)
    //
    // let content = this.state.links.slice(0, this.props.limit).maps(link => {
      // In Relay, Every React Component define a GraphQL fragment to represent its data requirement.
      // TODO: Make the LI a <Link />
      return (
        <Link key={edges.node.id}, link = {edges.node}/>
        // <li key={link._id}>
        //   <a href={link.url}>{link.title}</a>
        // </li>
      );
    });
    return (
      <div>
        <h3>Links</h3>
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Title" ref="newTitle" />
          <input type="text" placeholder="Url" ref="newUrl" />
          <button type="submit">Add</button>
        </form>
        Showing: &nbsp;
        <input type="text" placeholder="Search" onChange={this.search}/>
        <select onChange={this.setLimit}
                defaultValue={this.props.relay.variables.limit}>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
        <ul>
          {content}
        </ul>
      </div>
    )
  }
}

// ...Declare the requirement using GraphQL. by declare the data requirement for this component
// createContainer takes two props. The component and the data requirement de3fined by fragments property.
// we need one fragment here. fragment name could be anything. We'll call it store here. every fragment is a function
// that returns a GraphQL query. we'll use Relay.QL function to tag a template string that represents the graphQL query.

// Below $limit is a variable
Main = Relay.createContainer(Main, {
  initialVariables: {
    limit: 100,
    query: ''
  },
  fragments: {
    store: () => Relay.QL`
      fragment on Store {
        # Fetch 10 links initially.
        # the main component is to read the global id that we defined on the store object
        # siince query filter the number of edges we're reading from teh server, a good place to add
        # this query variable would be a field argument on teh linkconnection
        id,
        linkConnection (first: $limit, query: $query) {
          edges {
            node {
              id,
              ${Link.getFragment('link')}
            }
          }
        }
      }
    `
  }
});

// Don't need to pull other data here other than _id, leave all the data needed by Link component to request data.
// isolation of what data is required.


//
// Main.propTypes = {
//   limit: React.PropTypes.number
// }
//
// Main.defaultProps = {
//   limit: 4
// }

export default Main;
