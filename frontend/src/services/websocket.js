import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = {};
        this.connected = false;
    }

    connect(onConnected, onError) {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        
        // Disable debug logging
        this.stompClient.debug = null;

        this.stompClient.connect(
            {},
            () => {
                this.connected = true;
                console.log('WebSocket Connected');
                if (onConnected) onConnected();
            },
            (error) => {
                this.connected = false;
                console.error('WebSocket Error:', error);
                if (onError) onError(error);
                
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connect(onConnected, onError), 5000);
            }
        );
    }

    subscribe(topic, callback) {
        if (!this.connected || !this.stompClient) {
            console.warn('WebSocket not connected');
            return null;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
            const data = JSON.parse(message.body);
            callback(data);
        });

        this.subscriptions[topic] = subscription;
        return subscription;
    }

    unsubscribe(topic) {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
            delete this.subscriptions[topic];
        }
    }

    disconnect() {
        if (this.stompClient && this.stompClient.connected) {
            Object.keys(this.subscriptions).forEach(topic => {
                this.unsubscribe(topic);
            });
            try {
                this.stompClient.disconnect(() => {
                    this.connected = false;
                    console.log('WebSocket Disconnected');
                });
            } catch (e) {
                // ignore disconnect errors when not fully connected
            }
        } else {
            this.connected = false;
        }
    }

    isConnected() {
        return this.connected;
    }

    send(destination, headers, body) {
        if (!this.connected || !this.stompClient) {
            console.warn('WebSocket not connected, cannot send message');
            return false;
        }

        try {
            this.stompClient.send(destination, headers, body);
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

}

export default new WebSocketService();
