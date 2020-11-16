package net.segoia.ogeg.node.vo.core;

import net.segoia.ogeg.services.core.events.ServiceNodeData;

public class PeerInteropContext {
    private ServiceNodeData nodeServiceData;

    public ServiceNodeData getNodeServiceData() {
	return nodeServiceData;
    }

    public void setNodeServiceData(ServiceNodeData nodeServiceData) {
	this.nodeServiceData = nodeServiceData;
    }

}
