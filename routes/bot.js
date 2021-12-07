const express = require("express");
const router = express.Router();
const logger = require("loglevel").getLogger("logger");
const axios = require("axios");
const Chat = require("../models/chat");
const { createChat } = require("../services/chatService");

const { TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

const DEFAULT_RESPONSES = [
	"hä?",
	"häh?",
	"mitä nää sanoit?",
	"kui?",
	"mitä sää selitäs",
	"sanos uusiks",
	"en tajuu",
	"???",
	"onk pääs vikaa?",
	"ok"
];

router.post("/", async (req, res) => {
	try {
		const chatId = req.body.message.chat.id;
		const text = req.body.message.text?.toLowerCase();
		const senderId = req.body.message.from.id;

		let reply = "";
		switch (text) {
			case "/start":
				reply = "Hommaa ittelles avain /avain";
				break;
			case "/avain":
				const chat = await createChat(chatId, senderId);
				reply =
					chat === null ? "Ei onnistunu" : `Jäbälle avain: ${chat.chatKey}`;
				break;
			default:
				reply =
					DEFAULT_RESPONSES[
						Math.floor(Math.random() * DEFAULT_RESPONSES.length)
					];
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
	} catch {
		return res.status(500).send();
	}
});

module.exports = router;
