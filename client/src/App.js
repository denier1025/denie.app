import React, { Fragment } from "react";
import { Switch, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/home/home.component";
import Shop from "./pages/shop/shop.component";
import SignIn from "./pages/signIn/signIn.component";
// import SignUp from "./pages/signUp/signUp.component";
import Header from "./components/header/header.component";

function App() {
  return (
    <Fragment>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/signin" component={SignIn} />
        {/* <Route path="/signup" component={SignUp} /> */}
      </Switch>
    </Fragment>
  );
}

export default App;
