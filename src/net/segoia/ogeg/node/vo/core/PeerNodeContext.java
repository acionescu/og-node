/**
 * og-node - A basic Open Groups node
 * Copyright (C) 2020  Adrian Cristian Ionescu - https://github.com/acionescu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
