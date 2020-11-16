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
