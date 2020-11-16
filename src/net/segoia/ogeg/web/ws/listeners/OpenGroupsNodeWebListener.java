package net.segoia.ogeg.web.ws.listeners;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import net.segoia.ogeg.node.OpenGroupsNode;

@WebListener
public class OpenGroupsNodeWebListener implements ServletContextListener{

    @Override
    public void contextDestroyed(ServletContextEvent arg0) {
	// TODO Auto-generated method stub
	
    }

    @Override
    public void contextInitialized(ServletContextEvent arg0) {
	/* initialize the node on deploy */
	OpenGroupsNode.getInstance();
	
    }
    
    

}
