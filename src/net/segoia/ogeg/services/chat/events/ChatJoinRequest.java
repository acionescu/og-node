package net.segoia.ogeg.services.chat.events;

public class ChatJoinRequest {
    private String chatKey;
    private String alias;

    public ChatJoinRequest(String chatKey, String alias) {
	super();
	this.chatKey = chatKey;
	this.alias = alias;
    }

    public ChatJoinRequest() {
	super();
    }

    public String getChatKey() {
	return chatKey;
    }

    public void setChatKey(String chatKey) {
	this.chatKey = chatKey;
    }

    public String getAlias() {
	return alias;
    }

    public void setAlias(String alias) {
	this.alias = alias;
    }

}
