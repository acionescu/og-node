package net.segoia.ogeg.services.core.events;

import java.util.List;

import net.segoia.event.eventbus.vo.services.EventNodePublicServiceDesc;

public class ServiceNodeData {
    private List<EventNodePublicServiceDesc> services;

    public ServiceNodeData(List<EventNodePublicServiceDesc> services) {
	super();
	this.services = services;
    }

    public ServiceNodeData() {
	super();
    }

    public List<EventNodePublicServiceDesc> getServices() {
	return services;
    }

    public void setServices(List<EventNodePublicServiceDesc> services) {
	this.services = services;
    }
}
