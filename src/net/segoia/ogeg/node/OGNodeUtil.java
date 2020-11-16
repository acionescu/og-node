package net.segoia.ogeg.node;

import net.segoia.event.eventbus.Event;

public class OGNodeUtil {
    public static final String SIGNATURE_SEPARATOR="/";   
    
    public static String getPeerSignatureFromEvent(Event event) {
	String channel = event.getHeader().getChannel();
	String peerId = event.from();
	return channel+SIGNATURE_SEPARATOR+peerId;
    }
    
}
