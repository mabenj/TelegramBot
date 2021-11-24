const ChatKey = require("../models/chatKey");
const logger = require("loglevel").getLogger("logger");

function getChatKey(key) {
	return ChatKey.findOne({ chatKey: key });
}

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
		return savedChat;
	} catch (err) {
		logger.error("Error creating a chat key: ", err);
		return null;
	}
}

module.exports = { getChatKey, createChatKey };
