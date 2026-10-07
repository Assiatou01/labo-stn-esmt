package com.esmt.labstn.document.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ pour le service de gestion des documents.
 * Déclare l'exchange, les queues et les bindings nécessaires
 * pour les notifications liées aux livrables (dépôt, validation).
 */
@Configuration
public class RabbitMQConfig {

    // Exchange partagé par tous les microservices pour les notifications
    public static final String EXCHANGE_NAME = "stn.notifications.exchange";

    // Queues spécifiques au document-service
    public static final String QUEUE_DEPOT_LIVRABLE = "stn.notification.depot.livrable.queue";
    public static final String QUEUE_VALIDATION_LIVRABLE = "stn.notification.validation.livrable.queue";

    // Routing keys
    public static final String ROUTING_KEY_DEPOT = "notification.livrable.depot";
    public static final String ROUTING_KEY_VALIDATION = "notification.livrable.validation";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue depotLivrableQueue() {
        return QueueBuilder.durable(QUEUE_DEPOT_LIVRABLE).build();
    }

    @Bean
    public Queue validationLivrableQueue() {
        return QueueBuilder.durable(QUEUE_VALIDATION_LIVRABLE).build();
    }

    @Bean
    public Binding depotBinding(Queue depotLivrableQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(depotLivrableQueue).to(notificationExchange).with(ROUTING_KEY_DEPOT);
    }

    @Bean
    public Binding validationBinding(Queue validationLivrableQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(validationLivrableQueue).to(notificationExchange).with(ROUTING_KEY_VALIDATION);
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
