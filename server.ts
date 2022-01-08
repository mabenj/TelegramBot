import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import mongoose from "mongoose";
import loglevel from "loglevel";

const app = express();
const logger = loglevel.getLogger("logger");
logger.setLevel("info");

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const { TOKEN, SERVER_URL, MONGO_CONNECTION_STRING, PORT } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const BOT_URI = `/bot/${TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}${BOT_URI}`;

app.use(bodyParser.json());

import botRouter from "./routes/bot";
app.use(BOT_URI, botRouter);

import sendMessageRouter from "./routes/sendMessage";
app.use("/bot/sendMessage", sendMessageRouter);

import chatKeyRouter from "./routes/chatKey";
app.use("/bot/chatKey", chatKeyRouter);

app.listen(PORT || 5000, async () => {
	logger.info("App running on port", process.env.PORT || 5000);
	await init();
});

const init = async () => {

	mongoose.connect(MONGO_CONNECTION_STRING ?? "");
	const db = mongoose.connection;
	db.on("error", (err) => logger.error(err));
	db.once("open", () => logger.info("Connected to database"));

	const res = await axios
		.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
		.catch((err) => logger.error(err));
	if (res?.data?.ok) {
		logger.info(
			`Webhook successfully set to: ${WEBHOOK_URL} (${res.data.description})`
		);
	}
};
