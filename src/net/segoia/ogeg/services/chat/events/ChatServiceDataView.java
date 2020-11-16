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
package net.segoia.ogeg.services.chat.events;

import java.util.Map;

public class ChatServiceDataView {
    private Map<String, ChatInitData> chats;

    public ChatServiceDataView(Map<String, ChatInitData> chats) {
	super();
	this.chats = chats;
    }

    public ChatServiceDataView() {
	super();
    }

    public Map<String, ChatInitData> getChats() {
        return chats;
    }

    public void setChats(Map<String, ChatInitData> chats) {
        this.chats = chats;
    }
    
    
}
