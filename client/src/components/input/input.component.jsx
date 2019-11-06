import React from "react";
import "./input.styles.scss";

const Input = ({ label, ...otherProps }) => (
  <div className="group">
    <input className="input" {...otherProps} />
    {label ? (
      <label
        className={`${
          otherProps.value.length ? "shrink" : ""
        } input-label`}
      >
        {label}
      </label>
    ) : null}
  </div>
);

export default Input;
