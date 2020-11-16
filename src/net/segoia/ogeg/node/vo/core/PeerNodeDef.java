package net.segoia.ogeg.node.vo.core;

public class PeerNodeDef {
    /**
     * Connection address for this node
     */
    private String uri;
    /**
     * The channel used to connect to this node
     */
    private String channel;

    /**
     * The type of the node
     */
    private String nodeType;

    public String getUri() {
	return uri;
    }

    public void setUri(String uri) {
	this.uri = uri;
    }

    public String getChannel() {
	return channel;
    }

    public void setChannel(String channel) {
	this.channel = channel;
    }

    public String getNodeType() {
	return nodeType;
    }

    public void setNodeType(String nodeType) {
	this.nodeType = nodeType;
    }
}
