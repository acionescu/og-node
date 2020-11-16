/**
 * fruit-fly - A status sharing demo app, built with web-events and websockets
 * Copyright (C) 2016  Adrian Cristian Ionescu - https://github.com/acionescu
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
package net.segoia.ogeg.services.chat.agents;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import net.segoia.event.eventbus.CustomEventContext;
import net.segoia.event.eventbus.Event;
import net.segoia.event.eventbus.EventHeader;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.LocalAgentEventNodeContext;
import net.segoia.event.eventbus.peers.events.PeerLeftEvent;
import net.segoia.event.eventbus.peers.vo.PeerInfo;
import net.segoia.event.eventbus.vo.services.EventNodePublicServiceDesc;
import net.segoia.ogeg.services.chat.events.ChatInitData;
import net.segoia.ogeg.services.chat.events.ChatInitEvent;
import net.segoia.ogeg.services.chat.events.ChatJoinRequest;
import net.segoia.ogeg.services.chat.events.ChatJoinRequestEvent;
import net.segoia.ogeg.services.chat.events.ChatJoinedEvent;
import net.segoia.ogeg.services.chat.events.ChatLeaveRequestEvent;
import net.segoia.ogeg.services.chat.events.ChatLeftEvent;
import net.segoia.ogeg.services.chat.events.ChatMessage;
import net.segoia.ogeg.services.chat.events.ChatMessageEvent;
import net.segoia.ogeg.services.chat.events.ChatPeerData;
import net.segoia.ogeg.services.chat.events.ChatServiceDataView;
import net.segoia.ogeg.services.chat.events.ChatServiceDataViewEvent;
import net.segoia.ogeg.services.chat.events.RemoteChatPeerData;
import net.segoia.ogeg.services.core.events.ServiceNodeData;
import net.segoia.ogeg.services.core.events.ServiceNodeDataEvent;
import net.segoia.util.data.SetMap;
import net.segoia.util.logging.Logger;
import net.segoia.util.logging.MasterLogManager;

public class ChatManagerAgent extends GlobalEventNodeAgent {
    private Logger logger = MasterLogManager.getLogger("ChatManagerAgent");
    /**
     * Keeps active chats by chat key
     */
    private Map<String, Chat> chats;

    /**
     * Keeps the chats where at least one participant is a remote one communicating through the gateway represented by
     * the key of this map
     */
    private SetMap<String, String> chatsForGateways = new SetMap<>();

    public ChatManagerAgent() {
	super();
	// TODO Auto-generated constructor stub
    }

    @Override
    protected void agentInit() {
	// TODO Auto-generated method stub
	chats = new HashMap<>();
    }

    /*
     * (non-Javadoc)
     * 
     * @see net.segoia.event.eventbus.peers.EventNode#registerHandlers()
     */
    @Override
    protected void registerHandlers() {

	context.addEventHandler(PeerLeftEvent.class, (c) -> {

	    PeerLeftEvent event = c.getEvent();
	    String peerId = (String) event.getData().getPeerId();

	    if (chatsForGateways.containsKey(peerId)) {
		/* if this is a gateway peer, remove remote peers using it */
		removePeersForGateway(peerId, event);
	    } else {
		removePeerFromAllChats(peerId);
	    }

	});

	context.addEventHandler(ChatJoinRequestEvent.class, (c) -> {
	    ChatJoinRequestEvent event = c.event();
	    ChatJoinRequest request = event.getData();
	    String chatKey = request.getChatKey();

	   

	    String newPeerId = event.from();
	    
	    String alias = request.getAlias();
	    if(alias == null) {
		alias=newPeerId;
	    }

	    ChatPeerData chatPeerData = new ChatPeerData(chatKey, newPeerId, true, alias);
	    ChatJoinedEvent chatJoinedEvent = new ChatJoinedEvent(chatPeerData);
	    chatJoinedEvent.addNoForward(newPeerId);
	    
	    Set<String> localParticipantsSnapshot = getChatByKey(chatKey).getLocalParticipants();
	    /* notify the current local participants of the new peer */
	    context.forwardTo(chatJoinedEvent, localParticipantsSnapshot);
	    
	    /* add the new peer to the participants set */

	    getChatByKey(chatKey).addLocalParicipant(chatPeerData);

	    List<ChatPeerData> chatParticipants = createParticipantsCopy(getChatParticipants(chatKey));
	    ChatInitEvent chatInitEvent = new ChatInitEvent(chatKey, chatParticipants);
	    /* send a chat init event to the new peer */
	    context.forwardTo(chatInitEvent, newPeerId);

	    /* post the chat joined on local bus */
	    context.postEvent(new ChatJoinedEvent(chatPeerData));

	});

	context.addEventHandler(ChatLeaveRequestEvent.class, (c) -> {
	    ChatLeaveRequestEvent event = c.event();
	    removePeerFromChat(event.getData().getChatKey(), event.from(), true, event);
	});

	context.addEventHandler(ChatMessageEvent.class, (c) -> {

	    ChatMessageEvent event = c.event();
	    ChatMessage data = event.getData();
	    String chatKey = data.getChatKey();
	    Set<String> partnersSnapshot = getChatByKey(chatKey).getLocalParticipants();

	    String senderId = event.from();

	    Chat chat = getChatByKey(chatKey);

	    if (chat == null) {
		logger.warn("Got message for invalid chat " + chatKey);
		return;
	    }

	    RemoteChatPeerData remotePeerData = chat.getRmoteParticipant(event.getLastRelay());

	    if (remotePeerData != null) {
		/* this is a remote peer message */

	    } else {
		/* direct peer message */
		/* check if the sender is in the chat */
		if (!partnersSnapshot.contains(senderId)) {
		    logger.warn("Peer " + senderId + " send rogue message on chat " + chatKey);
		    return;
		}

		/* don't sent the event to the sender */
		event.addNoForward(senderId);

	    }

	    logger.info("forwarding chat message to local partners" + partnersSnapshot);
	    /* forward the message to local participants */
	    context.forwardTo(event, partnersSnapshot);

	    if (remotePeerData != null) {
		/* this is a remote peer message, add no forward for the receiving gateway */
		event.addNoForward(remotePeerData.getGatewayPeerId());

	    }
	    /* forward message to remote participants */
	    context.forwardTo(event, chat.getRemotePeersGateways());

	});

	/* interoperability */
	context.addEventHandler(ChatJoinedEvent.class, (c) -> {

	    ChatJoinedEvent event = c.getEvent();
	    System.out.println("processing chat joined " + event);
	    EventHeader header = event.getHeader();
	    String channel = header.getChannel();
	    if (LocalAgentEventNodeContext.LOCAL.equals(channel)) {
		return;
	    }

	    /* we've got this from a direct peer */
	    if (header.getRelayedBy().size() == 1) {
		addRemoteChatPeer(c);
	    }
	});

	context.addEventHandler(ChatLeftEvent.class, (c) -> {
	    ChatLeftEvent event = c.getEvent();
	    EventHeader header = event.getHeader();
	    String channel = header.getChannel();
	    if (LocalAgentEventNodeContext.LOCAL.equals(channel)) {
		return;
	    }

	    /* we've got this from a direct peer */
	    if (header.getRelayedBy().size() == 1) {
		removeRemotePeer(c);
	    }
	});

	/* sent state to other service nodes */
	context.addEventHandler(ServiceNodeDataEvent.class, (c) -> {
	    Collection<EventNodePublicServiceDesc> ourServices = context.getAgentPublicServices().values();
	    ServiceNodeDataEvent event = c.getEvent();
	    
	    if(!event.from().equals(event.getLastRelay())) {
		/* allow only direct peers */
		return;
	    }
	    
	    ServiceNodeData data = event.getData();
	    if (data != null) {
		List<EventNodePublicServiceDesc> remoteServices = data.getServices();
		EventNodePublicServiceDesc serviceMatch = context.getNodeContext().getServicesManager().getServiceMatch("chatService", ourServices,
			remoteServices);
		if(serviceMatch != null) {
		    /* we're both providing compatible chat services */
		    Map<String, ChatInitData> activeChatsData = getActiveChatsData();
		    if(activeChatsData.size()==0) {
			/* don't send a syncying event if we have no chats */
			return;
		    }
		    
		    ChatServiceDataView chatServiceDataView = new ChatServiceDataView(activeChatsData);
		    /* send sync event */
		    context.forwardTo(new ChatServiceDataViewEvent(chatServiceDataView), event.from());
		}
	    }
	});
	
	context.addEventHandler(ChatServiceDataViewEvent.class,(c)->{
	    ChatServiceDataViewEvent event = c.getEvent();
	    String gatewayPeerId = event.from();
	    if(!gatewayPeerId.equals(event.getLastRelay())) {
		/* allow only direct peers */
		return;
	    }
	    
	    ChatServiceDataView data = event.getData();
	    if(data == null) {
		return;
	    }
	    Map<String, ChatInitData> chatsData = data.getChats();
	    if(chatsData == null) {
		return;
	    }
	    
	    for(ChatInitData cid : chatsData.values()) {
		for(ChatPeerData cpd : cid.getParticipants()) {
		    addRemoteChatPeer(gatewayPeerId, cpd, event);
		}
	    }
	    
	});
    }

    private Map<String, ChatInitData> getActiveChatsData(){
	Map<String, ChatInitData> activeChatsMap=new HashMap<>();
	for(String chatKey : chats.keySet()) {
	    Chat c = getChatByKey(chatKey);
	    Map<String, ChatPeerData> cp = c.getParticipants();
	    activeChatsMap.put(chatKey, new ChatInitData(chatKey, new ArrayList(cp.values())));
	}
	return activeChatsMap;
    }
    
    private void removeRemotePeer(CustomEventContext<ChatLeftEvent> c) {
	ChatLeftEvent event = c.getEvent();
	ChatPeerData data = event.getData();

	/* get local id for remote peer */
	String localId = context.getIdForRemotePeerByPath(event.from(), data.getPeerId());
	if (localId != null) {
	    removePeerFromChat(data.getChatKey(), localId, true, event);
	}

    }

    private String buildLocalIdForRemotePeer(String gatewayPeerId, String remotePeerId) {
	return gatewayPeerId + ":" + remotePeerId;
    }
    
    private void addRemoteChatPeer(String gatewayPeerId, ChatPeerData peerData, Event triggerEvent) {
	/* add a remote peer if none exists */
	String localPeerId = context.addRemotePeer(gatewayPeerId, new PeerInfo(peerData.getPeerId(), "", null), triggerEvent);
//	String localPeerId = buildLocalIdForRemotePeer(gatewayPeerId, peerData.getPeerId());

	String chatKey = peerData.getChatKey();
	/* create a peer data with the local peer id */
	ChatPeerData localPeerData = new ChatPeerData(chatKey, localPeerId, false, peerData.getAlias());

	ChatJoinedEvent chatJoinedEvent = new ChatJoinedEvent(localPeerData);
	/* notify the current local participants of the new peer */
	context.forwardTo(chatJoinedEvent, getChatByKey(chatKey).getLocalParticipants());

	/* add the peer to the chat local view, specifying the source o the event as a gateway peer */
	getChatByKey(chatKey).addRemoteParicipant(new RemoteChatPeerData(localPeerData, gatewayPeerId));
	chatsForGateways.add(gatewayPeerId, chatKey);

	/* post chat joined event for the remote peer that we added */
	ChatJoinedEvent globalChatJoinedEvent = new ChatJoinedEvent(localPeerData);
	/* make sure this message is not sent to the gateway */
	globalChatJoinedEvent.addNoForward(gatewayPeerId);
	triggerEvent.setAsCauseFor(globalChatJoinedEvent);
	context.postEvent(globalChatJoinedEvent);
    }

    private void addRemoteChatPeer(CustomEventContext<ChatJoinedEvent> c) {
	ChatJoinedEvent event = c.getEvent();
	System.out.println("adding remote participant " + event.toJson());

	ChatPeerData peerData = event.getData();

	/* add a remote peer if none exists */
	String gatewayPeerId = event.from();
	addRemoteChatPeer(gatewayPeerId, peerData, event);
	
//	String localPeerId = context.addRemotePeer(gatewayPeerId, new PeerInfo(peerData.getPeerId(), "", null), event);
////	String localPeerId = buildLocalIdForRemotePeer(gatewayPeerId, peerData.getPeerId());
//
//	String chatKey = peerData.getChatKey();
//	/* create a peer data with the local peer id */
//	ChatPeerData localPeerData = new ChatPeerData(chatKey, localPeerId, false, peerData.getAlias());
//
//	ChatJoinedEvent chatJoinedEvent = new ChatJoinedEvent(localPeerData);
//	/* notify the current local participants of the new peer */
//	context.forwardTo(chatJoinedEvent, getChatByKey(chatKey).getLocalParticipants());
//
//	/* add the peer to the chat local view, specifying the source o the event as a gateway peer */
//	getChatByKey(chatKey).addRemoteParicipant(new RemoteChatPeerData(localPeerData, gatewayPeerId));
//	chatsForGateways.add(gatewayPeerId, chatKey);
//
//	/* post chat joined event for the remote peer that we added */
//	ChatJoinedEvent globalChatJoinedEvent = new ChatJoinedEvent(localPeerData);
//	/* make sure this message is not sent to the gateway */
//	globalChatJoinedEvent.addNoForward(gatewayPeerId);
//	event.setAsCauseFor(globalChatJoinedEvent);
//	context.postEvent(globalChatJoinedEvent);
    }

    private List<String> setCopy(Collection<String> source) {
	return new ArrayList((Collection<String>) ((HashSet<String>) source).clone());
    }

    private List<ChatPeerData> createParticipantsCopy(Collection<ChatPeerData> source) {
	return new ArrayList<ChatPeerData>(source);
    }

    /**
     * Remove a peer from chat
     * 
     * @param chatKey
     * @param peerId
     * @param cleanUp
     * @return - true if the chat is empty ( has no more participants ) false otherwise
     */
    private boolean removePeerFromChat(String chatKey, String peerId, boolean cleanUp, Event causeEvent) {
	Chat chat = getChatByKey(chatKey, false);
	if (chat == null) {
	    return false;
	}

	RemoteChatPeerData remotePeer = chat.removeRemoteParticipant(peerId);
	String gatewayPeerId = null;
	if (remotePeer != null) {
	    gatewayPeerId = remotePeer.getGatewayPeerId();
	    /* unregister from this remote peer */
	    context.unregisterFromPeer(peerId);
	} else {
	    chat.removeParticipant(peerId);
	}

	Set<String> ccp = chat.getLocalParticipants();

	boolean removed = false;
	if (ccp.size() > 0) {
	    /* notify local chat partners that the peer left */
	    ChatLeftEvent chatLeftEvent = new ChatLeftEvent(chatKey, peerId);
	    context.forwardTo(chatLeftEvent, ccp);
	} else {
	    if (cleanUp && chat.getParticipants().size() == 0) {
		/* this chat has no participants, remove it */
		removeChat(chatKey);
		removed = true;
	    }
	}

	/* post a global chat left event */
	ChatLeftEvent globalChatLeftEvent = new ChatLeftEvent(chatKey, peerId);
	if (causeEvent != null) {
	    causeEvent.setAsCauseFor(globalChatLeftEvent);
	}

	if (gatewayPeerId != null) {
	    /* if this is a remote peer, make sure we don't send the event back to the gateway */
	    globalChatLeftEvent.addNoForward(gatewayPeerId);
	}
	context.postEvent(globalChatLeftEvent);
	return removed;
    }

    private void removePeerFromAllChats(String peerId) {
	logger.info("Removing peer " + peerId + " from chats.");
	Set<String> chatsToRemove = new HashSet<>();
	chats.keySet().forEach((chatkey) -> {
	    boolean toRemove = removePeerFromChat(chatkey, peerId, false, null);
	    if (toRemove) {
		chatsToRemove.add(chatkey);
	    }
	});

	/* remove unused chats */
	chatsToRemove.forEach((chatKey) -> {
	    removeChat(chatKey);
	});
    }

    private void removePeersForGateway(String gatewayPeerId, Event causeEvent) {
	Set<String> gwChats = chatsForGateways.remove(gatewayPeerId);
	if (gwChats == null) {
	    return;
	}
	context.getLogger().debug("Removing remote peers for gateway " + gatewayPeerId);
	gwChats.forEach((chatKey) -> {
	    Chat c = getChatByKey(chatKey, false);
	    if (c != null) {
		Set<String> peersForGateway = c.getPeersForGateway(gatewayPeerId);
		if (peersForGateway != null) {
		    HashSet<String> toRemove = new HashSet<>(peersForGateway);
		    toRemove.forEach((rid) -> {
			removePeerFromChat(chatKey, rid, true, causeEvent);
		    });
		}
	    }
	});
    }

    private Collection<ChatPeerData> getChatParticipants(String chatKey) {
	return getChatByKey(chatKey).getParticipants().values();
    }

    private Chat getChatByKey(String chatKey, boolean create) {
	Chat chat = chats.get(chatKey);
	if (chat == null && create) {
	    chat = createChatForKey(chatKey);
	    chats.put(chatKey, chat);
	}
	return chat;
    }

    private Chat getChatByKey(String chatKey) {
	return getChatByKey(chatKey, true);
    }

    private Chat createChatForKey(String chatKey) {
	return new Chat(chatKey);
    }

    private Chat removeChat(String chatKey) {
	return chats.remove(chatKey);
    }

    @Override
    public void terminate() {
	// TODO Auto-generated method stub

    }

    @Override
    protected void config() {
	// TODO Auto-generated method stub

    }

}
