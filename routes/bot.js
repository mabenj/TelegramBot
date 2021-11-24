const express = require("express");
const router = express.Router();
const logger = require("loglevel").getLogger("logger");
const axios = require("axios");
const ChatKey = require("../models/chatKey");
const { createChatKey } = require("../services/chatKeyService");

const { TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

router.post("/", async (req, res) => {
	const chatId = req.body.message.chat.id;
	const text = req.body.message.text.toLowerCase();
	const senderId = req.body.message.from.id;

	let reply = "";
	switch (text) {
		case "/start":
			reply = "Hommaa ittelles avain /avain";
			break;
		case "/avain":
			const chat = await createChatKey(chatId, senderId);
			reply = chat === null ? "Ei onnistunu" : `Jäbälle avain: ${chat.chatKey}`;
			break;
		default:
			reply = "hä?";
	}

	try {
		await axios.post(`${TELEGRAM_API}/sendMessage`, {
			chat_id: chatId,
			text: reply
		});
		return res.send();
	} catch (err) {
		logger.error("Error sending a reply: ", err);
	}
});

router.get("/", async (req, res) => {
	const { chatKey } = req.query;
	try {
		if (chatKey) {
			res.json(await ChatKey.find({ chatKey }));
		} else {
			res.json(await ChatKey.find());
		}
	} catch (err) {
		logger.error("Error getting chat keys: ", err);
	}
});

module.exports = router;
