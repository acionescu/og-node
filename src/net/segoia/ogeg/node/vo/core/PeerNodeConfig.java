package net.segoia.ogeg.node.vo.core;

/**
 * Provides a full configuration for a peer node
 * @author adi
 *
 */
public class PeerNodeConfig {
    /**
     * An internal id for this node
     */
    private String id;
    
    /**
     * Node definition
     */
    private PeerNodeDef nodeDef;
    
    /**
     * Settings for this node
     */
    private PeerNodeSettings nodeSettings = new PeerNodeSettings();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PeerNodeDef getNodeDef() {
        return nodeDef;
    }

    public void setNodeDef(PeerNodeDef nodeDef) {
        this.nodeDef = nodeDef;
    }

    public PeerNodeSettings getNodeSettings() {
        return nodeSettings;
    }

    public void setNodeSettings(PeerNodeSettings nodeSettings) {
        this.nodeSettings = nodeSettings;
    }
}
