import {post} from "jquery";
import ServerActions from "./actions/ServerActions";

let API = {
  fetchLinks() {
    console.log("1, In API");
    post("/graphql", {
      query:`{
        links{
          _id,
          title,
          url
        }
      }`
    }).done(resp => {
      console.log(resp);
      ServerActions.receiveLinks(resp.data.links); // change to resp.data.links from resp because response of the graphql query
    })
  }
}

export default API;
