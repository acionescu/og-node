package net.segoia.ogeg.node.vo.core;

import net.segoia.eventbus.web.ws.v0.EventNodeWsEndpointTransceiver;

public class PeerNodeContext {
    private PeerNodeConfig peerConfig;
    private EventNodeWsEndpointTransceiver clientEndpoint;

    public PeerNodeContext(PeerNodeConfig peerConfig, EventNodeWsEndpointTransceiver clientEndpoint) {
	super();
	this.peerConfig = peerConfig;
	this.clientEndpoint = clientEndpoint;
    }

    public PeerNodeConfig getPeerConfig() {
        return peerConfig;
    }

    public void setPeerConfig(PeerNodeConfig peerConfig) {
        this.peerConfig = peerConfig;
    }

    public EventNodeWsEndpointTransceiver getClientEndpoint() {
	return clientEndpoint;
    }

    public void setClientEndpoint(EventNodeWsEndpointTransceiver clientEndpoint) {
	this.clientEndpoint = clientEndpoint;
    }

}
