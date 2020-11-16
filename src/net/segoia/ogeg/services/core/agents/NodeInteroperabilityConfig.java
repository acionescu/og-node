package net.segoia.ogeg.services.core.agents;

import java.util.List;

import net.segoia.ogeg.node.vo.core.PeerNodeConfig;

public class NodeInteroperabilityConfig {
    /**
     * Nodes we connect to
     */
    private List<PeerNodeConfig> upstreamNodes;

    public List<PeerNodeConfig> getUpstreamNodes() {
        return upstreamNodes;
    }

    public void setUpstreamNodes(List<PeerNodeConfig> upstreamNodes) {
        this.upstreamNodes = upstreamNodes;
    }

    
}
