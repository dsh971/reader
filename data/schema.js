import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import {
  globalIdField,
  fromGlobalId,
  nodeDefinitions, // use this to map globally defined IDs into actual data objects and their GraphQL types
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray,
  mutationWithClientMutationId
} from "graphql-relay";

// connectionDefinitions is a helper function that takes in a regular graphQL node and give us back an obj representing the new node connection structure.
// connectionArgs object holding the definition of the standard arguments for a connection. like First, Last...


// Access to Mongo DB
let Schema = (db) => {
  class Store {}
  let store = new Store{};

  // nodeDefinitions takes two variables. both functions
  let nodeDefs = nodeDefinitions(
    // the first function recieves the global id in question
    (globalId) => {
      let {type} = fromGlobalId(globalId);
      if(type ==='Store'){
        return store
      }
      return null;
    },
    // in this function we map the globalid into its corresponding data object.
    // recieves the result object
    (obj) => {
      if(obj instanceof Store){
        return storeType;
      }
      return null;
    }
  );

  let storeType = new GraphQLObjectType({
    name: 'Store',
    fields: () => ({
      id: globalIdField("Store"),
      linkConnection: {
        type: linkConnection.connectionType,
        args: {
          ...connectionArgs, // first:..., last:...
          query: { type: GraphQLString }
        }
        resolve: (_, args) => {
            let findParams = {};
            if(args.query){
              findParams.title = new RegExp(args.query, "i"); # Now to search with Mongo, we need to create a regular expression from teh search query.  with i for case insensetive
            }
            return connectionFromPromisedArray(
              // Use args.first to limit the number of rows called
              // Pull data from the database
              db.collection("links")
                .find(findParams)
                .sort({createdAT: -1}) // so it'll sort descending. apparent this is a mongodb syntax
                .limit(args.first).toArray(), // Read data from mongodb. the query says find all in links and turn result to an array.
              args
            )
        }
      }
    }),
    // we need to add an interfaces property to it and use the node interface property from the node def we just created
    interfaces: [nodeDefs.nodeInterface]
  })

  let linkType = new GraphQLObjectType({
    name: 'Link'
    fields: () => ({
      // Note: For a GraphQL object to be represented as a connection, Relay requires that it define an id field.
      // _id: {type:GraphQLString},
      // we originally use _id here because of mongodb
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (obj) => obj._id
      }
      title: {type:GraphQLString},
      url: {type:GraphQLString},
      createdAt: {
        type: GraphQLString,
        resolve: (obj) => new Date(obj.createdAt).toISOString() // expose dates in our GraphQL server as an ISO string
      }
    })
  })

  let linkConnection = connectionDefinitions({
    name: 'Link',
    nodeType: linkType
  });

  // Have a single input field, and a unique mutation id.
  // 4 main properties. name, inputField, outputField, and mutateAndGetPayload function where mutation logic is located
  // mutateAndGetPayload takes in parsed input in the first argument
  let createLinkMutation = mutationWithClientMutationId({
    name: 'CreateLink',
    inputFields: {
      title: {type: new GraphQLNonNull(GraphQLString)},
      url: {type: new GraphQLNonNull(GraphQLString)},
    },
    // Relay mutations can also read something after the mutation, which is usually what you need to do after an
    // insert-update opeartion. The cool thing here is that you can read anything, not just hte thing you just mutated.
    // the output is just another graphql Node. can read anything, not just hte thing you just mutated
    outputField: {
      // instead of link, we'll return a linkEdge
      linkEdge: {
        // instead of linkType, we'll use Link edgeType
        type: linkConnection.edgeType,
        // The ops array is an array of all the documents inserted and we only have one here
        // resolve: (obj) => obj.ops[0]
        // instead of returning a regular link object, we should return a link edge object so that we can just append
        // this new edge to our existing edges for the link connection.
        resolve: (obj) => ({node: obj.ops[0], cursor: obj.insertedId })
      },
      store: {
        type: storeType,
        resolve: () => store
      }
    },
    mutateAndGetPayload: ({title, url}) => {
      // we have to return a promise. This deals with mongodb. so we are using mongal synatx
      // insert values to the database
      return db.collection('links').insertOne({
        title,
        url,
        createdAt: Date.now()
      });
    }
  });

  let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          // we nee dto add a nodeField on top of the GraphQL Query
          node: nodeDefs.nodeField,
          store: {
            type: storeType, // Add storeType in the Root Level object. Defined above
            resolve: () => store
          }
          // counter: {
          //   type: new GraphQLList(linkType),
          //   resolve: () => db.collection("links").find({}).toArray() // Read data from mongodb. the query says find all in links and turn result to an array.
          // },
          // message: {
          //   type: GraphQLString,
          //   resolve: () => "Hello GraphQL"
          // }
        })
      }),

      // Our app is useless without a form for others to add new resources. This is where mutation comes in.
      // Mutation can be any change operation, insert, update, delete, or a combination of them.
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        // List of mutations can be definded under the fields property
        fields: () => ({
          createLink: createLinkMutation
        })
      })
  });

  return schema;
};


export default Schema;
