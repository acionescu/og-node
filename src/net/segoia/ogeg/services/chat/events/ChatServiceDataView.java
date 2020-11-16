package net.segoia.ogeg.services.chat.events;

import java.util.Map;

public class ChatServiceDataView {
    private Map<String, ChatInitData> chats;

    public ChatServiceDataView(Map<String, ChatInitData> chats) {
	super();
	this.chats = chats;
    }

    public ChatServiceDataView() {
	super();
    }

    public Map<String, ChatInitData> getChats() {
        return chats;
    }

    public void setChats(Map<String, ChatInitData> chats) {
        this.chats = chats;
    }
    
    
}
