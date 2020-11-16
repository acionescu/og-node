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
