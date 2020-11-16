package net.segoia.ogeg.services.core.agents;

import java.util.Arrays;
import java.util.List;

public class GroupManagerAgentConfig {
    private List<String> trustedChannels=Arrays.asList("WSS_V1");

    public List<String> getTrustedChannels() {
        return trustedChannels;
    }

    public void setTrustedChannels(List<String> trustedChannels) {
        this.trustedChannels = trustedChannels;
    }
    
}
