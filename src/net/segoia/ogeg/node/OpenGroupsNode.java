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
package net.segoia.ogeg.node;

import net.segoia.event.eventbus.EBusVM;
import net.segoia.event.eventbus.Event;
import net.segoia.event.eventbus.agents.GlobalAgentRegisterRequest;
import net.segoia.event.eventbus.agents.LocalAgentRegisterRequest;
import net.segoia.event.eventbus.peers.EventNode;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.LocalEventNodeAgent;
import net.segoia.event.eventbus.util.EBus;

public class OpenGroupsNode {
    private static final String defaultConfigFile="opengroups_node.json";
    public static final String CONFIG_FILE_PROPERTY="net.segoia.opengroups.node.config";
    private static OpenGroupsNode instance;
    private EventNode eventNode;

    private OpenGroupsNode() {
	String configFile = System.getProperty(CONFIG_FILE_PROPERTY, defaultConfigFile);
	
	eventNode = EBus.loadNode(configFile).getNode();
	
	EBus.postSystemEvent(new Event("OG:NODE:INIT").addParam("configFile", configFile));
	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(OpenGroupsMobileAppAgent.getInstance()));
//	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new OpenGroupsWebAppAgent()));
//	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new TrustNetworkMainAgent()));
//	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new TrustedCommAgent()));
//	
//	eventNode.registerLocalAgent(new LocalAgentRegisterRequest(new SystemUtilAgent()));
//	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new RemoteAuthMainAgent()));
//	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new ActionsRepositoryAgent()));
//	
//	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new RemoteFlowsManagerAgent()));
    }
    
    public void registerLocalAgent(LocalEventNodeAgent agent) {
	eventNode.registerLocalAgent(new LocalAgentRegisterRequest(agent));
    }
    
    public void registerGlobalAgent(GlobalEventNodeAgent agent) {
	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(agent));
    }

    public static OpenGroupsNode getInstance() {
	if (instance == null) {
	    instance = new OpenGroupsNode();
	}
	return instance;
    }

    public EventNode getEventNode() {
	return eventNode;
    }
}
