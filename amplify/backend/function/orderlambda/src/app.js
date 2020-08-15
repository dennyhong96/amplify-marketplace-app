/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT

Amplify Params - DO NOT EDIT */

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const AWS = require("aws-sdk");

const config = {
  region: "us-west-2",
  adminEmail: "hong961127@gmail.com",
  accessKeyId: "AKIAJA2K5FEEGG2GMCMQ",
  secretAccessKey: "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",
};

const ses = new AWS.SES(config);

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const chargeHandler = async (req, res, next) => {
  const {
    token,
    charge: { currency, amount, description },
  } = req.body;

  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    });

    if (charge.status === "succeeded") {
      req.charge = charge;
      req.description = description;
      req.email = req.body.email;
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
};

const centesToDollar = (cents) => (cents / 100).toFixed(2);

const emailHandler = async (req, res, next) => {
  const {
    charge,
    descripiton,
    email: { customerEmail, ownerEmail, shipped },
  } = req;
  ses.sendEmail(
    {
      Source: config.adminEmail,
      ReturnPath: config.adminEmail,
      Destination: {
        ToAddresses: [config.adminEmail],
      },
      Message: {
        Subject: {
          Data: "Order Details - AmplifyMarket",
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
            <h3>Order Processed!</h3>
            <p>${descripiton} - $${centesToDollar(charge.amount)}</p>
            <p>Customer Email: ${customerEmail}</p>
            <p>Seller Email: ${ownerEmail}</p>
            ${
              shipped
                ? `
            <p>${charge.source.address_line1}</p>
            <p>${charge.source.address_city}</p>
            <p>${charge.source.address_zip}</p>
            `
                : `<p>Emailed Product</p>`
            }`,
          },
        },
      },
    },
    (err, data) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.json({
        message: "Order processed successful",
        charge,
        data,
      });
    }
  );
};

app.post("/charge", chargeHandler, emailHandler);

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
