package net.segoia.ogeg.services.core.agents;

/**
 * Encapsulates all the relevant data associated with a peer
 * 
 * @author adi
 *
 */
public class PeerSecurityContext {
    private String channel;
    private String peerId;
    private long lastConnectionTs;
    private long firstConnectionTs;

    public PeerSecurityContext(String channel, String peerId) {
	super();
	this.channel = channel;
	this.peerId = peerId;
    }

    public PeerSecurityContext() {
	super();
	// TODO Auto-generated constructor stub
    }

    public String getChannel() {
	return channel;
    }

    public void setChannel(String channel) {
	this.channel = channel;
    }

    public String getPeerId() {
	return peerId;
    }

    public void setPeerId(String peerId) {
	this.peerId = peerId;
    }

    public long getLastConnectionTs() {
	return lastConnectionTs;
    }

    public void setLastConnectionTs(long lastConnectionTs) {
	this.lastConnectionTs = lastConnectionTs;
    }

    public long getFirstConnectionTs() {
	return firstConnectionTs;
    }

    public void setFirstConnectionTs(long firstConnectionTs) {
	this.firstConnectionTs = firstConnectionTs;
    }
}
