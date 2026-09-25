package com.esmt.labstn.document.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_DOCUMENT = "labstn.document.exchange";
    public static final String QUEUE_DOCUMENT_INDEXING = "labstn.document.indexing.queue";
    public static final String ROUTING_KEY_DOCUMENT_INDEX = "document.index.key";

    @Bean
    public TopicExchange documentExchange() {
        return new TopicExchange(EXCHANGE_DOCUMENT, true, false);
    }

    @Bean
    public Queue documentIndexingQueue() {
        return QueueBuilder.durable(QUEUE_DOCUMENT_INDEXING)
                .build();
    }

    @Bean
    public Binding documentIndexingBinding(Queue documentIndexingQueue, TopicExchange documentExchange) {
        return BindingBuilder.bind(documentIndexingQueue).to(documentExchange).with(ROUTING_KEY_DOCUMENT_INDEX);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
