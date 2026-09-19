package com.esmt.labstn.thesis.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "DOCUMENT-SERVICE")
public interface DocumentFeignClient {

    @GetMapping("/api/v1/livrables")
    List<Map<String, Object>> getLivrablesByTheseId(@RequestParam("theseId") Long theseId);
}
