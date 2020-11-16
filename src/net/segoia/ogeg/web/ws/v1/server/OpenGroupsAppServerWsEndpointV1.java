package net.segoia.ogeg.web.ws.v1.server;

import javax.websocket.server.ServerEndpoint;

import net.segoia.eventbus.web.websocket.server.EventNodeEndpointConfigurator;
import net.segoia.ogeg.web.ws.v0.server.OpenGroupsAppServerWsEndpointV0;

@ServerEndpoint(value = "/ws/v1/events", configurator = EventNodeEndpointConfigurator.class)
public class OpenGroupsAppServerWsEndpointV1 extends OpenGroupsAppServerWsEndpointV0 {

    @Override
    public String getChannel() {
	return "WSS_V1";
    }

}
