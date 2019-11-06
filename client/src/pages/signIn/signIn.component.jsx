import React, { Component } from "react";
import "./signIn.styles.scss";
import Input from "../../components/input/input.component";
import Button from "../../components/button/button.component";

class SignIn extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: ""
    };
  }

  handleSubmit = e => {
    e.preventDefault();

    this.setState({ email: "", password: "" });
  };

  handleChange = e => {
    const { value, name } = e.target;

    this.setState({ [name]: value });
  };

  render() {
    return (
      <div className="sign-in">
        <h2>I already have an account</h2>
        <span>Sign in with your email and password</span>
        <form>
          <Input
            type="email"
            name="email"
            value={this.state.email}
            onChange={this.handleChange}
            required
            label="email"
          />
          <Input
            type="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
            required
            label="password"
          />
          <Button type="submit" onClick={this.handleSubmit}>
            SIGN IN
          </Button>
        </form>
      </div>
    );
  }
}

export default SignIn;
