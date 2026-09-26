package com.esmt.labstn.ai;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:db_stn_ia_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/stn-realm",
        "minio.url=http://localhost:9000",
        "minio.access-key=minioadmin",
        "minio.secret-key=minioadmin"
})
class AiServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
