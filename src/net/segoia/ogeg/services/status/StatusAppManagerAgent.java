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
package net.segoia.ogeg.services.status;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import net.segoia.event.eventbus.Event;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.events.NewPeerEvent;
import net.segoia.event.eventbus.peers.events.PeerLeftEvent;
import net.segoia.event.eventbus.peers.vo.NodeInfo;
import net.segoia.event.eventbus.peers.vo.PeerInfo;
import net.segoia.ogeg.node.NodeTypes;
import net.segoia.ogeg.services.status.events.GetRecentActivityRequestEvent;
import net.segoia.ogeg.services.status.events.PeerReplaceAccepted;
import net.segoia.ogeg.services.status.events.PeerReplaceData;
import net.segoia.ogeg.services.status.events.PeerReplaceDenied;
import net.segoia.ogeg.services.status.events.PeersViewUpdateEvent;
import net.segoia.ogeg.services.status.events.RecentActivityEvent;
import net.segoia.ogeg.services.status.events.RefreshPeersRequestEvent;
import net.segoia.ogeg.services.status.events.ReplacePeerRequestEvent;
import net.segoia.ogeg.services.status.events.StatusAppInitEvent;
import net.segoia.util.data.LRUCache;
import net.segoia.util.logging.Logger;
import net.segoia.util.logging.MasterLogManager;

public class StatusAppManagerAgent extends GlobalEventNodeAgent {
    private Logger logger = MasterLogManager.getLogger("StatusAppManagerAgent");

    private LRUCache<String, PeerStatusView> recentPeers;

    private Set<String> allPeersIds;
    
    /* how many peers can a user follow */
    public static int maxPartnersPerUser = 5;
    public static int maxQuoteAgents = maxPartnersPerUser + 1;
    public static int maxStatusLength=500;

    public static StatusAppStats stats = new StatusAppStats();

    public static final String STATUS = "status";

    @Override
    protected void agentInit() {
	recentPeers = new LRUCache<>(maxPartnersPerUser);
	allPeersIds = new HashSet<>();

    }

    @Override
    protected void config() {
	/* we want to handle all incoming events */

    }

    @Override
    protected void registerHandlers() {

	/* cache the last N updates */
	context.addEventHandler("PEER:STATUS:UPDATED", (c) -> {
	    Event event = c.getEvent();
	    String peerId = event.from();
	    updateRecentPeers(peerId, new PeerStatusView(peerId, (String) event.getParam(STATUS)));

	});

	/* send init info to new peers */

	context.addEventHandler(NewPeerEvent.class, (c) -> {
	    
	    
	    NewPeerEvent event = c.getEvent();
	    PeerInfo data = event.getData();
	    NodeInfo nodeInfo = data.getNodeInfo();
	    if(nodeInfo != null && nodeInfo.getNodeType() != null) {
		/* process only simple client nodes */
		return;
	    }
	    
	    String peerId = (String) data.getPeerId();
	    logger.info("Got new peer "+event.toJson());
	    Map<String, PeerStatusView> peersCopy = recentPeersSnapshot();
	    StatusAppModel model = new StatusAppModel(peerId, "Hi, I'm visitor " + stats.newPeer(),
		    peersCopy);
	    StatusAppInitEvent appInitEvent = new StatusAppInitEvent(model);

	    context.forwardTo(appInitEvent, peerId);
	    /* update peers */
	    updateRecentPeers(peerId, new PeerStatusView(peerId, model.getStatus()));

	    /* keep this node's id */
	    allPeersIds.add(peerId);

	});

	context.addEventHandler(PeerLeftEvent.class, (c) -> {
	    PeerLeftEvent event = c.getEvent();
	    PeerInfo data = event.getData();
	    NodeInfo nodeInfo = data.getNodeInfo();
	    if(nodeInfo != null && nodeInfo.getNodeType() != null) {
		return;
	    }
	    
	    String peerId = (String) data.getPeerId();

	    recentPeers.remove(peerId);
	    allPeersIds.remove(peerId);
	    
	    stats.peerRemoved();
	});

	context.addEventHandler(RefreshPeersRequestEvent.class, (c) -> {
	    Map<String, PeerStatusView> peersCopy = recentPeersSnapshot();

	    PeersViewUpdateEvent pvue = new PeersViewUpdateEvent(peersCopy);

	    context.forwardTo(pvue, c.getEvent().from());

	});

	context.addEventHandler(GetRecentActivityRequestEvent.class, (c) -> {
	    Map<String, PeerStatusView> peersCopy = recentPeersSnapshot();

	    RecentActivityEvent rae = new RecentActivityEvent(peersCopy);

	    context.forwardTo(rae, c.getEvent().from());
	});

	context.addEventHandler(ReplacePeerRequestEvent.class, (c) -> {
	    ReplacePeerRequestEvent event = c.event();
	    PeerReplaceData data = event.getData();
	    String newPeerId = data.getNewPeerId();

	    /* check if the required peer is actually present */
	    if (allPeersIds.contains(newPeerId)) {

		context.forwardTo(new PeerReplaceAccepted(data), event.from());
	    } else {
		/* deny replace if the requested peer is not present */
		context.forwardTo(new PeerReplaceDenied(data, "Unknown peer id"), event.from());
	    }
	});
    }

    private void updateRecentPeers(String peerId, PeerStatusView status) {
	recentPeers.put(peerId, status);
    }

    private Map<String, PeerStatusView> recentPeersSnapshot() {
	Map<String, PeerStatusView> peersCopy = null;
	synchronized (recentPeers) {
	    peersCopy = (Map<String, PeerStatusView>) recentPeers.clone();
	}
	return peersCopy;
    }

    @Override
    public void terminate() {
	// TODO Auto-generated method stub

    }

}
