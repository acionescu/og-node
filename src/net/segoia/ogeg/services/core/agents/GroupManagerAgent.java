package net.segoia.ogeg.services.core.agents;

import java.util.ArrayList;
import java.util.List;

import net.segoia.event.conditions.Condition;
import net.segoia.event.conditions.OrCondition;
import net.segoia.event.conditions.StrictChannelMatchCondition;
import net.segoia.event.eventbus.CustomEventContext;
import net.segoia.event.eventbus.FilteringEventBus;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.events.PeerAcceptedEvent;
import net.segoia.event.eventbus.peers.events.PeerLeftEvent;
import net.segoia.util.data.repository.ObjectsRepository;

public class GroupManagerAgent extends GlobalEventNodeAgent {
    private GroupManagerAgentConfig config;
    
    private ObjectsRepository<PeerSecurityContext> peersRepository = new ObjectsRepository<>();
    
    public static final String PEER_SIGNATURE="peerSignature";
    public static final String CHANNEL="channel";
    public static final String PEER_ID="peerId";

    @Override
    protected void agentInit() {
	// TODO Auto-generated method stub

    }

    @Override
    protected void config() {
	peersRepository.addIndexProperty(CHANNEL);
	peersRepository.addIndexProperty(PEER_ID);

    }

    @Override
    protected void registerHandlers() {
	List<String> trustedChannels = config.getTrustedChannels();
	List<Condition> chanelsCond = new ArrayList<>();

	for (String tc : trustedChannels) {
	    chanelsCond.add(new StrictChannelMatchCondition(tc));
	}

	FilteringEventBus trustedBus = context
		.getEventBusForCondition(new OrCondition(chanelsCond.toArray(new Condition[0])));
	
	context.addEventHandler(PeerAcceptedEvent.class, (c) -> {
	   handleNewPeer(c);
	});

	context.addEventHandler(PeerLeftEvent.class, (c) -> {
	    handlePeerLeft(c);
	});
	
    }
    
    private void handleNewPeer(CustomEventContext<PeerAcceptedEvent> c) {
	PeerAcceptedEvent event = c.getEvent();
	 String peerId = event.getData().getPeerId();
	 /* see if we already have a peer with this signature.  */
	 PeerSecurityContext securityContext = peersRepository.getSingleObjectForProperty(PEER_ID, peerId);
	 
	 if(securityContext == null) {
	    securityContext = new PeerSecurityContext(event.getHeader().getChannel(), event.from());
	    
	    peersRepository.addObject(securityContext);
	 }
	 
	 securityContext.setLastConnectionTs(System.currentTimeMillis());
	 
    }
    
    private void handlePeerLeft(CustomEventContext<PeerLeftEvent> c) {
	
    }

    @Override
    public void terminate() {
	// TODO Auto-generated method stub

    }

}
