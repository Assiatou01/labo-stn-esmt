package com.esmt.labstn.thesis.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ pour le service de gestion des thèses.
 * Déclare l'exchange partagé, les queues et les bindings nécessaires
 * pour les notifications liées aux thèses (création, affectation encadreur).
 */
@Configuration
public class RabbitMQConfig {

    // Exchange partagé par tous les microservices pour les notifications
    public static final String EXCHANGE_NAME = "stn.notifications.exchange";

    // Queue spécifique au thesis-service
    public static final String QUEUE_CREATION_THESE = "stn.notification.creation.these.queue";

    // Routing key
    public static final String ROUTING_KEY_CREATION_THESE = "notification.these.creation";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue creationTheseQueue() {
        return QueueBuilder.durable(QUEUE_CREATION_THESE).build();
    }

    @Bean
    public Binding creationTheseBinding(Queue creationTheseQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(creationTheseQueue).to(notificationExchange).with(ROUTING_KEY_CREATION_THESE);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
