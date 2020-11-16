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
package net.segoia.ogeg.services.core.agents;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.segoia.event.conditions.TrueCondition;
import net.segoia.event.eventbus.EventsRepository;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.LocalAgentEventNodeContext;
import net.segoia.event.eventbus.peers.core.EventTransceiver;
import net.segoia.event.eventbus.peers.events.NewPeerEvent;
import net.segoia.event.eventbus.peers.events.PeerLeftEvent;
import net.segoia.event.eventbus.peers.vo.NodeInfo;
import net.segoia.event.eventbus.peers.vo.PeerInfo;
import net.segoia.event.eventbus.peers.vo.bind.ConnectToPeerRequest;
import net.segoia.eventbus.web.ws.v0.WsClientEndpointTransceiver;
import net.segoia.ogeg.node.NodeTypes;
import net.segoia.ogeg.node.vo.core.PeerInteropContext;
import net.segoia.ogeg.node.vo.core.PeerNodeConfig;
import net.segoia.ogeg.node.vo.core.PeerNodeContext;
import net.segoia.ogeg.node.vo.core.PeerNodeDef;
import net.segoia.ogeg.node.vo.core.PeerNodeSettings;
import net.segoia.ogeg.services.chat.events.ChatJoinedEvent;
import net.segoia.ogeg.services.chat.events.ChatLeftEvent;
import net.segoia.ogeg.services.core.events.ServiceNodeData;
import net.segoia.ogeg.services.core.events.ServiceNodeDataEvent;

public class NodeInteroperabilityAgent extends GlobalEventNodeAgent {
    public static final String AGENT_ID = "INTEROP";
    private NodeInteroperabilityConfig config;

    private Map<String, PeerNodeContext> upstreamNodes = new HashMap<>();

    private Map<String, PeerInteropContext> interopPeers = new HashMap<>();

    @Override
    protected void agentInit() {
	EventsRepository.getInstance().load();
	if (config == null) {
	    return;
	}

	List<PeerNodeConfig> upstreamNodes = config.getUpstreamNodes();

	if (upstreamNodes != null && !upstreamNodes.isEmpty()) {
	    /* connect to defined upstream nodes */
	    for (PeerNodeConfig nc : upstreamNodes) {
		addUpstreamNode(nc);
	    }
	}
    }

    @Override
    protected void config() {

    }

    private void addUpstreamNode(PeerNodeConfig peerConfig) {
	try {
	    PeerNodeDef nodeDef = peerConfig.getNodeDef();
	    WsClientEndpointTransceiver clientEndpoint = new WsClientEndpointTransceiver(new URI(nodeDef.getUri()),
		    nodeDef.getChannel());
	    PeerNodeContext peerNodeContext = new PeerNodeContext(peerConfig, clientEndpoint);
	    upstreamNodes.put(peerConfig.getId(), peerNodeContext);

	    /* do further handling of this new peer node */
	    handleNewUpstreamNode(peerNodeContext);

	} catch (URISyntaxException e) {
	    // TODO Auto-generated catch block
	    e.printStackTrace();
	}
    }

    private void handleNewUpstreamNode(PeerNodeContext peerNodeContext) {
	PeerNodeConfig peerConfig = peerNodeContext.getPeerConfig();
	PeerNodeSettings nodeSettings = peerConfig.getNodeSettings();
	if (nodeSettings != null && nodeSettings.isAutoConnect()) {
	    context.getLogger().info(AGENT_ID + ": connecting to node " + peerConfig.getId());
	    connectToNode(peerNodeContext.getClientEndpoint(), peerConfig.getId());
	}
    }

    private void connectToNode(EventTransceiver transceiver, String peerAlias) {
	context.registerToPeer(new ConnectToPeerRequest(transceiver,peerAlias));
    }

    @Override
    protected void registerHandlers() {
	context.addEventHandler(NewPeerEvent.class, (c) -> {
	    NewPeerEvent event = c.getEvent();
	    PeerInfo data = event.getData();
	    String peerId = data.getPeerId();

	    NodeInfo nodeInfo = data.getNodeInfo();
	    if (nodeInfo != null && NodeTypes.SERVICE_NODE.equals(nodeInfo.getNodeType())) {
		if (!interopPeers.containsKey(peerId)) {
		    System.out.println("new service peer " + peerId);
		    interopPeers.put(peerId, new PeerInteropContext());

		    /* allow event forwarding */
		    context.getPeerManager(peerId).getConfig().setEventsForwardingCondition(new TrueCondition());
		    
		    /* advertise the services we're offering */
		    ServiceNodeData serviceNodeData = new ServiceNodeData(context.getNodePublicServices());
		    context.forwardTo(new ServiceNodeDataEvent(serviceNodeData), peerId);
		}
	    }
	});

	context.addEventHandler(PeerLeftEvent.class, (c) -> {
	    PeerLeftEvent event = c.getEvent();
	    PeerInfo data = event.getData();
	    String peerId = data.getPeerId();
	    interopPeers.remove(peerId);
	    String peerAlias = data.getAlias();
	    context.logDebug("Interop peer left "+peerAlias+" -> "+peerId);
	    
	   
	    if(peerAlias != null) {
		PeerNodeContext peerNodeContext = upstreamNodes.get(peerAlias);
		PeerNodeSettings nodeSettings = peerNodeContext.getPeerConfig().getNodeSettings();
		if(peerNodeContext != null && nodeSettings.isAutoReconnect()) {
		    context.logDebug("Reconnecting to peer "+peerAlias);
		    connectToNode(peerNodeContext.getClientEndpoint(), peerAlias);
		}
	    }
	});
	
	context.addEventHandler(ServiceNodeDataEvent.class, (c)->{
	    /* listen for services advertised by peers */
	    ServiceNodeDataEvent event = c.getEvent();
	    PeerInteropContext peerInteropContext = interopPeers.get(event.from());
	    if(peerInteropContext != null) {
		peerInteropContext.setNodeServiceData(event.getData());
		context.logDebug("Got service node data "+event.toJson());
	    }
	});

	/* chat stuff */
	context.addEventHandler(ChatJoinedEvent.class, (c) -> {
	    ChatJoinedEvent event = c.getEvent();
	    String lastRelay = event.getLastRelay();

	    if (!LocalAgentEventNodeContext.LOCAL.equals(event.getHeader().getChannel())) {
		return;
	    }

	    for (String peerId : interopPeers.keySet()) {
		/* check that we didn't get this event via one of the peers */
		if (peerId.equals(lastRelay)) {
		    continue;
		}

		/* check that we don't have a noForward for this peer */
		if (!event.isNoForward(peerId)) {
		    context.getLogger().debug("forwarding chat joined " + event.toJson());
		    /* forward this event to other peers */
		    context.forwardTo(event, peerId);
		}
	    }
	});

	context.addEventHandler(ChatLeftEvent.class, (c) -> {
	    ChatLeftEvent event = c.getEvent();
	    String lastRelay = event.getLastRelay();

	    if (!LocalAgentEventNodeContext.LOCAL.equals(event.getHeader().getChannel())) {
		return;
	    }

	    for (String peerId : interopPeers.keySet()) {
		/* check that we didn't get this event via one of the peers */
		if (peerId.equals(lastRelay)) {
		    continue;
		}

		/* check that we don't have a noForward for this peer */
		if (!event.isNoForward(peerId)) {
		    context.getLogger().debug("forwarding chat joined " + event.toJson());
		    /* forward this event to other peers */
		    context.forwardTo(event, peerId);
		}
	    }
	});
    }

    @Override
    public void terminate() {
	// TODO Auto-generated method stub

    }

}
