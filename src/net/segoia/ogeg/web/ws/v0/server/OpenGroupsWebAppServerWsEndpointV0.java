package net.segoia.ogeg.web.ws.v0.server;

import javax.websocket.server.ServerEndpoint;

import net.segoia.eventbus.web.websocket.server.EventNodeEndpointConfigurator;

@ServerEndpoint(value = "/ws/v0/events", configurator = EventNodeEndpointConfigurator.class)
public class OpenGroupsWebAppServerWsEndpointV0 extends OpenGroupsAppServerWsEndpointV0 {

    @Override
    protected void init() {
	super.init();

	setMaxAllowedActivity(1000);
    }

    @Override
    public String getChannel() {
	return "WSS_WEB_V0";
    }

}
