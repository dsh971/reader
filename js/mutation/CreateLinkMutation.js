import Relay from "react-relay";

// The purpose of this is to define mutation class definition. Not a React Component

class CreateLinkMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`
      mutation { createLink }
    `;
  }

  // The input for the mutation. Value we supplied in our mutation instance are available in the props object.
  //
  getVariables() {
    return {
      title: this.props.title,
      url: this.props.url
    }
  }

  // Return a GraphQL Fragment that represents everything in our data model that COULD be effected by this mutation
  // a plan for the future. Not everythign teh app is using today. It's everything athat could be affected
  // Relay intersect the FatQuery with the actual data our app is using and only ask for that
  getFatQuery() {
    // CreateLinkPayload type that was defined for us on the server by Relay.Mutation helper we used.
    return Relay.QL`
      fragment on CreateLinkPayload {
        linkEdge,
        store { linkConnection }
      }
    `;


  // Return an array of configuration
  // Mutator configuration are basically insturctions on how to use the response payload
  // for each mutation to update the client-side store
  //
  // rangeBehaviors object is a map between a certain state for our connection and the operation that we want relay to do for that state.
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'store',
      parentID: this.props.store.id,
      connectionName: 'linkConnection',
      edgeName: 'linkEdge',
      rangeBehaviors:{
        // Append the new the new edge
        // Preend to add as the first item in the list
        '':'prepend',
      },
    }]
  }

  //relay supports "optimistic updates". give the user immediate feedback about the
  // operation they just did. then handle the response when it's official from the server
  getOptimisticResponse(){
    // this function returns will be used immediately after. by getConfig's behavior we defined
    return {
      // in this case we want to insert the link immediately. so we'll just make a copy of it here
      // the node can use the props from the input directly. aka what the user entered
      linkEdge: {
        node: {
          title: this.props.title,
          url: this.props.url,

        }
      }
    }
  }
}


export default CreateLinkMutation;
