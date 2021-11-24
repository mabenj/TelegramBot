const express = require("express");
const router = express.Router();
const logger = require("loglevel").getLogger("logger");
const axios = require("axios");
const ChatKey = require("../models/chatKey");

const { TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

router.post("/", async (req, res) => {
	logger.info(req.body);
	const chatId = req.body.message.chat.id;
	const text = req.body.message.text.toLowerCase();
	const senderId = req.body.message.from.id;

	let reply = "";
	switch (text) {
		case "/start":
			reply = "Hommaa ittelles avain /avain";
			break;
		case "/avain":
			const chatKey = await createChatKey(chatId, senderId);
			reply = chatKey === null ? "Ei onnistunu" : `Jäbälle avain: ${chatKey}`;
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

async function createChatKey(chatId, createdById) {
	try {
		const existingChats = await ChatKey.find({ chatId, createdById });
		for (let i = 0; i < existingChats.length; i++) {
			const existingChat = existingChats[i];
			logger.info(
				`Removing existing chat key '${existingChat.chatKey}' for user '${existingChat.createdById}'`
			);
			existingChat.remove();
		}

		const chat = new ChatKey({
			chatId: chatId,
			createdById: createdById
		});
		const savedChat = await chat.save();
		return savedChat.chatKey;
	} catch (err) {
		logger.error("Error creating a chat key: ", err);
		return null;
	}
}

module.exports = router;
