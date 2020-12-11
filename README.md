### Description

A basic Open Groups node deployable in an application container (e.g. Tomcat). 
This is build upon the [event node](https://github.com/acionescu/event-bus) framework.

It also has a [standalone flavour](https://github.com/acionescu/og-node-standalone).

### Properties

* The nodes can connect to each other forming a loose fediverse
* Each node identifies by its own private/public key pair
* Nodes can communicate via an encrypted connection
* All communication is event based
* Each node can provide custom services by implementing their own event processing agents
* There's a security layer where event filtering and special rules can be implemented


#### The chat service

The default implementation provides a basic demo of a federated chat service similar to IRC. 

Each node acts like a server. A node can connect to other nodes to extend its network.
A user connects to a server node via a web app, also available in this project.
All users in the extended network can talk to each other in channels identified by a key.
Users can join a public channel if they leave the channel key empty.

This is extremely rudimentary, it just serves as a proof of concept.
Nonetheless, it can be quite useful and fun.
