const express = require("express");
const router = express.Router();
const logger = require("loglevel").getLogger("logger");
const { getChat } = require("../services/chatService");

router.get("/:chatKey", async (req, res) => {
	const { chatKey } = req.params;
	try {
		if (chatKey) {
			const chat = await getChat(chatKey.toUpperCase());
			if (chat) {
				return res.json({
					chatId: chat.chatId,
					createdById: chat.createdById,
					chatKey: chat.chatKey,
					creationDate: chat.creationDate
				});
			}
		}
		return res.status(404).send();
	} catch (err) {
		logger.error(`Error getting chat key '${chatKey}': `, err);
		return res.status(500).send();
	}
});

module.exports = router;
