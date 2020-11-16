package net.segoia.ogeg.web.ws.v0.server;

import javax.websocket.server.ServerEndpoint;

import net.segoia.eventbus.web.websocket.server.EventNodeEndpointConfigurator;
import net.segoia.eventbus.web.ws.v0.ServerWsEndpointV0;
import net.segoia.ogeg.node.OpenGroupsNode;

@ServerEndpoint(value = "/ws/events", configurator = EventNodeEndpointConfigurator.class)
public class OpenGroupsAppServerWsEndpointV0 extends ServerWsEndpointV0{
   
    @Override
    public String getChannel() {
	return "WSS_V0";
    }

    @Override
    protected void initEventNode() {
	setEventNode(OpenGroupsNode.getInstance().getEventNode());
    }
    
    

}
