import mongoose from "mongoose";
import { Account } from "../db/database.js";

export const getBalance = async (req, res) => {
  try {
    const account = Account.findOne({ userId: req.id });
    if (!account) {
      return res.status(404).send({ message: "Account not found" });
    }

    return res.status(200).send({ balance: account.balance });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error checking balance", error: error });
  }
};

export const transferMoney = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { toAccountId, amount } = req.body;
    const myAccount = await Account.findOne({ userId: req._id }).session(
      session,
    );
    if (!myAccount || myAccount.balance < amount) {
      session.abortTransaction();
      return res.status(422).send({ message: "Insufficient Funds" });
    }
    const toAccount = await Account.findOne({ userId: toAccountId }).session(
      session,
    );
    if (!toAccount) {
      //abort transaction if recievers account does not exist
      session.abortTransaction();
      return res.status(422).send({ message: "Reciever's Account not found!" });
    }

    await Account.updateOne(
      { userId: req._id },
      { $inc: { balance: -amount } },
    ).session(session);

    await Account.updateOne(
      { userId: toAccountId },
      { $inc: { balance: amount } },
    ).session(session);

    //commit the transaction
    session.commitTransaction();
    return res.status(200).send({
      message: "Funds Transfered successfully!",
    });
  } catch (error) {
    session.abortTransaction();
    return res.status(500).send({ message: "Error transferring money!" });
  }
};
