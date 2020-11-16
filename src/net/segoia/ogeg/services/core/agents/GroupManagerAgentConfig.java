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
package net.segoia.ogeg.services.core.agents;

import java.util.Arrays;
import java.util.List;

public class GroupManagerAgentConfig {
    private List<String> trustedChannels=Arrays.asList("WSS_V1");

    public List<String> getTrustedChannels() {
        return trustedChannels;
    }

    public void setTrustedChannels(List<String> trustedChannels) {
        this.trustedChannels = trustedChannels;
    }
    
}
