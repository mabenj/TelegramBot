import express from "express";
import loglevel from "loglevel";
const router = express.Router();
const logger = loglevel.getLogger("logger");
import { getChat } from "../services/chatService";

interface IChatResponse {
    chatId: string,
    createdById: string,
    chatKey: string,
    creationDate: string
}

router.get("/:chatKey", async (req, res) => {
	const { chatKey } = req.params;
	try {
		if (chatKey) {
			const chat = await getChat(chatKey.toUpperCase());
			if (chat) {
				return res.json(new IChatResonse {
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

export default router;
