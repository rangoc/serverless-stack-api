import Stripe from "stripe";
import { calculateCost } from "./libs/billing-lib";
import { success, failure } from "./libs/response-lib";
const aws = require('aws-sdk');
const ssm = new aws.SSM();


export async function main(event, context) {
  const { storage, source } = JSON.parse(event.body);
  const amount = calculateCost(storage);
  const description = "Scratch charge";

  const stripeSecretKey = await ssm.getParameter(
    {Name: 'stripeSecretKey', WithDecryption: true}
  ).promise();
  const stripe = Stripe(stripeSecretKey.Parameter.Value);

  try {
    await stripe.charges.create({
      source,
      amount,
      description,
      currency: "usd"
    });
    return success({ status: true });
  } catch (e) {
    return failure({ message: e.message });
  }
}