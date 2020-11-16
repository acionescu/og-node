package net.segoia.ogeg.services.chat.events;

public class RemoteChatPeerData {
    private ChatPeerData peerData;
    private String gatewayPeerId;
    
    public RemoteChatPeerData() {
	super();
	// TODO Auto-generated constructor stub
    }
    public RemoteChatPeerData(ChatPeerData peerData, String gatewayPeerId) {
	super();
	this.peerData = peerData;
	this.gatewayPeerId = gatewayPeerId;
    }
    public ChatPeerData getPeerData() {
        return peerData;
    }
    public void setPeerData(ChatPeerData peerData) {
        this.peerData = peerData;
    }
    public String getGatewayPeerId() {
        return gatewayPeerId;
    }
    public void setGatewayPeerId(String gatewayPeerId) {
        this.gatewayPeerId = gatewayPeerId;
    }
    
    
}
