import React from "react";
import Relay from "react-relay";
import Momet from "moment";


class Link extends React.Component {
  dateStyle = () => ({
    color: "#888",
    fontSize: '0.7em',
    marginRight: '0.5em'
  })
  dateLabel = () => {
    let {link, relay} = this.props;
    // we need to tell if the date is coming from server or not
    // aka if relay has an optimistic update for the link then there is no save date
    // then just return a feedback message still saving
    if(relay.getOptimisticUpdate(link)){
      return 'Saving...';
    }
    return moment(link.createdAt).format('L')
  }
  render() {
    let {link} = this.props;
    return (
      <li>
        <span style={this.dateStyle}>
          {this.dateLabel}
        </span>
        <a href={link.url}>{link.title}</a>
      </li>
    );
  }
}

Link = Relay.createContainer(Link, {
  fragments : {
    link : () => Relay.QL`
      fragment on Link {
        url,
        title,
        createdAt,
      }
    `
  }
});

export default Link;
