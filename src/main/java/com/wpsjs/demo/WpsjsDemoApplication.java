package com.wpsjs.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = { "com.wpsjs.demo" })
public class WpsjsDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(WpsjsDemoApplication.class, args);
    }

}
 