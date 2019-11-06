const User = require("../../models/User");
const AuthToken = require("../../models/AuthToken");
const Avatar = require("../../models/Avatar");
const Post = require("../../models/Post");
const Todo = require("../../models/Todo");
const Joi = require("@hapi/joi");

const {
  userSettings,
  modSettings,
  moderatorSettings,
  adminSettings,
  administratorSettings
} = {
  userSettings: {
    role: "user",
    subordination: {
      child: {
        read: true,
        modify: false
      },
      self: {
        read: true,
        modify: false
      },
      sibling: {
        read: true,
        modify: false
      },
      parent: {
        read: true,
        modify: false
      }
    }
  },
  modSettings: {
    role: "mod",
    subordination: {
      child: {
        read: true,
        modify: true
      },
      self: {
        read: true,
        modify: false
      },
      sibling: {
        read: true,
        modify: false
      },
      parent: {
        read: true,
        modify: false
      }
    }
  },
  moderatorSettings: {
    role: "moderator",
    subordination: {
      child: {
        read: true,
        modify: true
      },
      self: {
        read: true,
        modify: false
      },
      sibling: {
        read: true,
        modify: false
      },
      parent: {
        read: true,
        modify: false
      }
    }
  },
  adminSettings: {
    role: "admin",
    subordination: {
      child: {
        read: true,
        modify: true
      },
      self: {
        read: true,
        modify: false
      },
      sibling: {
        read: true,
        modify: false
      },
      parent: {
        read: true,
        modify: false
      }
    }
  },
  administratorSettings: {
    role: "administrator",
    subordination: {
      child: {
        read: true,
        modify: true
      },
      self: {
        read: true,
        modify: false
      },
      sibling: {
        read: true,
        modify: false
      },
      parent: {
        read: true,
        modify: false
      }
    }
  }
};

