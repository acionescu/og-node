package net.segoia.ogeg.services.core.events;

import net.segoia.event.eventbus.CustomEvent;
import net.segoia.event.eventbus.EventType;

@EventType("PEER:NODE:DATA")
public class ServiceNodeDataEvent extends CustomEvent<ServiceNodeData> {
    public static final String ET = "PEER:NODE:DATA";

    public ServiceNodeDataEvent(ServiceNodeData data) {
	super(ET, data);
    }

    public ServiceNodeDataEvent() {
	super(ET);
    }
}
