package com.mangalorehomes.propertyweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PropertyWebApiApplication {
  public static void main(String[] args) {
    SpringApplication.run(PropertyWebApiApplication.class, args);
  }
}

