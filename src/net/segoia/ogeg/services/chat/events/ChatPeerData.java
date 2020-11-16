/**
 * fruit-fly - A status sharing demo app, built with web-events and websockets
 * Copyright (C) 2016  Adrian Cristian Ionescu - https://github.com/acionescu
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

public class ChatPeerData extends ChatData {
    private String peerId;
    private boolean local;
    private String alias;

    public ChatPeerData() {
	super();
	// TODO Auto-generated constructor stub
    }

    public ChatPeerData(String chatKey, String peerId) {
	super(chatKey);
	this.peerId = peerId;
    }

    public ChatPeerData(String chatKey, String peerId, boolean local, String alias) {
	super(chatKey);
	this.peerId = peerId;
	this.local = local;
	if (alias != null) {
	    this.alias = alias;
	} else {
	    this.alias = peerId;
	}
    }

    /**
     * @return the peerId
     */
    public String getPeerId() {
	return peerId;
    }

    /**
     * @param peerId
     *            the peerId to set
     */
    public void setPeerId(String peerId) {
	this.peerId = peerId;
    }

    public boolean isLocal() {
	return local;
    }

    public void setLocal(boolean local) {
	this.local = local;
    }

    public String getAlias() {
	return alias;
    }

    public void setAlias(String alias) {
	this.alias = alias;
    }
}