const accessRights = {
  "^\\/api\\/users\\/?$": {
    GET: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.isConfirmed",
            "disabled",
            "role",
            "createdAt",
            "updatedAt"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "disabled",
            "role",
            "createdAt",
            "updatedAt"
          ],
          ...administratorSettings
        }
      ]
    },
    POST: {
      validation: {
        model: User,
        uniqueFields: ["displayName", "email.address"],
        validationSchema: {
          displayName: Joi.string()
            .pattern(/^[a-zA-Z]{5,32}[0-9]{0,32}$/)
            .min(5)
            .max(64)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "starts with 5 alphabetic chars, only A-Z, a-z, 0-9";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          "email.address": Joi.string()
            .case("lower")
            .pattern(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
            .min(6)
            .max(254)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "invalid email format, ex.: example@email.com";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          password: Joi.string()
            .pattern(/^[ -~]+$/)
            .min(12)
            .max(32)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "all printable ASCII chars, ex.: A-Z, a-z, 0-9, !, @, #, $, %...";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: ["displayName", "email.address", "password"],
          allowedToSend: []
        }
      ]
    }
  },
  "^\\/api\\/users\\/[A-Za-z0-9]{24}\\/?$": {
    GET: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: ["_id", "displayName", "disabled", "role"],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["_id", "displayName", "email.isConfirmed", "disabled", "role"],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["_id", "displayName", "email.isConfirmed", "disabled", "role"],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.isConfirmed",
            "disabled",
            "role",
            "createdAt",
            "updatedAt"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "disabled",
            "role",
            "createdAt",
            "updatedAt"
          ],
          ...administratorSettings
        }
      ]
    },
    PATCH: {
      validation: {
        model: User,
        uniqueFields: ["displayName"],
        validationSchema: {
          displayName: Joi.string()
            .pattern(/^[a-zA-Z]{5,32}[0-9]{0,32}$/)
            .min(5)
            .max(64)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "starts with 5 alphabetic chars, only A-Z, a-z, 0-9";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          disabled: Joi.date().error(errors => {
            errors.forEach(err => {
              switch (err.code) {
                case "date.base":
                  err.message = "can only be a date value";
                  break;
                case "date.empty":
                  err.message = "can not be empty";
                  break;
                default:
                  break;
              }
            });
            return errors;
          }),
          role: Joi.string()
            .valid("user", "mod", "moderator", "admin")
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.valid":
                    err.message =
                      "must be one of ['user', 'mod', 'moderator', 'admin']";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["displayName", "disabled"],
          allowedToSend: ["_id", "displayName", "email.isConfirmed", "disabled", "role"],
          ...modSettings
        },
        {
          allowedToReceive: ["displayName", "disabled", "role"],
          allowedToSend: ["_id", "displayName", "email.isConfirmed", "disabled", "role"],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["displayName", "disabled", "role"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.isConfirmed",
            "disabled",
            "role",
            "createdAt",
            "updatedAt"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: ["displayName", "disabled", "role"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.isConfirmed",
            "disabled",
            "role",
            "createdAt",
            "updatedAt"
          ],
          ...administratorSettings
        }
      ]
    },
    DELETE: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/users\\/current\\/?$": {
    GET: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...administratorSettings
        }
      ]
    },
    PATCH: {
      validation: {
        model: User,
        uniqueFields: ["displayName", "email.address"],
        validationSchema: {
          displayName: Joi.string()
            .pattern(/^[a-zA-Z]{5,32}[0-9]{0,32}$/)
            .min(5)
            .max(64)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "starts with 5 alphabetic chars, only A-Z, a-z, 0-9";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          "email.address": Joi.string()
            .case("lower")
            .pattern(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
            .min(6)
            .max(254)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "invalid email format, ex.: example@email.com";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          password: Joi.string()
            .pattern(/^[ -~]+$/)
            .min(12)
            .max(32)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "all printable ASCII chars, ex.: A-Z, a-z, 0-9, !, @, #, $, %...";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["displayName", "email.address", "password"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...userSettings
        },
        {
          allowedToReceive: ["displayName", "email.address", "password"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...modSettings
        },
        {
          allowedToReceive: ["displayName", "email.address", "password"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["displayName", "email.address", "password"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: ["displayName", "email.address", "password"],
          allowedToSend: [
            "_id",
            "displayName",
            "email.address",
            "email.isConfirmed",
            "role"
          ],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/users\\/current\\/avatar\\/?$": {
    GET: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "data",
            "type"
          ],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "data",
            "type"
          ],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "data",
            "type"
          ],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "data",
            "type"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "data",
            "type"
          ],
          ...administratorSettings
        }
      ]
    },
    POST: {
      validation: {
        model: Avatar,
        uniqueFields: [],
        validationSchema: {
          data: Joi.binary()
            .encoding("base64")
            .max(100000)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "binary.max":
                    err.message = `no more ${err.local.limit} bytes of size`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          type: Joi.string()
            .valid("image/png", "image/jpeg", "image/gif")
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.valid":
                    err.message =
                      "must be one of ['image/png', 'image/jpeg', 'image/gif']";
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["data", "type"],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: ["data", "type"],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: ["data", "type"],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["data", "type"],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: ["data", "type"],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    },
    DELETE: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/auth\\/?$": {
    POST: {
      validation: {
        model: User,
        uniqueFields: [],
        validationSchema: {
          "email.address": Joi.string()
            .case("lower")
            .pattern(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
            .min(6)
            .max(254)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "invalid email format, ex.: example@email.com";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          password: Joi.string()
            .min(6)
            .max(256)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: ["email.address", "password"],
          allowedToSend: ["token", "refreshToken"]
        }
      ]
    },
    DELETE: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/auth\\/refresh\\/?$": {
    POST: {
      validation: {
        model: AuthToken,
        uniqueFields: [],
        validationSchema: {
          refreshToken: Joi.string()
            .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message = "invalid JWT format";
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["refreshToken"],
          allowedToSend: ["token", "refreshToken"],
          ...userSettings
        },
        {
          allowedToReceive: ["refreshToken"],
          allowedToSend: ["token", "refreshToken"],
          ...modSettings
        },
        {
          allowedToReceive: ["refreshToken"],
          allowedToSend: ["token", "refreshToken"],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["refreshToken"],
          allowedToSend: ["token", "refreshToken"],
          ...adminSettings
        },
        {
          allowedToReceive: ["refreshToken"],
          allowedToSend: ["token", "refreshToken"],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/confirmation\\/email\\/[A-Fa-f0-9]{16}\\/?$": {
    GET: {
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: []
        }
      ]
    }
  },
  "^\\/api\\/confirmation\\/email\\/resend\\/?$": {
    POST: {
      validation: {
        model: User,
        uniqueFields: [],
        validationSchema: {
          "email.address": Joi.string()
            .case("lower")
            .pattern(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
            .min(6)
            .max(254)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "invalid email format, ex.: example@email.com";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: ["email.address"],
          allowedToSend: []
        }
      ]
    }
  },
  "^\\/api\\/confirmation\\/email\\/change\\/?$": {
    POST: {
      validation: {
        model: User,
        uniqueFields: [],
        validationSchema: {
          "email.address": Joi.string()
            .case("lower")
            .pattern(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
            .min(6)
            .max(254)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "invalid email format, ex.: example@email.com";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          "email.newAddress": Joi.string()
            .case("lower")
            .pattern(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
            .min(6)
            .max(254)
            .disallow(Joi.ref("email.address"))
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.pattern.base":
                    err.message =
                      "invalid email format, ex.: example@email.com";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: ["email.address", "email.newAddress"],
          allowedToSend: []
        }
      ]
    }
  },
  "^\\/api\\/posts\\/?$": {
    GET: {
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [
            "_id",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ]
        }
      ]
    },
    POST: {
      validation: {
        model: Post,
        uniqueFields: [],
        validationSchema: {
          title: Joi.string()
            .min(16)
            .max(256)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          subtitle: Joi.string()
            .min(32)
            .max(512)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          content: Joi.string()
            .min(128)
            .max(8192)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/posts\\/[A-Fa-f0-9]{24}\\/?$": {
    GET: {
      routeRights: {
        isPrivate: false
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ]
        }
      ]
    },
    PATCH: {
      validation: {
        model: Post,
        uniqueFields: [],
        validationSchema: {
          title: Joi.string()
            .min(16)
            .max(256)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          subtitle: Joi.string()
            .min(32)
            .max(512)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          content: Joi.string()
            .min(128)
            .max(8192)
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ],
          ...userSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ],
          ...modSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ],
          ...adminSettings
        },
        {
          allowedToReceive: ["title", "subtitle", "preview", "content", "tags"],
          allowedToSend: [
            "owner._id",
            "owner.displayName",
            "owner.role",
            "title",
            "subtitle",
            "preview",
            "content",
            "tags",
            "likes",
            "dislikes",
            "createdAt",
            "updatedAt"
          ],
          ...administratorSettings
        }
      ]
    },
    DELETE: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/todos\\/?$": {
    GET: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...administratorSettings
        }
      ]
    },
    POST: {
      validation: {
        model: Todo,
        uniqueFields: [],
        validationSchema: {
          todo: Joi.string()
            .min(2)
            .max(256)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["todo"],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: ["todo"],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: ["todo"],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["todo"],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: ["todo"],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  },
  "^\\/api\\/todos\\/[A-Fa-f0-9]{24}\\/?$": {
    GET: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...administratorSettings
        }
      ]
    },
    PATCH: {
      validation: {
        model: Post,
        uniqueFields: [],
        validationSchema: {
          title: Joi.string()
            .min(2)
            .max(256)
            .required()
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case "string.base":
                    err.message = "can only be a string value";
                    break;
                  case "string.empty":
                    err.message = "can not be empty";
                    break;
                  case "string.min":
                    err.message = `must be at least ${err.local.limit} characters long`;
                    break;
                  case "string.max":
                    err.message = `must be no more ${err.local.limit} characters long`;
                    break;
                  case "any.required":
                    err.message = "can not be blank";
                    break;
                  default:
                    break;
                }
              });
              return errors;
            }),
          done: Joi.boolean().error(errors => {
            errors.forEach(err => {
              switch (err.code) {
                // case "string.base":
                //   err.message = "can only be a string value";
                //   break;
                default:
                  break;
              }
            });
            return errors;
          })
        }
      },
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: ["todo", "done"],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...userSettings
        },
        {
          allowedToReceive: ["todo", "done"],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...modSettings
        },
        {
          allowedToReceive: ["todo", "done"],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...moderatorSettings
        },
        {
          allowedToReceive: ["todo", "done"],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...adminSettings
        },
        {
          allowedToReceive: ["todo", "done"],
          allowedToSend: ["todo", "done", "createdAt", "updatedAt"],
          ...administratorSettings
        }
      ]
    },
    DELETE: {
      routeRights: {
        isPrivate: true
      },
      rolesRights: [
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...userSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...modSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...moderatorSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...adminSettings
        },
        {
          allowedToReceive: [],
          allowedToSend: [],
          ...administratorSettings
        }
      ]
    }
  }
};

module.exports = accessRights;
