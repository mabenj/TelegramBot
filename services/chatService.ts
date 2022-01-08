import Chat from "../models/chat";
import loglevel from "loglevel";
const logger = loglevel.getLogger("logger");

function getChat(key: string) {
	return Chat.findOne({ chatKey: key });
}

async function createChat(chatId: string, createdById: string) {
	try {
		const existingChats = await Chat.find({ chatId, createdById });
		for (let i = 0; i < existingChats.length; i++) {
			const existingChat = existingChats[i];
			logger.info(
				`Removing existing chat key '${existingChat.chatKey}' for user '${existingChat.createdById}'`
			);
			existingChat.remove();
		}

		const chat = new Chat({
			chatId: chatId,
			createdById: createdById
		});
		const savedChat = await chat.save();
		return savedChat;
	} catch (err) {
		logger.error("Error creating a chat key: ", err);
		return null;
	}
}

export { getChat, createChat };
