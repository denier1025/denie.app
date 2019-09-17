const supertest = require("supertest");
const app = require("../src/app");
const request = supertest(app);

const mongoose = require("mongoose");
const User = mongoose.model("User");
const EmailConfirmationToken = mongoose.model("EmailConfirmationToken");
const AuthToken = mongoose.model("AuthToken");

let firsrUserAuthToken = "";

const firstUser = {
  username: "static25",
  "email.address": "static25@yandex.ru",
  password: "qwertyuiop[]"
};

const secondUser = {
  username: "denie4925",
  "email.address": "denie4925@gmail.com",
  password: "qwertyuiop[]"
};

beforeAll(async () => {
  await EmailConfirmationToken.deleteMany();
  await AuthToken.deleteMany();
  await User.deleteMany();

  const userResponse = await request.post("/api/users").send(firstUser);
  const user = await User.findOne({
    "email.address": userResponse.body["email.address"]
  });
  await user.populate("emailConfirmationTokens").execPopulate();
  await request.get(
    `/api/confirmation/email/${user.emailConfirmationTokens[0].token}`
  );
  const tokenResponse = await request.post("/api/auth").send(firstUser);
  firsrUserAuthToken = tokenResponse.body.token;

  await new User(secondUser).save();
});

afterAll(async () => await mongoose.disconnect());

test("Should signup a new user", async () => {
  await request
    .post("/api/users")
    .send({
      username: "denier1025",
      "email.address": "denier1025@gmail.com",
      password: "qwertyuiop[]"
    })
    .expect(201);
});

test("Should get a 400 status code", async () => {
  await request
    .post("/api/users")
    .send({
      username: firstUser.username,
      "email.address": firstUser["email.address"],
      password: firstUser.password
    })
    .expect(400);
});

test("Should login a user", async () => {
  await request
    .post("/api/auth")
    .send({
      "email.address": firstUser["email.address"],
      password: firstUser.password
    })
    .expect(200);
});

test("Should not login when 'email.isComfirmed' is false", async () => {
  await request
    .post("/api/auth")
    .send({
      "email.address": secondUser["email.address"],
      password: secondUser.password
    })
    .expect(401);
});

test("Should not login with wrong credentials", async () => {
  await request
    .post("/api/auth")
    .send({
      "email.address": secondUser["email.address"],
      password: "3124fghfgh456gh4"
    })
    .expect(401);
});

test("Should get a user data", async () => {
  await request
    .get("/api/users/current")
    .set("Authorization", `Bearer ${firsrUserAuthToken}`)
    .send()
    .expect(200);
});

test("Should not get a user data without an auth token", async () => {
  await request
    .get("/api/users/current")
    .send()
    .expect(403);
});
