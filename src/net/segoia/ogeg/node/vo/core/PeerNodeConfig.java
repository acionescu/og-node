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
package net.segoia.ogeg.node.vo.core;

/**
 * Provides a full configuration for a peer node
 * @author adi
 *
 */
public class PeerNodeConfig {
    /**
     * An internal id for this node
     */
    private String id;
    
    /**
     * Node definition
     */
    private PeerNodeDef nodeDef;
    
    /**
     * Settings for this node
     */
    private PeerNodeSettings nodeSettings = new PeerNodeSettings();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PeerNodeDef getNodeDef() {
        return nodeDef;
    }

    public void setNodeDef(PeerNodeDef nodeDef) {
        this.nodeDef = nodeDef;
    }

    public PeerNodeSettings getNodeSettings() {
        return nodeSettings;
    }

    public void setNodeSettings(PeerNodeSettings nodeSettings) {
        this.nodeSettings = nodeSettings;
    }
}
