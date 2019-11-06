import React, { Component } from "react";
import "./shop.styles.scss";
import collections from "./shop.data";

class Shop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collections
    };
  }

  render() {
    return (
      <div className="shop">
        SHOP
      </div>
    );
  }
}

export default Shop;