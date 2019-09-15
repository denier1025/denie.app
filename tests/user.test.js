const supertest = require("supertest");
const app = require("../src/app");
const EmailConfirmationToken = require("../src/models/EmailConfirmationToken");
const User = require("../src/models/User");

beforeEach(async () => {
  await EmailConfirmationToken.remove();
  await User.remove();
});

afterEach(() => {
  console.log("afterEach");
});

test("Should signup a new user", (done) => {
  supertest(app)
    .post("/api/users")
    .send({
      username: "static25",
      "email.address": "static25@yandex.ru",
      password: "qwertyuiop[]"
    })
    .expect(201, done);
});
