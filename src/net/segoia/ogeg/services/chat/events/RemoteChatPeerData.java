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
