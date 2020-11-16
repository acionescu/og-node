package net.segoia.ogeg.services.chat.events;

import net.segoia.event.eventbus.CustomEvent;
import net.segoia.event.eventbus.EventType;

@EventType("PEER:CHAT:SERVICE_VIEW")
public class ChatServiceDataViewEvent extends CustomEvent<ChatServiceDataView>{
    public static final String ET="PEER:CHAT:SERVICE_VIEW";

    public ChatServiceDataViewEvent(ChatServiceDataView data) {
	super(ET, data);
    }
    
    public ChatServiceDataViewEvent() {
	super(ET);
    }
}
