package com.esmt.labstn.evaluation.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "AI-SERVICE")
public interface IaServiceFeignClient {

    @PostMapping("/api/ai/summary/livrable")
    Map<String, Object>evaluateTrlMaturityWithAi(@RequestBody Map<String, Object> payload);
}
